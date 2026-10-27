/**
 * NMIMS GPA & Grading Engine
 * Strict implementation of official NMIMS evaluation rules and exact DP target optimizer.
 */

export type CourseType = 'standard' | 'ica_only';

export type GradeLetter = 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'P' | 'F' | 'AB';

export interface GradeInfo {
  grade: GradeLetter;
  points: number;
  minMarks: number;
  label: string;
}

export const GRADE_SCALE: GradeInfo[] = [
  { grade: 'O', points: 10, minMarks: 90, label: 'Outstanding' },
  { grade: 'A+', points: 9, minMarks: 80, label: 'Excellent' },
  { grade: 'A', points: 8, minMarks: 70, label: 'Very Good' },
  { grade: 'B+', points: 7, minMarks: 60, label: 'Good' },
  { grade: 'B', points: 6, minMarks: 55, label: 'Above Average' },
  { grade: 'C', points: 5, minMarks: 50, label: 'Average' },
  { grade: 'P', points: 4, minMarks: 40, label: 'Pass' },
  { grade: 'F', points: 0, minMarks: 0, label: 'Fail' },
];

export interface Course {
  id: string;
  code: string;
  name: string;
  type: CourseType;
  credits: number;
  icaMarks: number; // 0 to 50
  seeMarks: number; // 0 to 100 (for standard course)
  isLocked: boolean; // if true, optimizer does not alter marks
  isAbsent?: boolean;
}

export interface CourseEvaluation {
  courseId: string;
  finalPercentage: number;
  grade: GradeLetter;
  gradePoints: number;
  weightedPoints: number;
  isIcaPassed: boolean;
  isSeePassed: boolean;
  isPassed: boolean;
  warning?: string;
}

export interface SemesterTelemetry {
  totalCredits: number;
  earnedGradePoints: number;
  sgpa: number;
  courseEvaluations: Record<string, CourseEvaluation>;
  hasFailures: boolean;
  failedCoursesCount: number;
  passingCredits: number;
}

export interface CourseRecommendation {
  courseId: string;
  recommendedIca: number;
  recommendedSee: number;
  recommendedPercentage: number;
  recommendedGrade: GradeLetter;
  recommendedPoints: number;
  icaDelta: number;
  seeDelta: number;
  pointsDelta: number;
}

export interface TargetPlanResult {
  feasible: boolean;
  targetSgpa: number;
  projectedSgpa: number;
  totalAdditionalMarksNeeded: number;
  recommendations: Record<string, CourseRecommendation>;
  message: string;
}

/**
 * Evaluates an individual course under NMIMS criteria
 */
export function evaluateCourse(course: Course): CourseEvaluation {
  if (course.isAbsent) {
    return {
      courseId: course.id,
      finalPercentage: 0,
      grade: 'AB',
      gradePoints: 0,
      weightedPoints: 0,
      isIcaPassed: false,
      isSeePassed: false,
      isPassed: false,
      warning: 'Absent in Examination',
    };
  }

  const isIcaOnly = course.type === 'ica_only';
  const ica = Math.max(0, Math.min(50, Math.round(course.icaMarks || 0)));
  const see = Math.max(0, Math.min(100, Math.round(course.seeMarks || 0)));

  const isIcaPassed = ica >= 20;
  const isSeePassed = isIcaOnly ? true : see >= 40;

  let finalPercentage = 0;
  if (isIcaOnly) {
    finalPercentage = ica * 2;
  } else {
    finalPercentage = ica + (see / 2);
  }

  // Round final percentage to nearest integer or 2 decimal places as per NMIMS conventions
  finalPercentage = Math.round(finalPercentage * 100) / 100;

  // Check component failures
  let warning: string | undefined = undefined;
  if (!isIcaPassed && !isSeePassed) {
    warning = 'Failed both ICA (<20) and SEE (<40)';
  } else if (!isIcaPassed) {
    warning = 'Failed ICA threshold (<20/50)';
  } else if (!isSeePassed) {
    warning = 'Failed SEE threshold (<40/100)';
  }

  const isPassed = isIcaPassed && isSeePassed && finalPercentage >= 40;

  if (!isPassed) {
    return {
      courseId: course.id,
      finalPercentage,
      grade: 'F',
      gradePoints: 0,
      weightedPoints: 0,
      isIcaPassed,
      isSeePassed,
      isPassed: false,
      warning: warning || 'Overall marks below 40%',
    };
  }

  // Determine Grade Letter
  let grade: GradeLetter = 'P';
  let gradePoints = 4;

  for (const scale of GRADE_SCALE) {
    if (finalPercentage >= scale.minMarks) {
      grade = scale.grade;
      gradePoints = scale.points;
      break;
    }
  }

  const weightedPoints = gradePoints * course.credits;

  return {
    courseId: course.id,
    finalPercentage,
    grade,
    gradePoints,
    weightedPoints,
    isIcaPassed,
    isSeePassed,
    isPassed: true,
  };
}

/**
 * Computes semester telemetry from list of courses
 */
export function computeSemesterTelemetry(courses: Course[]): SemesterTelemetry {
  let totalCredits = 0;
  let earnedGradePoints = 0;
  let failedCoursesCount = 0;
  let passingCredits = 0;
  const courseEvaluations: Record<string, CourseEvaluation> = {};

  for (const course of courses) {
    totalCredits += course.credits;
    const evaluation = evaluateCourse(course);
    courseEvaluations[course.id] = evaluation;

    earnedGradePoints += evaluation.weightedPoints;
    if (evaluation.isPassed) {
      passingCredits += course.credits;
    } else {
      failedCoursesCount += 1;
    }
  }

  const sgpa = totalCredits > 0 ? earnedGradePoints / totalCredits : 0;
  // Precision rounded to 2 decimal places
  const roundedSgpa = Math.round(sgpa * 100) / 100;

  return {
    totalCredits,
    earnedGradePoints,
    sgpa: roundedSgpa,
    courseEvaluations,
    hasFailures: failedCoursesCount > 0,
    failedCoursesCount,
    passingCredits,
  };
}

/**
 * Calculates the exact minimum SEE marks required for a standard course to reach target Grade Point
 */
export function minSeeForGrade(ica: number, targetGradePoint: number): number | null {
  const scale = GRADE_SCALE.find((s) => s.points === targetGradePoint);
  if (!scale) return null;

  // Final% = ICA + SEE/2 >= minMarks => SEE >= 2 * (minMarks - ICA)
  const requiredSee = Math.max(40, Math.ceil(2 * (scale.minMarks - ica)));
  if (requiredSee > 100) return null; // Impossible because SEE max is 100
  return requiredSee;
}

/**
 * Calculates the exact minimum ICA marks required for an ICA-only course to reach target Grade Point
 */
export function minIcaOnlyForGrade(targetGradePoint: number): number | null {
  const scale = GRADE_SCALE.find((s) => s.points === targetGradePoint);
  if (!scale) return null;

  // Final% = ICA * 2 >= minMarks => ICA >= ceil(minMarks / 2)
  const requiredIca = Math.max(20, Math.ceil(scale.minMarks / 2));
  if (requiredIca > 50) return null;
  return requiredIca;
}

/**
 * Dynamic Programming Target Optimizer:
 * Finds the minimum mark jump distribution to achieve target SGPA
 * while respecting locked courses and component passing thresholds.
 */
export function optimizeForTargetSgpa(
  courses: Course[],
  targetSgpa: number
): TargetPlanResult {
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  if (totalCredits === 0) {
    return {
      feasible: false,
      targetSgpa,
      projectedSgpa: 0,
      totalAdditionalMarksNeeded: 0,
      recommendations: {},
      message: 'No courses available for optimization',
    };
  }

  const targetWeightedGp = Math.ceil(targetSgpa * totalCredits - 1e-6);
  const maxPossibleGp = totalCredits * 10;

  if (targetWeightedGp > maxPossibleGp) {
    return {
      feasible: false,
      targetSgpa,
      projectedSgpa: 10,
      totalAdditionalMarksNeeded: 0,
      recommendations: {},
      message: 'Target exceeds maximum possible SGPA (10.00)',
    };
  }

  // Identify locked vs unlocked courses
  let lockedGp = 0;
  const unlockedCourses: Course[] = [];
  const baseEvaluations: Record<string, CourseEvaluation> = {};

  for (const c of courses) {
    const evalResult = evaluateCourse(c);
    baseEvaluations[c.id] = evalResult;
    if (c.isLocked) {
      lockedGp += evalResult.weightedPoints;
    } else {
      unlockedCourses.push(c);
    }
  }

  const neededUnlockedGp = Math.max(0, targetWeightedGp - lockedGp);

  // For each unlocked course, generate options: achievable (gradePoint, costInMarks, recommendedMarks)
  interface GradeOption {
    gradePoint: number;
    weightedGp: number;
    cost: number;
    recommendedIca: number;
    recommendedSee: number;
    finalPercentage: number;
    gradeLetter: GradeLetter;
  }

  const courseOptions: { course: Course; options: GradeOption[] }[] = [];

  for (const course of unlockedCourses) {
    const isIcaOnly = course.type === 'ica_only';
    const currentIca = Math.max(0, Math.min(50, Math.round(course.icaMarks || 0)));
    const currentSee = Math.max(0, Math.min(100, Math.round(course.seeMarks || 0)));
    const currentEval = baseEvaluations[course.id];

    const options: GradeOption[] = [];

    // Always include current state as 0-cost if already passing, or minimum passing state
    if (currentEval.isPassed) {
      options.push({
        gradePoint: currentEval.gradePoints,
        weightedGp: currentEval.gradePoints * course.credits,
        cost: 0,
        recommendedIca: currentIca,
        recommendedSee: currentSee,
        finalPercentage: currentEval.finalPercentage,
        gradeLetter: currentEval.grade,
      });
    }

    // Try all valid passing grade levels (4 to 10)
    for (let gp = 4; gp <= 10; gp++) {
      const scale = GRADE_SCALE.find((s) => s.points === gp);
      if (!scale) continue;

      if (isIcaOnly) {
        const reqIca = minIcaOnlyForGrade(gp);
        if (reqIca !== null) {
          const cost = Math.max(0, reqIca - currentIca);
          options.push({
            gradePoint: gp,
            weightedGp: gp * course.credits,
            cost,
            recommendedIca: reqIca,
            recommendedSee: 0,
            finalPercentage: reqIca * 2,
            gradeLetter: scale.grade,
          });
        }
      } else {
        // Standard course: keep ICA fixed unless ICA < 20 (must bring to 20)
        const targetIca = Math.max(20, currentIca);
        const reqSee = minSeeForGrade(targetIca, gp);
        if (reqSee !== null) {
          const seeCost = Math.max(0, reqSee - currentSee);
          const icaCost = Math.max(0, targetIca - currentIca);
          const totalCost = seeCost + icaCost * 2; // slight weight to SEE vs ICA
          options.push({
            gradePoint: gp,
            weightedGp: gp * course.credits,
            cost: totalCost,
            recommendedIca: targetIca,
            recommendedSee: reqSee,
            finalPercentage: Math.round((targetIca + reqSee / 2) * 100) / 100,
            gradeLetter: scale.grade,
          });
        }
      }
    }

    // Deduplicate options by gradePoint, keeping minimum cost
    const bestByGp: Record<number, GradeOption> = {};
    for (const opt of options) {
      if (!bestByGp[opt.gradePoint] || opt.cost < bestByGp[opt.gradePoint].cost) {
        bestByGp[opt.gradePoint] = opt;
      }
    }

    const uniqueOptions = Object.values(bestByGp).sort((a, b) => a.gradePoint - b.gradePoint);
    if (uniqueOptions.length > 0) {
      courseOptions.push({ course, options: uniqueOptions });
    }
  }

  // Unlocked capacity check
  const maxUnlockedCapacity = courseOptions.reduce(
    (sum, co) => sum + co.course.credits * 10,
    0
  );

  if (neededUnlockedGp > maxUnlockedCapacity) {
    return {
      feasible: false,
      targetSgpa,
      projectedSgpa: (lockedGp + maxUnlockedCapacity) / totalCredits,
      totalAdditionalMarksNeeded: 0,
      recommendations: {},
      message: 'Target is mathematically unreachable even with 10.0 in all unlocked courses. Try unlocking more courses.',
    };
  }

  // DP optimization to minimize total mark increase
  // dp[courseIdx][currentWeightedGp] = minCost
  const N = courseOptions.length;
  if (N === 0) {
    const currentSgpa = lockedGp / totalCredits;
    return {
      feasible: currentSgpa >= targetSgpa,
      targetSgpa,
      projectedSgpa: currentSgpa,
      totalAdditionalMarksNeeded: 0,
      recommendations: {},
      message: currentSgpa >= targetSgpa ? 'Target already achieved!' : 'All courses are locked.',
    };
  }

  // Maximum possible unlocked weighted points
  const MAX_WGP = maxUnlockedCapacity;
  const INF = 1e9;

  let dp: number[] = new Array(MAX_WGP + 1).fill(INF);
  // parent tracking for backtracking: parent[i][wgp] = optionIndex
  const parent: number[][] = Array.from({ length: N }, () => new Array(MAX_WGP + 1).fill(-1));

  // Initialize with first course
  for (let o = 0; o < courseOptions[0].options.length; o++) {
    const opt = courseOptions[0].options[o];
    if (opt.cost < dp[opt.weightedGp]) {
      dp[opt.weightedGp] = opt.cost;
      parent[0][opt.weightedGp] = o;
    }
  }

  // Transition through courses
  for (let i = 1; i < N; i++) {
    const nextDp: number[] = new Array(MAX_WGP + 1).fill(INF);
    const { options } = courseOptions[i];

    for (let prevW = 0; prevW <= MAX_WGP; prevW++) {
      if (dp[prevW] >= INF) continue;

      for (let o = 0; o < options.length; o++) {
        const opt = options[o];
        const nextW = prevW + opt.weightedGp;
        if (nextW > MAX_WGP) continue;

        const newCost = dp[prevW] + opt.cost;
        if (newCost < nextDp[nextW]) {
          nextDp[nextW] = newCost;
          parent[i][nextW] = o;
        }
      }
    }

    dp = nextDp;
  }

  // Find best wgp >= neededUnlockedGp with minimal cost
  let bestWgp = -1;
  let minCost = INF;

  for (let w = neededUnlockedGp; w <= MAX_WGP; w++) {
    if (dp[w] < minCost) {
      minCost = dp[w];
      bestWgp = w;
    }
  }

  if (bestWgp === -1 || minCost >= INF) {
    return {
      feasible: false,
      targetSgpa,
      projectedSgpa: (lockedGp + neededUnlockedGp) / totalCredits,
      totalAdditionalMarksNeeded: 0,
      recommendations: {},
      message: 'Could not construct a feasible plan within mark boundaries',
    };
  }

  // Backtrack chosen options
  const chosenOptions: GradeOption[] = new Array(N);
  let currentW = bestWgp;

  for (let i = N - 1; i >= 0; i--) {
    const optIdx = parent[i][currentW];
    const opt = courseOptions[i].options[optIdx];
    chosenOptions[i] = opt;
    currentW -= opt.weightedGp;
  }

  // Assemble recommendations
  const recommendations: Record<string, CourseRecommendation> = {};
  let totalAddMarks = 0;

  for (let i = 0; i < N; i++) {
    const { course } = courseOptions[i];
    const opt = chosenOptions[i];
    const currentEval = baseEvaluations[course.id];

    const icaDelta = opt.recommendedIca - course.icaMarks;
    const seeDelta = opt.recommendedSee - (course.type === 'standard' ? course.seeMarks : 0);
    const pointsDelta = opt.gradePoint - currentEval.gradePoints;

    if (icaDelta > 0) totalAddMarks += icaDelta;
    if (seeDelta > 0) totalAddMarks += seeDelta;

    recommendations[course.id] = {
      courseId: course.id,
      recommendedIca: opt.recommendedIca,
      recommendedSee: opt.recommendedSee,
      recommendedPercentage: opt.finalPercentage,
      recommendedGrade: opt.gradeLetter,
      recommendedPoints: opt.gradePoint,
      icaDelta,
      seeDelta,
      pointsDelta,
    };
  }

  const projectedSgpa = Math.round(((lockedGp + bestWgp) / totalCredits) * 100) / 100;

  return {
    feasible: true,
    targetSgpa,
    projectedSgpa,
    totalAdditionalMarksNeeded: totalAddMarks,
    recommendations,
    message: `Optimal plan found. +${totalAddMarks} marks needed across ${unlockedCourses.length} unlocked course(s).`,
  };
}

/**
 * Standard NMIMS engineering sample semester curriculum
 */
export const DEFAULT_NMIMS_COURSES: Course[] = [
  {
    id: 'c-1',
    code: 'CS401',
    name: 'Design & Analysis of Algorithms',
    type: 'standard',
    credits: 4,
    icaMarks: 38,
    seeMarks: 72,
    isLocked: false,
  },
  {
    id: 'c-2',
    code: 'CS402',
    name: 'Computer Architecture & Org',
    type: 'standard',
    credits: 3,
    icaMarks: 34,
    seeMarks: 64,
    isLocked: false,
  },
  {
    id: 'c-3',
    code: 'MA401',
    name: 'Applied Linear Algebra & Stats',
    type: 'standard',
    credits: 4,
    icaMarks: 41,
    seeMarks: 82,
    isLocked: false,
  },
  {
    id: 'c-4',
    code: 'CS403',
    name: 'Database Management Systems',
    type: 'standard',
    credits: 3,
    icaMarks: 36,
    seeMarks: 68,
    isLocked: false,
  },
  {
    id: 'c-5',
    code: 'CS404L',
    name: 'Full-Stack Systems Lab',
    type: 'ica_only',
    credits: 2,
    icaMarks: 44,
    seeMarks: 0,
    isLocked: false,
  },
  {
    id: 'c-6',
    code: 'HM401',
    name: 'Professional Ethics & Law',
    type: 'standard',
    credits: 2,
    icaMarks: 35,
    seeMarks: 60,
    isLocked: false,
  },
];

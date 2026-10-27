import {
  CourseType,
  EvaluatedSubject,
  LetterGrade,
  OptimizerResult,
  Subject,
  SubjectPriority,
  TargetRecommendation,
} from "@/types/academic";
import { evaluateSubject, getGradeForPercentage, NMIMS_RULES } from "./grading";

interface GradeFeasibility {
  gradePoints: number;
  grade: LetterGrade;
  targetPercentage: number;
  recommendedIca: number;
  recommendedSee: number;
  isFeasible: boolean;
  cost: number; // Cost for optimization
  additionalMarksNeeded: number;
}

/**
 * Returns the minimum percentage threshold for a grade tier
 */
function getMinPercentage(gradePoints: number): number {
  switch (gradePoints) {
    case 10: return 90;
    case 9: return 80;
    case 8: return 70;
    case 7: return 60;
    case 6: return 55;
    case 5: return 50;
    case 4: return 40;
    default: return 0;
  }
}

function getGradeFromPoints(points: number): LetterGrade {
  switch (points) {
    case 10: return "O";
    case 9: return "A+";
    case 8: return "A";
    case 7: return "B+";
    case 6: return "B";
    case 5: return "C";
    case 4: return "P";
    default: return "F";
  }
}

/**
 * Given a subject and a desired grade point tier (0, 4, 5, 6, 7, 8, 9, 10),
 * determines whether it is achievable under locked marks and rules,
 * and calculates the minimal whole-number (ICA, SEE) marks required.
 */
function evaluateGradeOptionForSubject(
  subject: Subject,
  targetPoints: number,
  strategy: "balanced" | "minimum-effort"
): GradeFeasibility {
  const grade = getGradeFromPoints(targetPoints);
  const targetPct = getMinPercentage(targetPoints);

  const isIcaLocked = Boolean(subject.isIcaLocked);
  const isSeeLocked = Boolean(subject.isSeeLocked);
  const isIcaAbsent = Boolean(subject.isIcaAbsent);
  const isSeeAbsent = subject.courseType === "standard" && Boolean(subject.isSeeAbsent);

  // If subject is absent in any required component, only 0 points is possible
  if (isIcaAbsent || isSeeAbsent) {
    if (targetPoints === 0) {
      return {
        gradePoints: 0,
        grade: "AB",
        targetPercentage: 0,
        recommendedIca: subject.icaMarks,
        recommendedSee: subject.seeMarks,
        isFeasible: true,
        cost: 0,
        additionalMarksNeeded: 0,
      };
    }
    return {
      gradePoints: targetPoints,
      grade,
      targetPercentage: targetPct,
      recommendedIca: subject.icaMarks,
      recommendedSee: subject.seeMarks,
      isFeasible: false,
      cost: Infinity,
      additionalMarksNeeded: Infinity,
    };
  }

  // If target points is 0 (fail), current or minimal passing failure marks are always feasible
  if (targetPoints === 0) {
    return {
      gradePoints: 0,
      grade: "F",
      targetPercentage: 0,
      recommendedIca: subject.icaMarks,
      recommendedSee: subject.seeMarks,
      isFeasible: true,
      cost: 0,
      additionalMarksNeeded: 0,
    };
  }

  const icaMax = subject.icaMax || NMIMS_RULES.ICA_MAX;
  const seeMax = subject.seeMax || NMIMS_RULES.SEE_MAX;

  // For passing tiers (points >= 4):
  // Check ICA-only course
  if (subject.courseType === "ica-only") {
    // Formula: Final % = ICA * 2. Minimum ICA pass = 20. Max ICA = 50.
    const minIcaNeeded = Math.max(NMIMS_RULES.ICA_PASS_MIN, Math.ceil(targetPct / 2));
    
    if (minIcaNeeded > icaMax) {
      return {
        gradePoints: targetPoints,
        grade,
        targetPercentage: targetPct,
        recommendedIca: icaMax,
        recommendedSee: 0,
        isFeasible: false,
        cost: Infinity,
        additionalMarksNeeded: Infinity,
      };
    }

    if (isIcaLocked) {
      // Locked: can we achieve it with fixed ICA?
      const fixedIca = Math.round(subject.icaMarks);
      if (fixedIca < NMIMS_RULES.ICA_PASS_MIN || fixedIca * 2 < targetPct) {
        return {
          gradePoints: targetPoints,
          grade,
          targetPercentage: targetPct,
          recommendedIca: fixedIca,
          recommendedSee: 0,
          isFeasible: false,
          cost: Infinity,
          additionalMarksNeeded: Infinity,
        };
      }
      return {
        gradePoints: targetPoints,
        grade,
        targetPercentage: targetPct,
        recommendedIca: fixedIca,
        recommendedSee: 0,
        isFeasible: true,
        cost: 0,
        additionalMarksNeeded: 0,
      };
    }

    // ICA is unlocked
    const recommendedIca = Math.min(icaMax, Math.max(minIcaNeeded, Math.round(subject.icaMarks)));
    // Additional marks needed from current
    const additional = Math.max(0, recommendedIca - subject.icaMarks);
    
    // Priority multiplier
    const priorityWeight = getPriorityMultiplier(subject.priority);
    const cost = additional * priorityWeight;

    return {
      gradePoints: targetPoints,
      grade,
      targetPercentage: targetPct,
      recommendedIca,
      recommendedSee: 0,
      isFeasible: true,
      cost,
      additionalMarksNeeded: additional,
    };
  }

  // Standard course: ICA (out of 50) + SEE / 2 (out of 100).
  // Requirements: ICA >= 20, SEE >= 40, ICA + SEE/2 >= targetPct.
  if (isIcaLocked && isSeeLocked) {
    const fixedIca = Math.round(subject.icaMarks);
    const fixedSee = Math.round(subject.seeMarks);
    const achievedPct = fixedIca + fixedSee / 2;
    const passes = fixedIca >= NMIMS_RULES.ICA_PASS_MIN && fixedSee >= NMIMS_RULES.SEE_PASS_MIN;

    if (passes && achievedPct >= targetPct) {
      return {
        gradePoints: targetPoints,
        grade,
        targetPercentage: targetPct,
        recommendedIca: fixedIca,
        recommendedSee: fixedSee,
        isFeasible: true,
        cost: 0,
        additionalMarksNeeded: 0,
      };
    }
    return {
      gradePoints: targetPoints,
      grade,
      targetPercentage: targetPct,
      recommendedIca: fixedIca,
      recommendedSee: fixedSee,
      isFeasible: false,
      cost: Infinity,
      additionalMarksNeeded: Infinity,
    };
  }

  if (isIcaLocked && !isSeeLocked) {
    const fixedIca = Math.round(subject.icaMarks);
    if (fixedIca < NMIMS_RULES.ICA_PASS_MIN) {
      // Cannot pass if locked ICA < 20
      return {
        gradePoints: targetPoints,
        grade,
        targetPercentage: targetPct,
        recommendedIca: fixedIca,
        recommendedSee: subject.seeMarks,
        isFeasible: false,
        cost: Infinity,
        additionalMarksNeeded: Infinity,
      };
    }

    // Need SEE / 2 >= targetPct - fixedIca => SEE >= 2 * (targetPct - fixedIca)
    const neededFromSee = 2 * Math.max(0, targetPct - fixedIca);
    const minSeeNeeded = Math.max(NMIMS_RULES.SEE_PASS_MIN, Math.ceil(neededFromSee));

    if (minSeeNeeded > seeMax) {
      return {
        gradePoints: targetPoints,
        grade,
        targetPercentage: targetPct,
        recommendedIca: fixedIca,
        recommendedSee: seeMax,
        isFeasible: false,
        cost: Infinity,
        additionalMarksNeeded: Infinity,
      };
    }

    const recommendedSee = Math.min(seeMax, Math.max(minSeeNeeded, Math.round(subject.seeMarks)));
    const additional = Math.max(0, recommendedSee - subject.seeMarks);
    const priorityWeight = getPriorityMultiplier(subject.priority);

    return {
      gradePoints: targetPoints,
      grade,
      targetPercentage: targetPct,
      recommendedIca: fixedIca,
      recommendedSee,
      isFeasible: true,
      cost: additional * priorityWeight,
      additionalMarksNeeded: additional,
    };
  }

  if (!isIcaLocked && isSeeLocked) {
    const fixedSee = Math.round(subject.seeMarks);
    if (fixedSee < NMIMS_RULES.SEE_PASS_MIN) {
      return {
        gradePoints: targetPoints,
        grade,
        targetPercentage: targetPct,
        recommendedIca: subject.icaMarks,
        recommendedSee: fixedSee,
        isFeasible: false,
        cost: Infinity,
        additionalMarksNeeded: Infinity,
      };
    }

    // Need ICA >= targetPct - fixedSee / 2
    const neededFromIca = targetPct - fixedSee / 2;
    const minIcaNeeded = Math.max(NMIMS_RULES.ICA_PASS_MIN, Math.ceil(neededFromIca));

    if (minIcaNeeded > icaMax) {
      return {
        gradePoints: targetPoints,
        grade,
        targetPercentage: targetPct,
        recommendedIca: icaMax,
        recommendedSee: fixedSee,
        isFeasible: false,
        cost: Infinity,
        additionalMarksNeeded: Infinity,
      };
    }

    const recommendedIca = Math.min(icaMax, Math.max(minIcaNeeded, Math.round(subject.icaMarks)));
    const additional = Math.max(0, recommendedIca - subject.icaMarks);
    const priorityWeight = getPriorityMultiplier(subject.priority);

    return {
      gradePoints: targetPoints,
      grade,
      targetPercentage: targetPct,
      recommendedIca,
      recommendedSee: fixedSee,
      isFeasible: true,
      cost: additional * priorityWeight,
      additionalMarksNeeded: additional,
    };
  }

  // Both ICA and SEE are unlocked!
  // We want whole numbers 20 <= ica <= 50, 40 <= see <= 100 with ica + see/2 >= targetPct.
  // If targetPct <= 40, minimum passing (ica=20, see=40) yields 20 + 20 = 40%.
  // Max possible: ica=50, see=100 => 50 + 50 = 100%.
  let bestIca = 20;
  let bestSee = 40;
  let minCost = Infinity;
  let minAdd = Infinity;

  // Search over feasible (ica, see) pairs to find the most balanced or minimum additional
  const curIca = Math.round(subject.icaMarks);
  const curSee = Math.round(subject.seeMarks);

  // In balanced mode, we prefer ICA : SEE ratio close to 1 : 2 (since max is 50 and 100)
  for (let ica = NMIMS_RULES.ICA_PASS_MIN; ica <= icaMax; ica++) {
    const minSeeForIca = Math.max(
      NMIMS_RULES.SEE_PASS_MIN,
      Math.ceil(2 * Math.max(0, targetPct - ica))
    );
    if (minSeeForIca > seeMax) continue;

    for (let see = minSeeForIca; see <= Math.min(seeMax, minSeeForIca + 1); see++) {
      if (ica + see / 2 < targetPct) continue;

      const addIca = Math.max(0, ica - curIca);
      const addSee = Math.max(0, see - curSee);
      const totalAdd = addIca + addSee;

      let pairCost = 0;
      if (strategy === "balanced") {
        // Balanced: penalized if ica and see deviate heavily from balanced proportion (see ≈ 2 * ica)
        const balancePenalty = Math.abs(see - 2 * ica) * 0.2;
        pairCost = totalAdd + balancePenalty;
      } else {
        pairCost = totalAdd;
      }

      if (pairCost < minCost || (pairCost === minCost && totalAdd < minAdd)) {
        minCost = pairCost;
        minAdd = totalAdd;
        bestIca = ica;
        bestSee = see;
      }
    }
  }

  const priorityWeight = getPriorityMultiplier(subject.priority);
  return {
    gradePoints: targetPoints,
    grade,
    targetPercentage: targetPct,
    recommendedIca: bestIca,
    recommendedSee: bestSee,
    isFeasible: minCost < Infinity,
    cost: minCost * priorityWeight,
    additionalMarksNeeded: minAdd,
  };
}

function getPriorityMultiplier(priority?: SubjectPriority): number {
  if (priority === "high") return 0.7; // Lower cost -> optimizer prefers boosting this
  if (priority === "low") return 1.4; // Higher cost -> optimizer avoids boosting unless necessary
  return 1.0;
}

/**
 * Optimizes subject marks to achieve or exceed a target SGPA.
 * Uses exact discrete dynamic programming over grade points.
 */
export function optimizeTargetSgpa(
  subjects: Subject[],
  targetSgpa: number,
  strategy: "balanced" | "minimum-effort" = "balanced"
): OptimizerResult {
  if (!subjects || subjects.length === 0) {
    return {
      targetSgpa,
      achievable: false,
      achievedSgpa: 0,
      maxPossibleSgpa: 0,
      minPossibleSgpa: 0,
      recommendations: [],
      strategy,
      totalAdditionalMarks: 0,
      message: "No subjects available to plan.",
    };
  }

  const validPoints = [0, 4, 5, 6, 7, 8, 9, 10];
  const n = subjects.length;

  let totalCredits = 0;
  for (const s of subjects) {
    totalCredits += Math.max(0, Number(s.credits) || 0);
  }

  if (totalCredits === 0) {
    return {
      targetSgpa,
      achievable: false,
      achievedSgpa: 0,
      maxPossibleSgpa: 0,
      minPossibleSgpa: 0,
      recommendations: [],
      strategy,
      totalAdditionalMarks: 0,
      message: "Total credits must be greater than zero.",
    };
  }

  // Precompute feasibility and costs for all subjects for each grade tier
  const subjectOptions: GradeFeasibility[][] = [];
  let maxPossiblePoints = 0;
  let minPossiblePoints = 0;

  for (let i = 0; i < n; i++) {
    const sub = subjects[i];
    const options: GradeFeasibility[] = [];
    let maxSubPt = 0;
    let minSubPt = 10;

    for (const pt of validPoints) {
      const opt = evaluateGradeOptionForSubject(sub, pt, strategy);
      options.push(opt);
      if (opt.isFeasible) {
        if (pt > maxSubPt) maxSubPt = pt;
        if (pt < minSubPt) minSubPt = pt;
      }
    }

    subjectOptions.push(options);
    maxPossiblePoints += maxSubPt * sub.credits;
    minPossiblePoints += minSubPt * sub.credits;
  }

  const maxPossibleSgpa = Number((maxPossiblePoints / totalCredits).toFixed(4));
  const minPossibleSgpa = Number((minPossiblePoints / totalCredits).toFixed(4));
  const targetRequiredWeightedPoints = targetSgpa * totalCredits;

  const isAchievable = targetRequiredWeightedPoints <= maxPossiblePoints + 1e-6;

  // We want to find combination of grade points (g_0, ..., g_{n-1}) that minimizes total cost
  // such that sum(c_i * g_i) >= targetRequiredWeightedPoints (if achievable),
  // or maximizes sum(c_i * g_i) (if impossible).
  const maxPointsPossible = 10 * totalCredits;

  // DP table: dp[i][w] = minimal cost to reach exact weighted points w using first i subjects
  // Store choice for reconstruction
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(maxPointsPossible + 1).fill(Infinity)
  );
  const choice: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(maxPointsPossible + 1).fill(-1)
  );

  dp[0][0] = 0;

  for (let i = 0; i < n; i++) {
    const credits = subjects[i].credits;
    const opts = subjectOptions[i];

    for (let w = 0; w <= maxPointsPossible; w++) {
      if (dp[i][w] === Infinity) continue;

      for (let optIdx = 0; optIdx < opts.length; optIdx++) {
        const opt = opts[optIdx];
        if (!opt.isFeasible) continue;

        const newW = w + opt.gradePoints * credits;
        if (newW > maxPointsPossible) continue;

        const newCost = dp[i][w] + opt.cost;
        if (newCost < dp[i + 1][newW]) {
          dp[i + 1][newW] = newCost;
          choice[i + 1][newW] = optIdx;
        }
      }
    }
  }

  let chosenW = -1;

  if (isAchievable) {
    // Look for w >= targetRequiredWeightedPoints with minimal cost
    let minCost = Infinity;
    const minW = Math.ceil(targetRequiredWeightedPoints - 1e-6);

    for (let w = minW; w <= maxPointsPossible; w++) {
      if (dp[n][w] < minCost) {
        minCost = dp[n][w];
        chosenW = w;
      }
    }
  }

  // If impossible or no solution found at or above target, pick the highest achievable w
  if (chosenW === -1) {
    for (let w = maxPointsPossible; w >= 0; w--) {
      if (dp[n][w] < Infinity) {
        chosenW = w;
        break;
      }
    }
  }

  // Backtrack choices
  const selectedOptions: GradeFeasibility[] = new Array(n);
  let curW = chosenW;

  for (let i = n; i >= 1; i--) {
    const optIdx = choice[i][curW];
    if (optIdx === -1) {
      // Fallback: pick current evaluated grade
      const currentEval = evaluateSubject(subjects[i - 1]);
      selectedOptions[i - 1] = {
        gradePoints: currentEval.gradePoints,
        grade: currentEval.grade,
        targetPercentage: currentEval.finalPercentage,
        recommendedIca: subjects[i - 1].icaMarks,
        recommendedSee: subjects[i - 1].seeMarks,
        isFeasible: false,
        cost: 0,
        additionalMarksNeeded: 0,
      };
      continue;
    }

    const opt = subjectOptions[i - 1][optIdx];
    selectedOptions[i - 1] = opt;
    curW -= opt.gradePoints * subjects[i - 1].credits;
  }

  // Build recommendations
  let totalAdditionalMarks = 0;
  const recommendations: TargetRecommendation[] = [];

  for (let i = 0; i < n; i++) {
    const sub = subjects[i];
    const opt = selectedOptions[i];

    const currentIca = Math.round(sub.icaMarks);
    const currentSee = Math.round(sub.seeMarks);
    const recommendedIca = opt.recommendedIca;
    const recommendedSee = opt.recommendedSee;

    const icaDiff = recommendedIca - currentIca;
    const seeDiff = sub.courseType === "standard" ? recommendedSee - currentSee : 0;

    totalAdditionalMarks += Math.max(0, icaDiff) + Math.max(0, seeDiff);

    // Calculate expected outcome
    const simulatedSub: Subject = {
      ...sub,
      icaMarks: recommendedIca,
      seeMarks: recommendedSee,
      isIcaAbsent: false,
      isSeeAbsent: false,
    };
    const evalResult = evaluateSubject(simulatedSub);

    recommendations.push({
      subjectId: sub.id,
      subjectName: sub.name,
      courseType: sub.courseType,
      credits: sub.credits,
      currentIca,
      currentSee,
      recommendedIca,
      recommendedSee,
      expectedPercentage: evalResult.finalPercentage,
      expectedGrade: evalResult.grade,
      expectedGradePoints: evalResult.gradePoints,
      status: evalResult.status,
      isAchievable: opt.isFeasible && evalResult.status === "pass",
      icaDiff,
      seeDiff,
      isIcaLocked: Boolean(sub.isIcaLocked),
      isSeeLocked: Boolean(sub.isSeeLocked),
    });
  }

  const achievedSgpa = Number((chosenW / totalCredits).toFixed(2));

  let message = "";
  if (!isAchievable) {
    message = `Target SGPA of ${targetSgpa.toFixed(2)} is mathematically unattainable with current constraints and locked marks. Maximum achievable SGPA is ${maxPossibleSgpa.toFixed(2)}.`;
  } else {
    message = `Plan found! Recommended marks will achieve an SGPA of ${achievedSgpa.toFixed(2)}.`;
  }

  return {
    targetSgpa,
    achievable: isAchievable,
    achievedSgpa,
    maxPossibleSgpa,
    minPossibleSgpa,
    recommendations,
    strategy,
    totalAdditionalMarks,
    message,
    isFeasibleApproximation: false,
  };
}

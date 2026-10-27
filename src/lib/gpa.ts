import { EvaluatedSubject, SgpaSummary, Subject } from "@/types/academic";
import { evaluateSubject, GRADE_TIERS } from "./grading";

/**
 * Calculates credit-weighted SGPA for an array of subjects
 * SGPA = Σ(Grade points × Credits) / Σ(Credits)
 */
export function calculateSgpa(subjects: Subject[]): {
  summary: SgpaSummary;
  evaluatedSubjects: EvaluatedSubject[];
} {
  if (!subjects || subjects.length === 0) {
    return {
      summary: {
        sgpa: 0,
        totalCredits: 0,
        totalGradePoints: 0,
        totalSubjects: 0,
        passedSubjects: 0,
        failedSubjects: 0,
        absentSubjects: 0,
        allPassed: true,
      },
      evaluatedSubjects: [],
    };
  }

  const evaluatedSubjects = subjects.map(evaluateSubject);

  let totalCredits = 0;
  let totalGradePoints = 0;
  let passedSubjects = 0;
  let failedSubjects = 0;
  let absentSubjects = 0;

  for (const sub of evaluatedSubjects) {
    const credits = Math.max(0, Number(sub.credits) || 0);
    totalCredits += credits;
    totalGradePoints += sub.gradePoints * credits;

    if (sub.status === "pass") {
      passedSubjects++;
    } else if (sub.status === "absent") {
      absentSubjects++;
    } else {
      failedSubjects++;
    }
  }

  const sgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
  const allPassed = passedSubjects === subjects.length && subjects.length > 0;

  return {
    summary: {
      sgpa,
      totalCredits,
      totalGradePoints,
      totalSubjects: subjects.length,
      passedSubjects,
      failedSubjects,
      absentSubjects,
      allPassed,
    },
    evaluatedSubjects,
  };
}

/**
 * Finds the additional marks required to reach the next grade tier for a subject
 */
export interface NextGradeOpportunity {
  subjectId: string;
  subjectName: string;
  currentGrade: string;
  currentGradePoints: number;
  currentPercentage: number;
  nextGrade: string | null;
  nextGradePoints: number | null;
  marksNeededInSee: number | null;
  marksNeededInIca: number | null;
  isMaxGrade: boolean;
  isPassingIssue: boolean;
  credits: number;
  potentialSgpaGain: number; // How much SGPA would rise if this subject jumped 1 grade tier
}

export function analyzeNextGradeOpportunity(
  subject: Subject,
  totalCredits: number
): NextGradeOpportunity {
  const evaluated = evaluateSubject(subject);

  // If already at O grade (10 pts), no higher tier
  if (evaluated.grade === "O") {
    return {
      subjectId: subject.id,
      subjectName: subject.name,
      currentGrade: evaluated.grade,
      currentGradePoints: evaluated.gradePoints,
      currentPercentage: evaluated.finalPercentage,
      nextGrade: null,
      nextGradePoints: null,
      marksNeededInSee: null,
      marksNeededInIca: null,
      isMaxGrade: true,
      isPassingIssue: false,
      credits: subject.credits,
      potentialSgpaGain: 0,
    };
  }

  // Find next higher tier in GRADE_TIERS (ordered descending 90->0)
  const currentPoints = evaluated.gradePoints;
  const candidateTiers = GRADE_TIERS.filter((t) => t.points > currentPoints).sort(
    (a, b) => a.points - b.points
  );

  const nextTier = candidateTiers[0];
  if (!nextTier) {
    return {
      subjectId: subject.id,
      subjectName: subject.name,
      currentGrade: evaluated.grade,
      currentGradePoints: evaluated.gradePoints,
      currentPercentage: evaluated.finalPercentage,
      nextGrade: null,
      nextGradePoints: null,
      marksNeededInSee: null,
      marksNeededInIca: null,
      isMaxGrade: true,
      isPassingIssue: false,
      credits: subject.credits,
      potentialSgpaGain: 0,
    };
  }

  const targetPercentage = nextTier.min;
  const percentShortfall = Math.max(0, targetPercentage - evaluated.finalPercentage);

  let marksNeededInIca: number | null = null;
  let marksNeededInSee: number | null = null;

  if (subject.courseType === "ica-only") {
    // Percentage = ICA * 2 => shortfall in ICA = shortfall / 2
    marksNeededInIca = Math.ceil(percentShortfall / 2);
    // Can ICA reach that?
    const proposedIca = subject.icaMarks + marksNeededInIca;
    if (proposedIca > subject.icaMax) {
      marksNeededInIca = null;
    }
  } else {
    // Standard course: ICA + SEE/2
    // If increased purely via SEE: 1 SEE mark = 0.5% => marks needed = shortfall * 2
    marksNeededInSee = Math.ceil(percentShortfall * 2);
    const proposedSee = subject.seeMarks + marksNeededInSee;
    if (proposedSee > subject.seeMax) {
      marksNeededInSee = null;
    }

    // If increased purely via ICA: 1 ICA mark = 1% => marks needed = shortfall
    marksNeededInIca = Math.ceil(percentShortfall);
    const proposedIca = subject.icaMarks + marksNeededInIca;
    if (proposedIca > subject.icaMax) {
      marksNeededInIca = null;
    }
  }

  const pointGain = nextTier.points - evaluated.gradePoints;
  const potentialSgpaGain = totalCredits > 0 ? (pointGain * subject.credits) / totalCredits : 0;

  return {
    subjectId: subject.id,
    subjectName: subject.name,
    currentGrade: evaluated.grade,
    currentGradePoints: evaluated.gradePoints,
    currentPercentage: evaluated.finalPercentage,
    nextGrade: nextTier.grade,
    nextGradePoints: nextTier.points,
    marksNeededInSee,
    marksNeededInIca,
    isMaxGrade: false,
    isPassingIssue: evaluated.status === "fail" || evaluated.status === "absent",
    credits: subject.credits,
    potentialSgpaGain,
  };
}

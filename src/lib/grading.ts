import { EvaluatedSubject, LetterGrade, Subject, SubjectStatus } from "@/types/academic";

export const NMIMS_RULES = {
  ICA_MAX: 50,
  ICA_PASS_MIN: 20,
  SEE_MAX: 100,
  SEE_PASS_MIN: 40,
  MIN_PASS_PERCENTAGE: 40,
} as const;

export interface GradeTier {
  min: number;
  max: number;
  grade: LetterGrade;
  points: number;
  label: string;
}

export const GRADE_TIERS: GradeTier[] = [
  { min: 90, max: 100, grade: "O", points: 10, label: "Outstanding" },
  { min: 80, max: 90, grade: "A+", points: 9, label: "Excellent" },
  { min: 70, max: 80, grade: "A", points: 8, label: "Very Good" },
  { min: 60, max: 70, grade: "B+", points: 7, label: "Good" },
  { min: 55, max: 60, grade: "B", points: 6, label: "Above Average" },
  { min: 50, max: 55, grade: "C", points: 5, label: "Average" },
  { min: 40, max: 50, grade: "P", points: 4, label: "Pass" },
  { min: 0, max: 40, grade: "F", points: 0, label: "Fail" },
];

/**
 * Returns raw grade and points based purely on percentage, unrounded.
 * Scale:
 * 90 to 100 -> O (10)
 * 80 to < 90 -> A+ (9)
 * 70 to < 80 -> A (8)
 * 60 to < 70 -> B+ (7)
 * 55 to < 60 -> B (6)
 * 50 to < 55 -> C (5)
 * 40 to < 50 -> P (4)
 * 0 to < 40 -> F (0)
 */
export function getGradeForPercentage(percentage: number): { grade: LetterGrade; gradePoints: number } {
  if (percentage >= 90) return { grade: "O", gradePoints: 10 };
  if (percentage >= 80) return { grade: "A+", gradePoints: 9 };
  if (percentage >= 70) return { grade: "A", gradePoints: 8 };
  if (percentage >= 60) return { grade: "B+", gradePoints: 7 };
  if (percentage >= 55) return { grade: "B", gradePoints: 6 };
  if (percentage >= 50) return { grade: "C", gradePoints: 5 };
  if (percentage >= 40) return { grade: "P", gradePoints: 4 };
  return { grade: "F", gradePoints: 0 };
}

/**
 * Returns minimum final percentage required to hit a specific grade tier
 */
export function getMinPercentageForGrade(grade: LetterGrade): number {
  switch (grade) {
    case "O": return 90;
    case "A+": return 80;
    case "A": return 70;
    case "B+": return 60;
    case "B": return 55;
    case "C": return 50;
    case "P": return 40;
    case "F":
    case "AB":
    default: return 0;
  }
}

/**
 * Returns grade points for a letter grade
 */
export function getGradePointsForGrade(grade: LetterGrade): number {
  switch (grade) {
    case "O": return 10;
    case "A+": return 9;
    case "A": return 8;
    case "B+": return 7;
    case "B": return 6;
    case "C": return 5;
    case "P": return 4;
    case "F":
    case "AB":
    default: return 0;
  }
}

/**
 * Calculates final percentage for a standard or ICA-only course
 */
export function calculateFinalPercentage(
  courseType: Subject["courseType"],
  icaMarks: number,
  seeMarks: number
): number {
  if (courseType === "ica-only") {
    return Math.max(0, icaMarks * 2);
  }
  // Standard course: ICA out of 50 + SEE/TEE out of 100 scaled down to 50
  return Math.max(0, icaMarks + (seeMarks / 2));
}

/**
 * Evaluates a subject completely against NMIMS passing rules and grading scale
 */
export function evaluateSubject(subject: Subject): EvaluatedSubject {
  const failureReasons: string[] = [];
  const isIcaAbsent = Boolean(subject.isIcaAbsent);
  const isSeeAbsent = subject.courseType === "standard" ? Boolean(subject.isSeeAbsent) : false;

  // Handle absent cases
  if (isIcaAbsent || isSeeAbsent) {
    if (isIcaAbsent) failureReasons.push("Absent in Internal Continuous Assessment (ICA)");
    if (isSeeAbsent) failureReasons.push("Absent in Term-End Examination (SEE/TEE)");
    
    return {
      ...subject,
      finalPercentage: 0,
      grade: "AB",
      gradePoints: 0,
      status: "absent",
      failureReasons,
      weightedGradePoints: 0,
    };
  }

  const ica = Math.max(0, Number(subject.icaMarks) || 0);
  const see = Math.max(0, Number(subject.seeMarks) || 0);
  const credits = Math.max(0, Number(subject.credits) || 0);

  const finalPercentage = calculateFinalPercentage(subject.courseType, ica, see);
  let status: SubjectStatus = "pass";

  // Check ICA component minimum
  if (ica < NMIMS_RULES.ICA_PASS_MIN) {
    failureReasons.push(`ICA marks (${ica}/${subject.icaMax || NMIMS_RULES.ICA_MAX}) below passing threshold of ${NMIMS_RULES.ICA_PASS_MIN}`);
    status = "fail";
  }

  // Check SEE component minimum if standard course
  if (subject.courseType === "standard") {
    if (see < NMIMS_RULES.SEE_PASS_MIN) {
      failureReasons.push(`SEE/TEE marks (${see}/${subject.seeMax || NMIMS_RULES.SEE_MAX}) below passing threshold of ${NMIMS_RULES.SEE_PASS_MIN}`);
      status = "fail";
    }
  }

  // Check aggregate
  if (finalPercentage < NMIMS_RULES.MIN_PASS_PERCENTAGE) {
    if (!failureReasons.length) {
      failureReasons.push(`Aggregate percentage (${finalPercentage.toFixed(1)}%) below passing minimum of 40%`);
    }
    status = "fail";
  }

  let grade: LetterGrade;
  let gradePoints: number;

  if (status === "fail") {
    grade = "F";
    gradePoints = 0;
  } else {
    const gradeResult = getGradeForPercentage(finalPercentage);
    grade = gradeResult.grade;
    gradePoints = gradeResult.gradePoints;
  }

  const weightedGradePoints = gradePoints * credits;

  return {
    ...subject,
    finalPercentage,
    grade,
    gradePoints,
    status,
    failureReasons,
    weightedGradePoints,
  };
}

export type CourseType = "standard" | "ica-only";

export type LetterGrade = "O" | "A+" | "A" | "B+" | "B" | "C" | "P" | "F" | "AB";

export type SubjectStatus = "pass" | "fail" | "absent";

export type SubjectPriority = "high" | "medium" | "low";

export interface Subject {
  id: string;
  name: string;
  code?: string;
  credits: number;
  courseType: CourseType;
  icaMarks: number;
  icaMax: number;
  seeMarks: number;
  seeMax: number;
  isIcaAbsent?: boolean;
  isSeeAbsent?: boolean;
  isIcaLocked?: boolean;
  isSeeLocked?: boolean;
  priority?: SubjectPriority;
}

export interface EvaluatedSubject extends Subject {
  finalPercentage: number;
  grade: LetterGrade;
  gradePoints: number;
  status: SubjectStatus;
  failureReasons: string[];
  weightedGradePoints: number;
}

export interface SgpaSummary {
  sgpa: number;
  totalCredits: number;
  totalGradePoints: number;
  totalSubjects: number;
  passedSubjects: number;
  failedSubjects: number;
  absentSubjects: number;
  allPassed: boolean;
}

export interface TargetRecommendation {
  subjectId: string;
  subjectName: string;
  courseType: CourseType;
  credits: number;
  currentIca: number;
  currentSee: number;
  recommendedIca: number;
  recommendedSee: number;
  expectedPercentage: number;
  expectedGrade: LetterGrade;
  expectedGradePoints: number;
  status: SubjectStatus;
  isAchievable: boolean;
  icaDiff: number;
  seeDiff: number;
  isIcaLocked: boolean;
  isSeeLocked: boolean;
}

export interface OptimizerResult {
  targetSgpa: number;
  achievable: boolean;
  achievedSgpa: number;
  maxPossibleSgpa: number;
  minPossibleSgpa: number;
  recommendations: TargetRecommendation[];
  strategy: "balanced" | "minimum-effort";
  totalAdditionalMarks: number;
  message?: string;
  isFeasibleApproximation?: boolean;
}

export interface AcademicStoreState {
  version: number;
  semesterLabel: string;
  targetSgpa: number;
  subjects: Subject[];
  appliedHistory?: {
    timestamp: number;
    description: string;
    previousSubjects: Subject[];
  }[];
}

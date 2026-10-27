import { describe, it, expect } from "vitest";
import { evaluateSubject, getGradeForPercentage } from "../grading";
import { calculateSgpa, analyzeNextGradeOpportunity } from "../gpa";
import { optimizeTargetSgpa } from "../target-optimizer";
import { validateExportJson, SubjectSchema } from "../validation";
import { Subject } from "@/types/academic";

describe("NMIMS Grading Rules - Standard Courses", () => {
  it("evaluates ICA 40, SEE 80 -> 80%, A+, 9 points", () => {
    const subject: Subject = {
      id: "s1",
      name: "Test Subject",
      credits: 4,
      courseType: "standard",
      icaMarks: 40,
      icaMax: 50,
      seeMarks: 80,
      seeMax: 100,
    };
    const res = evaluateSubject(subject);
    expect(res.finalPercentage).toBe(80);
    expect(res.grade).toBe("A+");
    expect(res.gradePoints).toBe(9);
    expect(res.status).toBe("pass");
  });

  it("evaluates ICA 20, SEE 40 -> 40%, P, 4 points, both components meet minimums", () => {
    const subject: Subject = {
      id: "s2",
      name: "Passing Edge Subject",
      credits: 3,
      courseType: "standard",
      icaMarks: 20,
      icaMax: 50,
      seeMarks: 40,
      seeMax: 100,
    };
    const res = evaluateSubject(subject);
    expect(res.finalPercentage).toBe(40);
    expect(res.grade).toBe("P");
    expect(res.gradePoints).toBe(4);
    expect(res.status).toBe("pass");
  });

  it("evaluates ICA 19, SEE 100 -> fails due to ICA minimum", () => {
    const subject: Subject = {
      id: "s3",
      name: "Failed ICA Subject",
      credits: 4,
      courseType: "standard",
      icaMarks: 19,
      icaMax: 50,
      seeMarks: 100,
      seeMax: 100,
    };
    const res = evaluateSubject(subject);
    expect(res.finalPercentage).toBe(69); // 19 + 50 = 69%
    expect(res.grade).toBe("F");
    expect(res.gradePoints).toBe(0);
    expect(res.status).toBe("fail");
    expect(res.failureReasons.some(r => r.includes("ICA marks (19/50)"))).toBe(true);
  });

  it("evaluates ICA 50, SEE 39 -> fails due to SEE/TEE minimum", () => {
    const subject: Subject = {
      id: "s4",
      name: "Failed SEE Subject",
      credits: 4,
      courseType: "standard",
      icaMarks: 50,
      icaMax: 50,
      seeMarks: 39,
      seeMax: 100,
    };
    const res = evaluateSubject(subject);
    expect(res.finalPercentage).toBe(69.5); // 50 + 19.5
    expect(res.grade).toBe("F");
    expect(res.gradePoints).toBe(0);
    expect(res.status).toBe("fail");
    expect(res.failureReasons.some(r => r.includes("SEE/TEE marks (39/100)"))).toBe(true);
  });

  it("evaluates ICA 50, SEE 100 -> 100%, O, 10 points", () => {
    const subject: Subject = {
      id: "s5",
      name: "Perfect Subject",
      credits: 4,
      courseType: "standard",
      icaMarks: 50,
      icaMax: 50,
      seeMarks: 100,
      seeMax: 100,
    };
    const res = evaluateSubject(subject);
    expect(res.finalPercentage).toBe(100);
    expect(res.grade).toBe("O");
    expect(res.gradePoints).toBe(10);
    expect(res.status).toBe("pass");
  });
});

describe("NMIMS Grading Rules - ICA-Only Courses", () => {
  it("evaluates ICA 40 -> 80%, A+, 9 points", () => {
    const subject: Subject = {
      id: "lab1",
      name: "Lab 1",
      credits: 2,
      courseType: "ica-only",
      icaMarks: 40,
      icaMax: 50,
      seeMarks: 0,
      seeMax: 100,
    };
    const res = evaluateSubject(subject);
    expect(res.finalPercentage).toBe(80);
    expect(res.grade).toBe("A+");
    expect(res.gradePoints).toBe(9);
    expect(res.status).toBe("pass");
  });

  it("evaluates ICA 45 -> 90%, O, 10 points", () => {
    const subject: Subject = {
      id: "lab2",
      name: "Lab 2",
      credits: 2,
      courseType: "ica-only",
      icaMarks: 45,
      icaMax: 50,
      seeMarks: 0,
      seeMax: 100,
    };
    const res = evaluateSubject(subject);
    expect(res.finalPercentage).toBe(90);
    expect(res.grade).toBe("O");
    expect(res.gradePoints).toBe(10);
    expect(res.status).toBe("pass");
  });

  it("evaluates ICA 19 -> 38%, F, 0 points, fails ICA passing rule", () => {
    const subject: Subject = {
      id: "lab3",
      name: "Lab 3",
      credits: 2,
      courseType: "ica-only",
      icaMarks: 19,
      icaMax: 50,
      seeMarks: 0,
      seeMax: 100,
    };
    const res = evaluateSubject(subject);
    expect(res.finalPercentage).toBe(38);
    expect(res.grade).toBe("F");
    expect(res.gradePoints).toBe(0);
    expect(res.status).toBe("fail");
  });
});

describe("Grade Boundaries - Discrete Unrounded Tiers", () => {
  it("tests immediately below and at 40%", () => {
    expect(getGradeForPercentage(39.99)).toEqual({ grade: "F", gradePoints: 0 });
    expect(getGradeForPercentage(40.0)).toEqual({ grade: "P", gradePoints: 4 });
  });

  it("tests immediately below and at 50%", () => {
    expect(getGradeForPercentage(49.99)).toEqual({ grade: "P", gradePoints: 4 });
    expect(getGradeForPercentage(50.0)).toEqual({ grade: "C", gradePoints: 5 });
  });

  it("tests immediately below and at 55%", () => {
    expect(getGradeForPercentage(54.99)).toEqual({ grade: "C", gradePoints: 5 });
    expect(getGradeForPercentage(55.0)).toEqual({ grade: "B", gradePoints: 6 });
  });

  it("tests immediately below and at 60%", () => {
    expect(getGradeForPercentage(59.99)).toEqual({ grade: "B", gradePoints: 6 });
    expect(getGradeForPercentage(60.0)).toEqual({ grade: "B+", gradePoints: 7 });
  });

  it("tests immediately below and at 70%", () => {
    expect(getGradeForPercentage(69.99)).toEqual({ grade: "B+", gradePoints: 7 });
    expect(getGradeForPercentage(70.0)).toEqual({ grade: "A", gradePoints: 8 });
  });

  it("tests immediately below and at 80%", () => {
    expect(getGradeForPercentage(79.99)).toEqual({ grade: "A", gradePoints: 8 });
    expect(getGradeForPercentage(80.0)).toEqual({ grade: "A+", gradePoints: 9 });
  });

  it("tests immediately below and at 90%", () => {
    expect(getGradeForPercentage(89.99)).toEqual({ grade: "A+", gradePoints: 9 });
    expect(getGradeForPercentage(90.0)).toEqual({ grade: "O", gradePoints: 10 });
  });
});

describe("Absent Status", () => {
  it("marks standard course as AB when absent in ICA", () => {
    const subject: Subject = {
      id: "ab1",
      name: "Subject Absent ICA",
      credits: 4,
      courseType: "standard",
      icaMarks: 40,
      icaMax: 50,
      seeMarks: 80,
      seeMax: 100,
      isIcaAbsent: true,
    };
    const res = evaluateSubject(subject);
    expect(res.grade).toBe("AB");
    expect(res.gradePoints).toBe(0);
    expect(res.status).toBe("absent");
  });

  it("marks standard course as AB when absent in SEE", () => {
    const subject: Subject = {
      id: "ab2",
      name: "Subject Absent SEE",
      credits: 4,
      courseType: "standard",
      icaMarks: 40,
      icaMax: 50,
      seeMarks: 80,
      seeMax: 100,
      isSeeAbsent: true,
    };
    const res = evaluateSubject(subject);
    expect(res.grade).toBe("AB");
    expect(res.gradePoints).toBe(0);
    expect(res.status).toBe("absent");
  });
});

describe("SGPA Calculation", () => {
  it("handles zero subjects safely", () => {
    const res = calculateSgpa([]);
    expect(res.summary.sgpa).toBe(0);
    expect(res.summary.totalCredits).toBe(0);
    expect(res.summary.totalSubjects).toBe(0);
  });

  it("calculates weighted SGPA with different credits and mixed course types", () => {
    const subjects: Subject[] = [
      {
        id: "1",
        name: "Sub 1 (4 cr, 9 pts)",
        credits: 4,
        courseType: "standard",
        icaMarks: 40,
        icaMax: 50,
        seeMarks: 80,
        seeMax: 100, // 80% -> A+ (9) -> 36 weighted
      },
      {
        id: "2",
        name: "Sub 2 (3 cr, 8 pts)",
        credits: 3,
        courseType: "standard",
        icaMarks: 35,
        icaMax: 50,
        seeMarks: 70,
        seeMax: 100, // 70% -> A (8) -> 24 weighted
      },
      {
        id: "3",
        name: "Sub 3 Lab (2 cr, 10 pts)",
        credits: 2,
        courseType: "ica-only",
        icaMarks: 46,
        icaMax: 50,
        seeMarks: 0,
        seeMax: 100, // 92% -> O (10) -> 20 weighted
      },
    ];

    // Total credits = 4 + 3 + 2 = 9
    // Total weighted points = 36 + 24 + 20 = 80
    // SGPA = 80 / 9 = 8.8888... -> 8.89
    const res = calculateSgpa(subjects);
    expect(res.summary.totalCredits).toBe(9);
    expect(res.summary.totalGradePoints).toBe(80);
    expect(Number(res.summary.sgpa.toFixed(2))).toBe(8.89);
    expect(res.summary.allPassed).toBe(true);
  });
});

describe("Target SGPA Optimizer", () => {
  const subjects: Subject[] = [
    {
      id: "opt-1",
      name: "Subject 1",
      credits: 4,
      courseType: "standard",
      icaMarks: 30,
      icaMax: 50,
      seeMarks: 60,
      seeMax: 100,
      isIcaLocked: false,
      isSeeLocked: false,
    },
    {
      id: "opt-2",
      name: "Subject 2",
      credits: 4,
      courseType: "standard",
      icaMarks: 35,
      icaMax: 50,
      seeMarks: 70,
      seeMax: 100,
      isIcaLocked: false,
      isSeeLocked: false,
    },
    {
      id: "opt-3",
      name: "Lab Course",
      credits: 2,
      courseType: "ica-only",
      icaMarks: 35,
      icaMax: 50,
      seeMarks: 0,
      seeMax: 100,
      isIcaLocked: false,
      isSeeLocked: false,
    },
  ];

  it("finds a plan that achieves or exceeds target SGPA 8.5", () => {
    const result = optimizeTargetSgpa(subjects, 8.5, "balanced");
    expect(result.achievable).toBe(true);
    expect(result.achievedSgpa).toBeGreaterThanOrEqual(8.5);

    // Verify recommendations independently
    const appliedSubjects = subjects.map((sub, i) => ({
      ...sub,
      icaMarks: result.recommendations[i].recommendedIca,
      seeMarks: result.recommendations[i].recommendedSee,
    }));
    const independentEval = calculateSgpa(appliedSubjects);
    expect(independentEval.summary.sgpa).toBeGreaterThanOrEqual(8.49);
    expect(independentEval.summary.allPassed).toBe(true);
  });

  it("respects locked marks completely", () => {
    const lockedSubjects: Subject[] = [
      {
        ...subjects[0],
        icaMarks: 25,
        isIcaLocked: true,
      },
      {
        ...subjects[1],
        seeMarks: 50,
        isSeeLocked: true,
      },
      subjects[2],
    ];

    const result = optimizeTargetSgpa(lockedSubjects, 8.0, "balanced");
    expect(result.recommendations[0].recommendedIca).toBe(25);
    expect(result.recommendations[1].recommendedSee).toBe(50);
  });

  it("detects impossible target and reports max achievable SGPA", () => {
    const impossibleSubjects: Subject[] = [
      {
        id: "imp-1",
        name: "Severely Locked Sub",
        credits: 4,
        courseType: "standard",
        icaMarks: 20,
        seeMarks: 40,
        icaMax: 50,
        seeMax: 100,
        isIcaLocked: true,
        isSeeLocked: true, // Locked at P grade (4 pts)
      },
      {
        id: "imp-2",
        name: "Sub 2",
        credits: 4,
        courseType: "standard",
        icaMarks: 20,
        seeMarks: 40,
        icaMax: 50,
        seeMax: 100,
        isIcaLocked: true,
        isSeeLocked: true, // Locked at P grade (4 pts)
      },
    ];

    // Max achievable points is 4 * 4 + 4 * 4 = 32 / 8 = 4.0 SGPA
    const result = optimizeTargetSgpa(impossibleSubjects, 9.0);
    expect(result.achievable).toBe(false);
    expect(result.maxPossibleSgpa).toBe(4.0);
    expect(result.message).toContain("mathematically unattainable");
  });
});

describe("Validation and Serialization", () => {
  it("validates valid JSON import data", () => {
    const validJson = JSON.stringify({
      version: 1,
      app: "GPA Calculator",
      semesterLabel: "Semester 3",
      targetSgpa: 9.0,
      subjects: [
        {
          id: "sub-1",
          name: "Operating Systems",
          credits: 4,
          courseType: "standard",
          icaMarks: 45,
          icaMax: 50,
          seeMarks: 85,
          seeMax: 100,
        },
      ],
    });

    const val = validateExportJson(validJson);
    expect(val.success).toBe(true);
    expect(val.data?.subjects.length).toBe(1);
    expect(val.data?.targetSgpa).toBe(9.0);
  });

  it("rejects invalid JSON structure or marks exceeding maximum", () => {
    const invalidJson = JSON.stringify({
      version: 1,
      app: "GPA Calculator",
      targetSgpa: 9.0,
      subjects: [
        {
          id: "sub-invalid",
          name: "Bad Subject",
          credits: 4,
          courseType: "standard",
          icaMarks: 55, // EXCEEDS 50!
          icaMax: 50,
          seeMarks: 80,
          seeMax: 100,
        },
      ],
    });

    const val = validateExportJson(invalidJson);
    expect(val.success).toBe(false);
    expect(val.error).toBeDefined();
  });
});

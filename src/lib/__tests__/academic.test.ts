import { describe, it, expect } from "vitest";
import { evaluateSubject, getGradeForPercentage } from "../grading";
import { calculateSgpa } from "../gpa";
import { optimizeTargetSgpa } from "../target-optimizer";
import { validateExportJson } from "../validation";
import {
  evaluateCourse,
  computeSemesterTelemetry,
  optimizeForTargetSgpa,
  Course,
} from "../gpa-engine";
import {
  loadStoredData,
  saveStoredData,
  clearStoredData,
  generateExportJson,
} from "../storage";
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

describe("GPA Engine - Boundary Conditions & Passing Thresholds", () => {
  it("verifies all exact grade boundaries: 39.99, 40, 49.99, 50, 54.99, 55, 59.99, 60, 69.99, 70, 79.99, 80, 89.99, 90", () => {
    const boundaries: { ica: number; see: number; expectedGrade: string; expectedPoints: number }[] = [
      { ica: 20, see: 39.98, expectedGrade: "F", expectedPoints: 0 }, // 39.99% -> F
      { ica: 20, see: 40, expectedGrade: "P", expectedPoints: 4 }, // 40.0% -> P
      { ica: 20, see: 59.98, expectedGrade: "P", expectedPoints: 4 }, // 49.99% -> P
      { ica: 20, see: 60, expectedGrade: "C", expectedPoints: 5 }, // 50.0% -> C
      { ica: 25, see: 59.98, expectedGrade: "C", expectedPoints: 5 }, // 54.99% -> C
      { ica: 25, see: 60, expectedGrade: "B", expectedPoints: 6 }, // 55.0% -> B
      { ica: 25, see: 69.98, expectedGrade: "B", expectedPoints: 6 }, // 59.99% -> B
      { ica: 25, see: 70, expectedGrade: "B+", expectedPoints: 7 }, // 60.0% -> B+
      { ica: 30, see: 79.98, expectedGrade: "B+", expectedPoints: 7 }, // 69.99% -> B+
      { ica: 30, see: 80, expectedGrade: "A", expectedPoints: 8 }, // 70.0% -> A
      { ica: 35, see: 89.98, expectedGrade: "A", expectedPoints: 8 }, // 79.99% -> A
      { ica: 35, see: 90, expectedGrade: "A+", expectedPoints: 9 }, // 80.0% -> A+
      { ica: 40, see: 99.98, expectedGrade: "A+", expectedPoints: 9 }, // 89.99% -> A+
      { ica: 40, see: 100, expectedGrade: "O", expectedPoints: 10 }, // 90.0% -> O
    ];

    for (const b of boundaries) {
      const c: Course = {
        id: `test-b-${b.ica}-${b.see}`,
        code: "TEST",
        name: "Test Boundary",
        type: "standard",
        credits: 3,
        icaMarks: b.ica,
        seeMarks: b.see,
        isLocked: false,
      };
      const ev = evaluateCourse(c);
      expect(ev.grade).toBe(b.expectedGrade);
      expect(ev.gradePoints).toBe(b.expectedPoints);
    }
  });

  it("verifies standard-course ICA and SEE passing thresholds independently", () => {
    // ICA = 19 (fails threshold < 20) even with SEE = 100
    const failIca: Course = {
      id: "c-fail-ica",
      code: "FICA",
      name: "Fail ICA",
      type: "standard",
      credits: 4,
      icaMarks: 19,
      seeMarks: 100,
      isLocked: false,
    };
    const ev1 = evaluateCourse(failIca);
    expect(ev1.isPassed).toBe(false);
    expect(ev1.grade).toBe("F");
    expect(ev1.gradePoints).toBe(0);
    expect(ev1.isIcaPassed).toBe(false);
    expect(ev1.isSeePassed).toBe(true);

    // SEE = 39 (fails threshold < 40) even with ICA = 50
    const failSee: Course = {
      id: "c-fail-see",
      code: "FSEE",
      name: "Fail SEE",
      type: "standard",
      credits: 4,
      icaMarks: 50,
      seeMarks: 39,
      isLocked: false,
    };
    const ev2 = evaluateCourse(failSee);
    expect(ev2.isPassed).toBe(false);
    expect(ev2.grade).toBe("F");
    expect(ev2.gradePoints).toBe(0);
    expect(ev2.isIcaPassed).toBe(true);
    expect(ev2.isSeePassed).toBe(false);

    // Both pass at boundary: ICA = 20, SEE = 40
    const passBoth: Course = {
      id: "c-pass-both",
      code: "PASS",
      name: "Pass Boundary",
      type: "standard",
      credits: 4,
      icaMarks: 20,
      seeMarks: 40,
      isLocked: false,
    };
    const ev3 = evaluateCourse(passBoth);
    expect(ev3.isPassed).toBe(true);
    expect(ev3.grade).toBe("P");
    expect(ev3.gradePoints).toBe(4);
  });

  it("verifies ICA-only courses double marks and do not require SEE", () => {
    const icaOnly: Course = {
      id: "c-lab",
      code: "LAB",
      name: "Hardware Lab",
      type: "ica_only",
      credits: 2,
      icaMarks: 45,
      seeMarks: 0,
      isLocked: false,
    };
    const ev = evaluateCourse(icaOnly);
    expect(ev.finalPercentage).toBe(90);
    expect(ev.grade).toBe("O");
    expect(ev.gradePoints).toBe(10);
    expect(ev.isPassed).toBe(true);
    expect(ev.isSeePassed).toBe(true);
  });

  it("calculates weighted SGPA with different credit weights (1 to 5 credits) and failing subjects", () => {
    const roster: Course[] = [
      { id: "1", code: "C1", name: "Sub 1", credits: 1, type: "standard", icaMarks: 45, seeMarks: 90, isLocked: false }, // 90% -> O (10) -> 10 pts
      { id: "2", code: "C2", name: "Sub 2", credits: 2, type: "standard", icaMarks: 40, seeMarks: 80, isLocked: false }, // 80% -> A+ (9) -> 18 pts
      { id: "3", code: "C3", name: "Sub 3", credits: 3, type: "standard", icaMarks: 35, seeMarks: 70, isLocked: false }, // 70% -> A (8) -> 24 pts
      { id: "4", code: "C4", name: "Sub 4", credits: 4, type: "standard", icaMarks: 30, seeMarks: 60, isLocked: false }, // 60% -> B+ (7) -> 28 pts
      { id: "5", code: "C5", name: "Sub 5", credits: 5, type: "standard", icaMarks: 15, seeMarks: 80, isLocked: false }, // Fails ICA (<20) -> F (0) -> 0 pts
    ];

    // Total credits = 1 + 2 + 3 + 4 + 5 = 15
    // Earned Grade points = 10 + 18 + 24 + 28 + 0 = 80
    // SGPA = 80 / 15 = 5.33
    const telemetry = computeSemesterTelemetry(roster);
    expect(telemetry.totalCredits).toBe(15);
    expect(telemetry.earnedGradePoints).toBe(80);
    expect(telemetry.sgpa).toBe(5.33);
    expect(telemetry.hasFailures).toBe(true);
    expect(telemetry.failedCoursesCount).toBe(1);
    expect(telemetry.passingCredits).toBe(10);
  });
});

describe("GPA Engine Dynamic Programming Optimizer", () => {
  it("optimizes for high SGPA (9.0) and independently satisfies all constraints", () => {
    const courses: Course[] = [
      { id: "c1", code: "SUB1", name: "Sub 1", credits: 4, type: "standard", icaMarks: 35, seeMarks: 65, isLocked: false },
      { id: "c2", code: "SUB2", name: "Sub 2", credits: 3, type: "standard", icaMarks: 35, seeMarks: 65, isLocked: false },
      { id: "c3", code: "LAB1", name: "Lab 1", credits: 2, type: "ica_only", icaMarks: 35, seeMarks: 0, isLocked: false },
    ];

    const plan = optimizeForTargetSgpa(courses, 9.0);
    expect(plan.feasible).toBe(true);
    expect(plan.projectedSgpa).toBeGreaterThanOrEqual(9.0);

    // Apply recommendations and independently evaluate
    const simulated = courses.map((c) => {
      const rec = plan.recommendations[c.id];
      return {
        ...c,
        icaMarks: rec.recommendedIca,
        seeMarks: c.type === "standard" ? rec.recommendedSee : 0,
      };
    });

    const evaluated = computeSemesterTelemetry(simulated);
    expect(evaluated.sgpa).toBeGreaterThanOrEqual(9.0);
    expect(evaluated.hasFailures).toBe(false);

    // Verify mark boundaries
    simulated.forEach((c) => {
      expect(c.icaMarks).toBeGreaterThanOrEqual(20);
      expect(c.icaMarks).toBeLessThanOrEqual(50);
      if (c.type === "standard") {
        expect(c.seeMarks).toBeGreaterThanOrEqual(40);
        expect(c.seeMarks).toBeLessThanOrEqual(100);
      }
    });
  });

  it("respects locked courses and does not modify locked marks", () => {
    const courses: Course[] = [
      { id: "c1", code: "SUB1", name: "Sub 1", credits: 4, type: "standard", icaMarks: 30, seeMarks: 60, isLocked: true },
      { id: "c2", code: "SUB2", name: "Sub 2", credits: 4, type: "standard", icaMarks: 35, seeMarks: 65, isLocked: false },
    ];

    const plan = optimizeForTargetSgpa(courses, 8.0);
    expect(plan.feasible).toBe(true);
    // c1 is locked: recommended marks must not change
    expect(plan.recommendations["c1"]).toBeUndefined();
    expect(plan.recommendations["c2"]).toBeDefined();
  });

  it("returns feasible: false when a locked course is failing", () => {
    const courses: Course[] = [
      { id: "c1", code: "SUB1", name: "Failing Locked Sub", credits: 4, type: "standard", icaMarks: 18, seeMarks: 50, isLocked: true },
      { id: "c2", code: "SUB2", name: "Sub 2", credits: 4, type: "standard", icaMarks: 35, seeMarks: 65, isLocked: false },
    ];

    const plan = optimizeForTargetSgpa(courses, 7.0);
    expect(plan.feasible).toBe(false);
    expect(plan.message).toContain("failing passing minimums");
  });

  it("returns feasible: false when target exceeds 10.00", () => {
    const courses: Course[] = [
      { id: "c1", code: "SUB1", name: "Sub 1", credits: 4, type: "standard", icaMarks: 35, seeMarks: 65, isLocked: false },
    ];

    const plan = optimizeForTargetSgpa(courses, 10.5);
    expect(plan.feasible).toBe(false);
    expect(plan.message).toContain("exceeds maximum possible SGPA");
  });
});

describe("Storage Persistence & Data Bridging", () => {
  it("generates and parses export JSON correctly", () => {
    const state = {
      version: 1,
      semesterLabel: "Semester 4",
      targetSgpa: 8.75,
      subjects: [
        {
          id: "s1",
          name: "Algorithms",
          code: "CS401",
          credits: 4,
          courseType: "standard" as const,
          icaMarks: 40,
          icaMax: 50,
          seeMarks: 80,
          seeMax: 100,
        },
      ],
      appliedHistory: [],
    };

    const json = generateExportJson(state);
    const parsed = JSON.parse(json);
    expect(parsed.semesterLabel).toBe("Semester 4");
    expect(parsed.targetSgpa).toBe(8.75);
    expect(parsed.subjects.length).toBe(1);
    expect(parsed.subjects[0].name).toBe("Algorithms");
  });

  it("saves, loads, and clears data via storage helper", () => {
    const mockStorage: Record<string, string> = {};
    const originalWindow = globalThis.window;
    (globalThis as unknown as { window: unknown }).window = {
      localStorage: {
        getItem: (k: string) => mockStorage[k] || null,
        setItem: (k: string, v: string) => { mockStorage[k] = v; },
        removeItem: (k: string) => { delete mockStorage[k]; },
      },
    };

    const state = {
      version: 1,
      semesterLabel: "Semester 5",
      targetSgpa: 8.9,
      subjects: [
        {
          id: "sub-test",
          name: "Operating Systems",
          credits: 4,
          courseType: "standard" as const,
          icaMarks: 42,
          icaMax: 50,
          seeMarks: 84,
          seeMax: 100,
        },
      ],
      appliedHistory: [],
    };

    saveStoredData(state);
    const loaded = loadStoredData();
    expect(loaded.semesterLabel).toBe("Semester 5");
    expect(loaded.subjects.length).toBe(1);
    expect(loaded.subjects[0].name).toBe("Operating Systems");

    clearStoredData();
    const afterClear = loadStoredData();
    expect(afterClear.subjects.length).toBe(0);

    (globalThis as unknown as { window: unknown }).window = originalWindow;
  });
});

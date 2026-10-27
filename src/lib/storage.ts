import { AcademicStoreState, Subject } from "@/types/academic";

const STORAGE_KEY = "nmims_gpa_calculator_v1";
const HUD_STORAGE_KEY = "nmims_user_courses";

export const DEFAULT_INITIAL_STATE: AcademicStoreState = {
  version: 1,
  semesterLabel: "Semester 3",
  targetSgpa: 8.5,
  subjects: [],
  appliedHistory: [],
};

export function loadStoredData(): AcademicStoreState {
  if (typeof window === "undefined") {
    return DEFAULT_INITIAL_STATE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.subjects)) {
        return {
          version: parsed.version || 1,
          semesterLabel: parsed.semesterLabel || "Semester 3",
          targetSgpa: typeof parsed.targetSgpa === "number" ? parsed.targetSgpa : 8.5,
          subjects: parsed.subjects,
          appliedHistory: Array.isArray(parsed.appliedHistory) ? parsed.appliedHistory : [],
        };
      }
    }

    // Fallback: check if subjects were entered on the HUD dashboard
    const hudRaw = window.localStorage.getItem(HUD_STORAGE_KEY);
    if (hudRaw) {
      const parsed = JSON.parse(hudRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const convertedSubjects: Subject[] = parsed.map((c, idx) => ({
          id: c.id || `hud-${idx}`,
          name: c.name || `Subject ${idx + 1}`,
          code: c.code || `SUB${idx + 1}`,
          credits: c.credits || 3,
          courseType: c.type === 'ica_only' ? 'ica-only' : 'standard',
          icaMarks: typeof c.icaMarks === 'number' ? c.icaMarks : 35,
          icaMax: 50,
          seeMarks: typeof c.seeMarks === 'number' ? c.seeMarks : 70,
          seeMax: 100,
          isIcaLocked: Boolean(c.isLocked),
          isSeeLocked: Boolean(c.isLocked),
          isIcaAbsent: Boolean(c.isAbsent),
          isSeeAbsent: Boolean(c.isAbsent),
        }));
        return {
          version: 1,
          semesterLabel: "Semester 3",
          targetSgpa: 8.5,
          subjects: convertedSubjects,
          appliedHistory: [],
        };
      }
    }
  } catch (err) {
    console.error("Failed to load stored GPA data from localStorage:", err);
  }

  return DEFAULT_INITIAL_STATE;
}

export function saveStoredData(state: AcademicStoreState): void {
  if (typeof window === "undefined") return;

  try {
    const dataToSave: AcademicStoreState = {
      version: 1,
      semesterLabel: state.semesterLabel,
      targetSgpa: state.targetSgpa,
      subjects: state.subjects,
      appliedHistory: state.appliedHistory?.slice(-10), // keep last 10 snapshots for memory sanity
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));

    // Also mirror to HUD storage so dashboard stays in sync
    const hudCourses = state.subjects.map((s) => ({
      id: s.id,
      code: s.code || s.name.substring(0, 6).toUpperCase(),
      name: s.name,
      type: s.courseType === 'ica-only' ? 'ica_only' : 'standard',
      credits: s.credits,
      icaMarks: s.icaMarks,
      seeMarks: s.courseType === 'standard' ? s.seeMarks : 0,
      isLocked: Boolean(s.isIcaLocked || s.isSeeLocked),
      isAbsent: Boolean(s.isIcaAbsent || s.isSeeAbsent),
    }));
    window.localStorage.setItem(HUD_STORAGE_KEY, JSON.stringify(hudCourses));
  } catch (err) {
    console.error("Failed to save GPA data to localStorage:", err);
  }
}

export function clearStoredData(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(HUD_STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear GPA data:", err);
  }
}

export function generateExportJson(state: AcademicStoreState): string {
  const exportPayload = {
    version: 1,
    app: "GPA Calculator",
    timestamp: new Date().toISOString(),
    semesterLabel: state.semesterLabel,
    targetSgpa: state.targetSgpa,
    subjects: state.subjects,
  };

  return JSON.stringify(exportPayload, null, 2);
}

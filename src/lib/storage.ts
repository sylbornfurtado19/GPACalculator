import { AcademicStoreState, Subject } from "@/types/academic";
import { AcademicExportSchema } from "./validation";

const STORAGE_KEY = "nmims_gpa_calculator_v1";

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
    if (!raw) return DEFAULT_INITIAL_STATE;

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
  } catch (err) {
    console.error("Failed to save GPA data to localStorage:", err);
  }
}

export function clearStoredData(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
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

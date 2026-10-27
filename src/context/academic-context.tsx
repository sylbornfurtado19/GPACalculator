"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useSyncExternalStore } from "react";
import {
  AcademicStoreState,
  EvaluatedSubject,
  SgpaSummary,
  Subject,
  TargetRecommendation,
} from "@/types/academic";
import { calculateSgpa } from "@/lib/gpa";
import { loadStoredData, saveStoredData, DEFAULT_INITIAL_STATE } from "@/lib/storage";
import { CURRICULUM_PRESETS } from "@/lib/presets";

interface AcademicContextValue {
  isHydrated: boolean;
  subjects: Subject[];
  semesterLabel: string;
  targetSgpa: number;
  evaluatedSubjects: EvaluatedSubject[];
  summary: SgpaSummary;
  canUndo: boolean;
  lastPlanDescription?: string;

  // Actions
  addSubject: (subject: Omit<Subject, "id">) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  duplicateSubject: (id: string) => void;
  deleteSubject: (id: string) => void;
  setSemesterLabel: (label: string) => void;
  setTargetSgpa: (target: number) => void;
  loadPreset: (presetId: string) => void;
  applyOptimizerPlan: (recommendations: TargetRecommendation[], description?: string) => void;
  undoLastPlan: () => void;
  resetAll: () => void;
  importState: (newState: AcademicStoreState) => void;
  getCurrentState: () => AcademicStoreState;
}

const AcademicContext = createContext<AcademicContextValue | null>(null);

const emptySubscribe = () => () => {};

export function AcademicProvider({ children }: { children: React.ReactNode }) {
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [state, setState] = useState<AcademicStoreState>(() => {
    if (typeof window !== "undefined") {
      return loadStoredData();
    }
    return DEFAULT_INITIAL_STATE;
  });

  // Sync to localStorage whenever state updates, only if hydrated
  useEffect(() => {
    if (isHydrated) {
      saveStoredData(state);
    }
  }, [state, isHydrated]);

  // Evaluated subjects and credit-weighted SGPA
  const { summary, evaluatedSubjects } = useMemo(() => {
    return calculateSgpa(state.subjects);
  }, [state.subjects]);

  const addSubject = useCallback((newSubData: Omit<Subject, "id">) => {
    const newId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newSubject: Subject = {
      ...newSubData,
      id: newId,
    };
    setState((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }));
  }, []);

  const updateSubject = useCallback((id: string, updates: Partial<Subject>) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, []);

  const duplicateSubject = useCallback((id: string) => {
    setState((prev) => {
      const existing = prev.subjects.find((s) => s.id === id);
      if (!existing) return prev;
      const clone: Subject = {
        ...existing,
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: `${existing.name} (Copy)`,
      };
      return {
        ...prev,
        subjects: [...prev.subjects, clone],
      };
    });
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== id),
    }));
  }, []);

  const setSemesterLabel = useCallback((label: string) => {
    setState((prev) => ({ ...prev, semesterLabel: label }));
  }, []);

  const setTargetSgpa = useCallback((target: number) => {
    const clamped = Math.max(0, Math.min(10, Number(target) || 0));
    setState((prev) => ({ ...prev, targetSgpa: clamped }));
  }, []);

  const loadPreset = useCallback((presetId: string) => {
    const preset = CURRICULUM_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setState((prev) => ({
      ...prev,
      semesterLabel: preset.name,
      targetSgpa: preset.targetSgpa,
      subjects: preset.subjects.map((s) => ({
        ...s,
        id: `preset_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      })),
      appliedHistory: [
        ...(prev.appliedHistory || []),
        {
          timestamp: Date.now(),
          description: `Loaded preset: ${preset.name}`,
          previousSubjects: prev.subjects,
        },
      ],
    }));
  }, []);

  const applyOptimizerPlan = useCallback(
    (recommendations: TargetRecommendation[], description?: string) => {
      setState((prev) => {
        const historyEntry = {
          timestamp: Date.now(),
          description: description || "Applied Target Planner recommendations",
          previousSubjects: prev.subjects,
        };

        const updatedSubjects = prev.subjects.map((sub) => {
          const rec = recommendations.find((r) => r.subjectId === sub.id);
          if (!rec) return sub;
          return {
            ...sub,
            icaMarks: rec.recommendedIca,
            seeMarks: rec.courseType === "standard" ? rec.recommendedSee : sub.seeMarks,
          };
        });

        return {
          ...prev,
          subjects: updatedSubjects,
          appliedHistory: [...(prev.appliedHistory || []), historyEntry],
        };
      });
    },
    []
  );

  const undoLastPlan = useCallback(() => {
    setState((prev) => {
      if (!prev.appliedHistory || prev.appliedHistory.length === 0) return prev;
      const historyCopy = [...prev.appliedHistory];
      const lastEntry = historyCopy.pop();
      if (!lastEntry) return prev;

      return {
        ...prev,
        subjects: lastEntry.previousSubjects,
        appliedHistory: historyCopy,
      };
    });
  }, []);

  const resetAll = useCallback(() => {
    setState((prev) => ({
      ...DEFAULT_INITIAL_STATE,
      appliedHistory: [
        ...(prev.appliedHistory || []),
        {
          timestamp: Date.now(),
          description: "Reset to empty state",
          previousSubjects: prev.subjects,
        },
      ],
    }));
  }, []);

  const importState = useCallback((newState: AcademicStoreState) => {
    setState(newState);
  }, []);

  const getCurrentState = useCallback(() => state, [state]);

  const canUndo = Boolean(state.appliedHistory && state.appliedHistory.length > 0);
  const lastPlanDescription = canUndo && state.appliedHistory
    ? state.appliedHistory[state.appliedHistory.length - 1]?.description
    : undefined;

  const value: AcademicContextValue = {
    isHydrated,
    subjects: state.subjects,
    semesterLabel: state.semesterLabel,
    targetSgpa: state.targetSgpa,
    evaluatedSubjects,
    summary,
    canUndo,
    lastPlanDescription,
    addSubject,
    updateSubject,
    duplicateSubject,
    deleteSubject,
    setSemesterLabel,
    setTargetSgpa,
    loadPreset,
    applyOptimizerPlan,
    undoLastPlan,
    resetAll,
    importState,
    getCurrentState,
  };

  return <AcademicContext.Provider value={value}>{children}</AcademicContext.Provider>;
}

export function useAcademic(): AcademicContextValue {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error("useAcademic must be used within an AcademicProvider");
  }
  return context;
}

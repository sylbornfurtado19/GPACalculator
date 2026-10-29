"use client";

import React, { useState } from "react";
import { GraduationCap, BookOpen, Layers, CheckCircle2, ChevronRight, X } from "lucide-react";

export interface BranchOption {
  id: string;
  name: string;
  code: string;
}

export const BRANCHES: BranchOption[] = [
  { id: "ce", name: "Computer Engineering", code: "CE" },
  { id: "it", name: "Information Technology", code: "IT" },
  { id: "csds", name: "Computer Science & Data Science", code: "CS-DS" },
  { id: "aids", name: "Artificial Intelligence & Data Science", code: "AI & DS" },
  { id: "aiml", name: "Artificial Intelligence & Machine Learning", code: "AI & ML" },
  { id: "extc", name: "Electronics & Telecommunication", code: "EXTC" },
  { id: "me", name: "Mechanical Engineering", code: "ME" },
  { id: "civil", name: "Civil Engineering", code: "CIVIL" },
];

export const SEMESTERS = [
  { id: 1, label: "Semester 1" },
  { id: 2, label: "Semester 2" },
  { id: 3, label: "Semester 3" },
  { id: 4, label: "Semester 4" },
  { id: 5, label: "Semester 5" },
  { id: 6, label: "Semester 6" },
  { id: 7, label: "Semester 7" },
  { id: 8, label: "Semester 8" },
];

interface Props {
  isOpen: boolean;
  currentBranch?: string;
  currentSemester?: number;
  onSelect: (branchId: string, semesterId: number) => void;
  onClose?: () => void;
  isDismissable?: boolean;
}

export function BranchSemesterModal({
  isOpen,
  currentBranch = "",
  currentSemester = 1,
  onSelect,
  onClose,
  isDismissable = true,
}: Props) {
  const [selectedBranch, setSelectedBranch] = useState<string>(currentBranch || "ce");
  const [selectedSemester, setSelectedSemester] = useState<number>(currentSemester || 1);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedBranch || !selectedSemester) return;
    onSelect(selectedBranch, selectedSemester);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#11131A] border border-slate-200 dark:border-white/[0.12] rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-6 relative">
        {/* Optional Close Button */}
        {isDismissable && onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.08] transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-cyan-500/10 text-indigo-600 dark:text-cyan-400 mb-1">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Select Branch & Semester
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto">
            Choose your academic program to set up your semester curriculum and subjects.
          </p>
        </div>

        {/* Step 1: Branch Selection */}
        <div className="space-y-2.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" /> 1. Select Branch
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {BRANCHES.map((b) => {
              const active = selectedBranch === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBranch(b.id)}
                  className={`text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between gap-1 relative cursor-pointer ${
                    active
                      ? "border-indigo-600 dark:border-cyan-500 bg-indigo-50/70 dark:bg-cyan-500/10 text-indigo-950 dark:text-cyan-200 font-semibold ring-2 ring-indigo-500/20 dark:ring-cyan-500/20"
                      : "border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] text-slate-700 dark:text-neutral-300 bg-slate-50/50 dark:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-sm tracking-tight">{b.code}</span>
                    {active && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-neutral-400 truncate w-full">
                    {b.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Semester Selection */}
        <div className="space-y-2.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" /> 2. Select Semester
          </label>
          <div className="grid grid-cols-4 gap-2">
            {SEMESTERS.map((s) => {
              const active = selectedSemester === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSemester(s.id)}
                  className={`py-2.5 px-2 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                    active
                      ? "border-indigo-600 dark:border-cyan-500 bg-indigo-600 dark:bg-cyan-500 text-white dark:text-black shadow-sm ring-2 ring-indigo-500/20"
                      : "border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] text-slate-700 dark:text-neutral-300 bg-slate-50/50 dark:bg-white/[0.02]"
                  }`}
                >
                  Sem {s.id}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            disabled={!selectedBranch || !selectedSemester}
            onClick={handleConfirm}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-black text-white text-xs font-bold tracking-wide transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            Continue with Selected Curriculum
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}


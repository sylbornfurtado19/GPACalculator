"use client";

import React, { useState } from "react";
import { GraduationCap, BookOpen, Layers, CheckCircle2, ChevronRight, X, Calendar, AlertCircle } from "lucide-react";
import { BATCHES, BRANCHES, BatchOption, BranchOption } from "../lib/srb-database";

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
  currentBatch?: string;
  currentBranch?: string;
  currentSemester?: number;
  onSelect: (batchId: string, branchId: string, semesterId: number) => void;
  onClose?: () => void;
  isDismissable?: boolean;
}

export function BranchSemesterModal({
  isOpen,
  currentBatch = "2026",
  currentBranch = "ce",
  currentSemester = 1,
  onSelect,
  onClose,
  isDismissable = true,
}: Props) {
  const [selectedBatch, setSelectedBatch] = useState<string>(currentBatch || "2026");
  const [selectedBranch, setSelectedBranch] = useState<string>(currentBranch || "ce");
  const [selectedSemester, setSelectedSemester] = useState<number>(currentSemester || 1);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedBatch || !selectedBranch || !selectedSemester) return;
    onSelect(selectedBatch, selectedBranch, selectedSemester);
  };

  const activeBatchObj = BATCHES.find((b) => b.id === selectedBatch);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#11131A] border border-slate-200 dark:border-white/[0.12] rounded-3xl w-full max-w-xl shadow-2xl p-5 sm:p-6 space-y-5 relative max-h-[92vh] overflow-y-auto">
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
        <div className="text-center space-y-1 pt-1">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-cyan-500/10 text-indigo-600 dark:text-cyan-400 mb-1 shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Select Your Academic Curriculum
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-md mx-auto">
            Choose your admission batch, engineering branch, and current semester to auto-load official syllabus courses and credits.
          </p>
        </div>

        {/* Step 1: Batch / Year Selection */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" /> 1. Select Batch / Academic Year
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {BATCHES.map((b) => {
              const active = selectedBatch === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBatch(b.id)}
                  className={`text-left p-3 rounded-2xl border transition-all text-xs flex flex-col justify-between gap-1.5 relative cursor-pointer ${
                    active
                      ? "border-indigo-600 dark:border-cyan-500 bg-indigo-50/70 dark:bg-cyan-500/10 text-indigo-950 dark:text-cyan-100 font-semibold ring-2 ring-indigo-500/20 dark:ring-cyan-500/20 shadow-xs"
                      : "border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] text-slate-700 dark:text-neutral-300 bg-slate-50/60 dark:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-sm tracking-tight">{b.label}</span>
                    {active && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-neutral-400 leading-tight">
                    {b.yearLabel}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-neutral-500 line-clamp-2">
                    {b.hasCoursera ? "Coursera included in syllabus" : "Coursera manual add"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Branch Selection */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" /> 2. Select Department / Branch
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
            {BRANCHES.map((b) => {
              const active = selectedBranch === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBranch(b.id)}
                  className={`text-left p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-between gap-1 relative cursor-pointer ${
                    active
                      ? "border-indigo-600 dark:border-cyan-500 bg-indigo-50/70 dark:bg-cyan-500/10 text-indigo-950 dark:text-cyan-100 font-semibold ring-2 ring-indigo-500/20 dark:ring-cyan-500/20"
                      : "border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] text-slate-700 dark:text-neutral-300 bg-slate-50/50 dark:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs tracking-tight">{b.code}</span>
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

        {/* Step 3: Semester Selection */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" /> 3. Select Semester
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {SEMESTERS.map((s) => {
              const active = selectedSemester === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSemester(s.id)}
                  className={`py-2 px-1 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
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

        {/* Dynamic Batch Note */}
        {activeBatchObj && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-[11px] leading-relaxed">
              <span className="font-semibold">{activeBatchObj.label} Notice: </span>
              {selectedBatch === "2026" && (
                <span>Coursera credits and &apos;Only ICA&apos; evaluation are directly included in your syllabus courses.</span>
              )}
              {selectedBatch === "2025" && (
                <span>Coursera is not printed in the 2025 SRB. If you are enrolled in Coursera, you can easily add it to your subject list with one click.</span>
              )}
              {selectedBatch === "2024" && (
                <span>Coursera and Design Experience are not listed in the 2024 SRB. You can manually add both via one-click shortcuts on your dashboard.</span>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-1">
          <button
            type="button"
            disabled={!selectedBatch || !selectedBranch || !selectedSemester}
            onClick={handleConfirm}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-black text-white text-xs font-bold tracking-wide transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            Load Official SRB Curriculum
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

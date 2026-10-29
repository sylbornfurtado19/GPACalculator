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
  const activeBranchObj = BRANCHES.find((b) => b.id === selectedBranch);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#11131A] border-t sm:border border-slate-200/90 dark:border-white/[0.12] rounded-t-[28px] sm:rounded-3xl w-full max-w-xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        {/* Mobile Drag Indicator Bar */}
        <div className="w-12 h-1 bg-slate-300 dark:bg-white/20 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Modal Header (Pinned at Top) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3.5 border-b border-slate-100 dark:border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 dark:bg-cyan-500/10 text-indigo-600 dark:text-cyan-400 flex items-center justify-center shrink-0 shadow-xs">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                Select Academic Curriculum
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400 line-clamp-1">
                Auto-loads official syllabus courses and credits
              </p>
            </div>
          </div>

          {/* Optional Close Button */}
          {isDismissable && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 -mr-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition cursor-pointer"
              aria-label="Close curriculum modal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-3 sm:py-4 space-y-4 sm:space-y-5 touch-pan-y">
          {/* Step 1: Batch / Year Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" /> 1. Admission Batch
              </label>
              <span className="text-[10px] text-indigo-600 dark:text-cyan-400 font-medium">
                {activeBatchObj?.yearLabel || "Select Batch"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {BATCHES.map((b) => {
                const active = selectedBatch === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBatch(b.id)}
                    className={`text-left p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all text-xs flex flex-col justify-between gap-1 relative cursor-pointer active:scale-[0.98] min-h-[72px] sm:min-h-[80px] ${
                      active
                        ? "border-indigo-600 dark:border-cyan-500 bg-indigo-50/80 dark:bg-cyan-500/15 text-indigo-950 dark:text-cyan-100 font-semibold ring-2 ring-indigo-500/20 dark:ring-cyan-500/20 shadow-xs"
                        : "border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] text-slate-700 dark:text-neutral-300 bg-slate-50/60 dark:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs sm:text-sm tracking-tight">{b.label}</span>
                      {active && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400 shrink-0" />}
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-neutral-400 leading-tight">
                      {b.yearLabel.split(" (")[0]}
                    </span>
                    <span
                      className={`text-[9px] px-1 py-0.5 rounded w-fit font-medium truncate max-w-full ${
                        b.hasCoursera
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "bg-slate-200/60 dark:bg-white/[0.08] text-slate-600 dark:text-neutral-400"
                      }`}
                    >
                      {b.hasCoursera ? "Coursera Built-in" : "Manual Coursera"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Branch Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" /> 2. Department / Branch
              </label>
              <span className="text-[10px] text-indigo-600 dark:text-cyan-400 font-medium">
                {activeBranchObj?.name || "Select Branch"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 max-h-48 sm:max-h-52 overflow-y-auto overscroll-contain pr-1">
              {BRANCHES.map((b) => {
                const active = selectedBranch === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBranch(b.id)}
                    className={`text-left p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-between gap-0.5 relative cursor-pointer active:scale-[0.98] min-h-[50px] ${
                      active
                        ? "border-indigo-600 dark:border-cyan-500 bg-indigo-50/80 dark:bg-cyan-500/15 text-indigo-950 dark:text-cyan-100 font-semibold ring-2 ring-indigo-500/20 dark:ring-cyan-500/20"
                        : "border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] text-slate-700 dark:text-neutral-300 bg-slate-50/50 dark:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs tracking-tight">{b.code}</span>
                      {active && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-neutral-400 truncate w-full">
                      {b.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Semester Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" /> 3. Current Semester
              </label>
              <span className="text-[10px] text-indigo-600 dark:text-cyan-400 font-medium">
                Semester {selectedSemester}
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {SEMESTERS.map((s) => {
                const active = selectedSemester === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSemester(s.id)}
                    className={`py-2 px-1 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer active:scale-95 min-h-[40px] flex items-center justify-center ${
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
                <span className="font-semibold">{activeBatchObj.label} Note: </span>
                {selectedBatch === "2026" && (
                  <span>Coursera credits and &apos;Only ICA&apos; evaluation are directly included in your syllabus courses.</span>
                )}
                {selectedBatch === "2025" && (
                  <span>Coursera is not printed in the 2025 SRB. You can easily add it to your subject list with one click from your dashboard.</span>
                )}
                {selectedBatch === "2024" && (
                  <span>Coursera and Design Experience are not listed in the 2024 SRB. You can manually add both via one-click shortcuts on your dashboard.</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer Bar (Pinned at Bottom with Safe Area) */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-t border-slate-100 dark:border-white/[0.06] bg-white/95 dark:bg-[#11131A]/95 backdrop-blur-md shrink-0">
          <button
            type="button"
            disabled={!selectedBatch || !selectedBranch || !selectedSemester}
            onClick={handleConfirm}
            className="w-full flex items-center justify-between sm:justify-center gap-2 py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-black text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            <span>Load Official SRB Curriculum</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/20 dark:bg-black/20 text-[11px] font-semibold">
              &apos;{selectedBatch.slice(-2)} · {activeBranchObj?.code || "Branch"} · Sem {selectedSemester}
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

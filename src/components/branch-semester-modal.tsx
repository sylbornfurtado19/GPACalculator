"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  BookOpen,
  Layers,
  CheckCircle2,
  ChevronRight,
  X,
  Calendar,
  AlertCircle,
  Award,
} from "lucide-react";
import {
  BATCHES,
  BRANCHES,
  PROGRAMS,
  ProgramType,
  getBatchLabel,
} from "../lib/srb-database";

export const ALL_SEMESTERS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  label: `Sem ${i + 1}`,
}));

interface Props {
  isOpen: boolean;
  currentBatch?: string;
  currentProgram?: ProgramType;
  currentBranch?: string;
  currentSemester?: number;
  onSelect: (
    batchId: string,
    programId: ProgramType,
    branchId: string,
    semesterId: number
  ) => void;
  onClose?: () => void;
  isDismissable?: boolean;
}

export function BranchSemesterModal({
  isOpen,
  currentBatch = "2026",
  currentProgram = "btech",
  currentBranch = "ce",
  currentSemester = 1,
  onSelect,
  onClose,
  isDismissable = true,
}: Props) {
  const [selectedBatch, setSelectedBatch] = useState<string>(currentBatch || "2026");
  const [selectedProgram, setSelectedProgram] = useState<ProgramType>(
    currentProgram || "btech"
  );
  const [selectedBranch, setSelectedBranch] = useState<string>(
    currentBranch || "ce"
  );
  const [selectedSemester, setSelectedSemester] = useState<number>(
    currentSemester || 1
  );

  if (!isOpen) return null;

  const activeProgObj =
    PROGRAMS.find((p) => p.id === selectedProgram) || PROGRAMS[0];

  const handleProgramChange = (progId: ProgramType) => {
    setSelectedProgram(progId);
    const targetProg = PROGRAMS.find((p) => p.id === progId);
    if (targetProg && selectedSemester > targetProg.semestersCount) {
      setSelectedSemester(1);
    }
  };

  const handleConfirm = () => {
    if (!selectedBatch || !selectedProgram || !selectedBranch || !selectedSemester)
      return;
    onSelect(selectedBatch, selectedProgram, selectedBranch, selectedSemester);
  };

  const activeBatchObj = BATCHES.find((b) => b.id === selectedBatch);
  const activeBranchObj = BRANCHES.find((b) => b.id === selectedBranch);

  const availableSemesters = ALL_SEMESTERS.slice(0, activeProgObj.semestersCount);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#11131A] border-t sm:border border-slate-200/90 dark:border-white/[0.12] rounded-t-[28px] sm:rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85dvh] sm:max-h-[88vh] overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        {/* Mobile Drag Indicator Bar */}
        <div className="w-10 h-1 bg-slate-300 dark:bg-white/20 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Modal Header (Pinned at Top) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3.5 border-b border-slate-100 dark:border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 dark:bg-cyan-500/10 text-indigo-600 dark:text-cyan-400 flex items-center justify-center shrink-0 shadow-xs">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight truncate">
                Select Academic Curriculum
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                Syllabus courses &amp; credits load automatically
              </p>
            </div>
          </div>

          {/* Optional Close Button */}
          {isDismissable && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 -mr-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition cursor-pointer shrink-0 ml-2"
              aria-label="Close curriculum modal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-3 space-y-3.5 touch-pan-y">
          {/* Step 1: Degree Program Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" /> 1. Degree Program
              </label>
              <span className="text-[10px] text-indigo-600 dark:text-cyan-400 font-semibold truncate">
                {activeProgObj.fullName}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-white/[0.05] rounded-xl border border-slate-200/60 dark:border-white/[0.08] w-full">
              {PROGRAMS.map((prog) => {
                const active = selectedProgram === prog.id;
                return (
                  <button
                    key={prog.id}
                    type="button"
                    onClick={() => handleProgramChange(prog.id)}
                    className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer min-w-0 ${
                      active
                        ? "bg-white dark:bg-cyan-500 text-indigo-950 dark:text-black font-bold shadow-xs ring-1 ring-black/5 dark:ring-cyan-500/20"
                        : "text-slate-600 dark:text-neutral-400 font-medium hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{prog.label}</div>
                    <div className="text-[10px] opacity-75 truncate">{prog.semestersCount} Sems</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Batch / Year Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" /> 2. Admission Batch
              </label>
              <span className="text-[10px] text-indigo-600 dark:text-cyan-400 font-semibold truncate">
                {activeBatchObj?.yearLabel.split(" (")[0]}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 w-full">
              {BATCHES.map((b) => {
                const active = selectedBatch === b.id;
                const batchYear = getBatchLabel(b.id, selectedProgram).replace("Batch ", "");
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBatch(b.id)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer min-w-0 flex flex-col justify-between gap-1 active:scale-[0.98] ${
                      active
                        ? "border-indigo-600 dark:border-cyan-500 bg-indigo-50/80 dark:bg-cyan-500/15 text-indigo-950 dark:text-cyan-100 font-semibold ring-1 ring-indigo-500/20 shadow-xs"
                        : "border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] text-slate-700 dark:text-neutral-300 bg-slate-50/60 dark:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full min-w-0">
                      <span className="font-bold text-xs truncate">{batchYear}</span>
                      {active && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400 shrink-0 ml-1" />}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-neutral-400 truncate">
                      {b.yearLabel.split(" (")[0]}
                    </span>
                    <span
                      className={`text-[9px] px-1 py-0.5 rounded font-medium truncate max-w-full ${
                        b.hasCoursera
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "bg-slate-200/60 dark:bg-white/[0.08] text-slate-600 dark:text-neutral-400"
                      }`}
                    >
                      {b.hasCoursera ? "Coursera Incl." : "Manual Coursera"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Branch Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" /> 3. Department / Branch
              </label>
              <span className="text-[10px] text-indigo-600 dark:text-cyan-400 font-semibold truncate max-w-[150px]">
                {activeBranchObj?.name || "Select Branch"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-36 sm:max-h-40 overflow-y-auto overscroll-contain pr-1 w-full">
              {BRANCHES.map((b) => {
                const active = selectedBranch === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBranch(b.id)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer active:scale-[0.98] min-w-0 flex items-center justify-between gap-1.5 ${
                      active
                        ? "border-indigo-600 dark:border-cyan-500 bg-indigo-50/80 dark:bg-cyan-500/15 text-indigo-950 dark:text-cyan-100 font-semibold ring-1 ring-indigo-500/20"
                        : "border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] text-slate-700 dark:text-neutral-300 bg-slate-50/50 dark:bg-white/[0.02]"
                    }`}
                  >
                    <div className="min-w-0 truncate">
                      <div className="font-bold text-xs tracking-tight truncate">{b.code}</div>
                      <div className="text-[10px] text-slate-500 dark:text-neutral-400 truncate">{b.name}</div>
                    </div>
                    {active && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Semester Selection (Adaptive to Degree Program) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" /> 4. Current Semester ({availableSemesters.length} Total)
              </label>
              <span className="text-[10px] text-indigo-600 dark:text-cyan-400 font-semibold">
                Semester {selectedSemester}
              </span>
            </div>

            <div
              className={`grid gap-1.5 w-full ${
                selectedProgram === "mbatech"
                  ? "grid-cols-5"
                  : selectedProgram === "diploma"
                  ? "grid-cols-3 sm:grid-cols-6"
                  : "grid-cols-4 sm:grid-cols-8"
              }`}
            >
              {availableSemesters.map((s) => {
                const active = selectedSemester === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSemester(s.id)}
                    className={`py-2 px-1 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer active:scale-95 min-h-[38px] min-w-0 flex items-center justify-center ${
                      active
                        ? "border-indigo-600 dark:border-cyan-500 bg-indigo-600 dark:bg-cyan-500 text-white dark:text-black shadow-sm ring-1 ring-indigo-500/20"
                        : "border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] text-slate-700 dark:text-neutral-300 bg-slate-50/50 dark:bg-white/[0.02]"
                    }`}
                  >
                    Sem {s.id}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Batch & Program Guidance Note */}
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-[11px] leading-relaxed">
              <span className="font-semibold">{activeProgObj.label} · {getBatchLabel(selectedBatch, selectedProgram)}: </span>
              {selectedProgram === "mbatech" && (
                <span>10 Semesters total (core engineering + business foundations in Sem 1–8, management &amp; internship in Sem 9–10).</span>
              )}
              {selectedProgram === "diploma" && (
                <span>6 Semesters total (concluding with in-plant industrial training in Semester 6).</span>
              )}
              {selectedProgram === "btech" && (
                <>
                  {selectedBatch === "2026" && (
                    <span>Coursera credits and &apos;Only ICA&apos; evaluation are directly included in your syllabus.</span>
                  )}
                  {selectedBatch === "2025" && (
                    <span>Coursera is not printed in the 2025 SRB. You can add it with 1-click on your dashboard.</span>
                  )}
                  {selectedBatch === "2024" && (
                    <span>Coursera and Design Experience are manual for 2024. 1-click shortcuts are on your dashboard.</span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal Sticky Footer Bar (Always Pinned at Bottom with Safe Area) */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 dark:border-white/[0.06] bg-white/95 dark:bg-[#11131A]/95 backdrop-blur-md shrink-0">
          <button
            type="button"
            disabled={!selectedBatch || !selectedProgram || !selectedBranch || !selectedSemester}
            onClick={handleConfirm}
            className="w-full flex items-center justify-between sm:justify-center gap-2 py-3 px-4 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-black text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            <span className="truncate">Load Official SRB Curriculum</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/20 dark:bg-black/20 text-[11px] font-semibold shrink-0">
              &apos;{selectedBatch.slice(-2)} · {activeProgObj.code} · {activeBranchObj?.code || "Branch"} · Sem {selectedSemester}
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

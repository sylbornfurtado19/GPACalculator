"use client";
import React, { useState } from 'react';
import { SemesterTelemetry } from '../../lib/gpa-engine';
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Sliders,
  Minus,
  Plus,
} from 'lucide-react';

interface TelemetryHudProps {
  telemetry: SemesterTelemetry;
  targetSgpa: number;
  onTargetChange: (newTarget: number) => void;
  simulatedSgpa?: number | null;
  activeScenarioName?: string | null;
  isGhostModeActive: boolean;
  onToggleGhostMode?: () => void;
  canApplyPlan?: boolean;
  onApplyPlan?: () => void;
  unlockedCount: number;
}

export const TelemetryHud: React.FC<TelemetryHudProps> = ({
  telemetry,
  targetSgpa,
  onTargetChange,
  simulatedSgpa,
  activeScenarioName,
  isGhostModeActive,
  canApplyPlan = false,
  onApplyPlan,
  unlockedCount,
}) => {
  const [isTargetExpanded, setIsTargetExpanded] = useState(false);

  const currentSgpa = telemetry.sgpa;
  const effectiveSgpa =
    simulatedSgpa !== null && simulatedSgpa !== undefined
      ? simulatedSgpa
      : currentSgpa;
  const diff = Math.round((effectiveSgpa - targetSgpa) * 100) / 100;
  const isAhead = diff >= 0;

  // Clean Symmetrical Arc Gauge Math
  // Sweep angle: 220 degrees (symmetrical with gap at the bottom)
  const radius = 36;
  const strokeWidth = 5.5;
  const arcTotalAngle = 220;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (arcTotalAngle / 360) * circumference;
  const progressRatio = Math.min(1, Math.max(0, effectiveSgpa / 10));
  const strokeDashoffset = arcLength - progressRatio * arcLength;

  const presetTargets = [7.5, 8.0, 8.5, 9.0, 9.5];

  return (
    <div className="relative w-full rounded-2xl bg-white dark:bg-[#11131A] border border-slate-200/80 dark:border-white/[0.08] shadow-xs p-4 sm:p-5 transition-all">
      {/* Ambient gradient */}
      <div className="absolute top-0 right-1/4 w-72 h-36 bg-indigo-500/[0.03] dark:bg-cyan-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      {/* Main Top Area: Responsive Stack on mobile, side-by-side on desktop */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
        {/* Left / Top: Master SGPA Gauge + Academic Standing */}
        <div className="flex items-center gap-3.5 sm:gap-5">
          {/* Symmetrical Sgpa Ring (No stray artifacts) */}
          <div className="relative flex items-center justify-center shrink-0 w-20 h-20 sm:w-24 sm:h-24">
            <svg
              className="w-20 h-20 sm:w-24 sm:h-24"
              viewBox="0 0 100 100"
              style={{ transform: 'rotate(160deg)' }}
            >
              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="currentColor"
                className="text-slate-100 dark:text-white/[0.08]"
                strokeWidth={strokeWidth}
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeLinecap="round"
              />
              {/* Dynamic Progress Arc */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={
                  telemetry.hasFailures
                    ? '#e11d48'
                    : isAhead
                    ? '#059669'
                    : '#4f46e5'
                }
                strokeWidth={strokeWidth}
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>

            {/* Inner SGPA Value */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 dark:text-neutral-500">
                {activeScenarioName ? 'Simulated' : 'SGPA'}
              </span>
              <span className="text-xl sm:text-2xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white leading-tight">
                {effectiveSgpa.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Standing Title & Status */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-neutral-400">
                Academic Standing
              </span>
              {telemetry.hasFailures ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-500/20">
                  <AlertTriangle className="w-3 h-3" />
                  {telemetry.failedCoursesCount} Backlog{telemetry.failedCoursesCount > 1 ? 's' : ''}
                </span>
              ) : telemetry.totalCredits > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> All Passing
                </span>
              ) : null}
            </div>

            <div className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-neutral-100 truncate">
              {telemetry.totalCredits === 0
                ? 'No Subjects Added'
                : telemetry.hasFailures
                ? 'Re-attempt Required'
                : effectiveSgpa >= 9.0
                ? 'Outstanding Standing'
                : effectiveSgpa >= 8.0
                ? 'First Class with Distinction'
                : effectiveSgpa >= 7.0
                ? 'First Class'
                : 'Second Class'}
            </div>

            {/* Quick Metadata Stats */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
              <span className="bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-md tabular-nums">
                {telemetry.totalCredits} Credits
              </span>
              <span className="bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-md tabular-nums">
                {telemetry.earnedGradePoints} Points
              </span>
              <span className="bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-md tabular-nums">
                {telemetry.passingCredits}/{telemetry.totalCredits} Passed
              </span>
              {unlockedCount > 0 && (
                <span className="bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-md tabular-nums text-slate-700 dark:text-neutral-300">
                  {unlockedCount} Unlocked
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right / Bottom Action Controls */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-2 border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-white/[0.08] pt-3 lg:pt-0 lg:pl-6">
          {/* Target SGPA Toggle Box (Never clips, expands inline) */}
          <button
            onClick={() => setIsTargetExpanded(!isTargetExpanded)}
            className="w-full sm:w-auto lg:w-64 flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:border-white/[0.08] transition-all cursor-pointer text-left"
            title="Click to adjust Target SGPA"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-cyan-500/10 border border-indigo-200 dark:border-cyan-500/20 flex items-center justify-center text-indigo-600 dark:text-cyan-400 shrink-0">
                <Target className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-500 dark:text-neutral-400">
                  Target SGPA
                </div>
                <div className="text-sm font-bold tabular-nums text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{targetSgpa.toFixed(2)}</span>
                  <span
                    className={`text-[11px] font-semibold px-1.5 py-0.2 rounded ${
                      isAhead
                        ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10'
                        : 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10'
                    }`}
                  >
                    {isAhead ? `+${diff.toFixed(2)} lead` : `${diff.toFixed(2)} gap`}
                  </span>
                </div>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 dark:text-neutral-500 transition-transform duration-200 ${
                isTargetExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Quick Apply Button if Ghost Mode is active and feasible */}
          {isGhostModeActive && canApplyPlan && onApplyPlan && (
            <button
              onClick={onApplyPlan}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-black font-bold text-xs transition-all shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
              title="Apply optimized marks to curriculum"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Apply Target Plan</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* INLINE EXPANDABLE TARGET SETTER (Never clips on mobile!)   */}
      {/* ========================================================= */}
      {isTargetExpanded && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-white/[0.06] animate-in fade-in slide-in-from-top-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] p-3.5 rounded-xl">
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-neutral-300">
                Adjust Target:
              </span>
              <span className="text-sm font-bold text-indigo-600 dark:text-cyan-400 tabular-nums">
                {targetSgpa.toFixed(2)} SGPA
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {presetTargets.map((pt) => (
                <button
                  key={pt}
                  onClick={() => onTargetChange(pt)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold tabular-nums transition-all cursor-pointer ${
                    targetSgpa === pt
                      ? 'bg-indigo-600 text-white dark:bg-cyan-500 dark:text-black shadow-xs'
                      : 'bg-white dark:bg-white/[0.04] text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.08]'
                  }`}
                >
                  {pt.toFixed(1)}
                </button>
              ))}
            </div>

            {/* Slider with Fine Steppers */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onTargetChange(Math.max(5.0, Math.round((targetSgpa - 0.1) * 100) / 100))}
                className="w-7 h-7 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] flex items-center justify-center text-slate-700 dark:text-neutral-300 cursor-pointer active:bg-slate-200"
                title="-0.1 SGPA"
              >
                <Minus className="w-3 h-3" />
              </button>

              <input
                type="range"
                min="5.0"
                max="10.0"
                step="0.05"
                value={targetSgpa}
                onChange={(e) => onTargetChange(parseFloat(e.target.value))}
                className="w-28 sm:w-36 accent-indigo-600 dark:accent-cyan-400 bg-slate-200 dark:bg-white/[0.08] h-1.5 rounded-lg cursor-pointer"
              />

              <button
                onClick={() => onTargetChange(Math.min(10.0, Math.round((targetSgpa + 0.1) * 100) / 100))}
                className="w-7 h-7 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] flex items-center justify-center text-slate-700 dark:text-neutral-300 cursor-pointer active:bg-slate-200"
                title="+0.1 SGPA"
              >
                <Plus className="w-3 h-3" />
              </button>

              <button
                onClick={() => setIsTargetExpanded(false)}
                className="ml-2 text-xs font-semibold text-indigo-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

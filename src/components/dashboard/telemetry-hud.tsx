"use client";
import React, { useState, useRef, useEffect } from 'react';
import { SemesterTelemetry } from '../../lib/gpa-engine';
import { Target, AlertTriangle, CheckCircle2, ChevronRight, Sliders, Sparkles } from 'lucide-react';

interface TelemetryHudProps {
  telemetry: SemesterTelemetry;
  targetSgpa: number;
  onTargetChange: (newTarget: number) => void;
  simulatedSgpa?: number | null;
  activeScenarioName?: string | null;
  isGhostModeActive: boolean;
  onToggleGhostMode: () => void;
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
  onToggleGhostMode,
  canApplyPlan = false,
  onApplyPlan,
  unlockedCount,
}) => {
  const [showTargetPopover, setShowTargetPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const currentSgpa = telemetry.sgpa;
  const effectiveSgpa = simulatedSgpa !== null && simulatedSgpa !== undefined ? simulatedSgpa : currentSgpa;
  const diff = Math.round((effectiveSgpa - targetSgpa) * 100) / 100;
  const isAhead = diff >= 0;

  // Arc Gauge Math (semi-circle or 240 degree gauge)
  // SGPA is 0.00 to 10.00
  const radius = 38;
  const strokeWidth = 5;
  // Use a 240-degree sweep arc
  const arcTotalAngle = 240;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (arcTotalAngle / 360) * circumference;
  const progressRatio = Math.min(1, Math.max(0, effectiveSgpa / 10));
  const strokeDashoffset = arcLength - progressRatio * arcLength;

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowTargetPopover(false);
      }
    };
    if (showTargetPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTargetPopover]);

  const presetTargets = [7.5, 8.0, 8.5, 9.0, 9.5];

  return (
    <div className="relative w-full rounded-2xl bg-white dark:bg-[#11131A] border border-slate-200/80 dark:border-white/[0.08] shadow-xs p-4 sm:p-5 overflow-hidden transition-all">
      {/* Subtle background ambient mesh */}
      <div className="absolute top-0 right-1/4 w-96 h-40 bg-indigo-500/[0.03] dark:bg-cyan-500/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-1/3 w-80 h-32 bg-sky-500/[0.03] dark:bg-indigo-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
        {/* Left: The Radial Arc Telemetry Gauge & Master SGPA */}
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="relative flex items-center justify-center shrink-0 w-22 h-22 sm:w-24 sm:h-24">
            <svg className="w-22 h-22 sm:w-24 sm:h-24 -rotate-210" viewBox="0 0 100 100">
              {/* Background track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="currentColor"
                className="text-slate-200 dark:text-white/[0.08]"
                strokeWidth={strokeWidth}
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeLinecap="round"
              />
              {/* Target marker notch if applicable */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="currentColor"
                className="text-slate-400 dark:text-white/20"
                strokeWidth={strokeWidth + 2}
                strokeDasharray={`2 ${circumference}`}
                strokeDashoffset={arcLength - (targetSgpa / 10) * arcLength}
                strokeLinecap="butt"
              />
              {/* Live progress arc */}
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

            {/* Inner SGPA Label */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-500 dark:text-neutral-400">
                {activeScenarioName ? 'Simulated' : 'SGPA'}
              </span>
              <span className="text-xl sm:text-2xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
                {effectiveSgpa.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-neutral-400">
                Academic Standing
              </span>
              {telemetry.hasFailures ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-500/20">
                  <AlertTriangle className="w-3 h-3" />
                  {telemetry.failedCoursesCount} Backlog{telemetry.failedCoursesCount > 1 ? 's' : ''}
                </span>
              ) : telemetry.totalCredits > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> All Passing
                </span>
              ) : null}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-neutral-100">
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
              </span>
            </div>

            {/* Clean Metadata Strip */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-neutral-400 tabular-nums">
              <span>{telemetry.totalCredits} Credits</span>
              <span className="text-slate-300 dark:text-neutral-600">·</span>
              <span>{telemetry.earnedGradePoints} Points</span>
              <span className="text-slate-300 dark:text-neutral-600">·</span>
              <span>{telemetry.passingCredits}/{telemetry.totalCredits} Cr Passed</span>
              {unlockedCount > 0 && (
                <>
                  <span className="text-slate-300 dark:text-neutral-600">·</span>
                  <span className="text-slate-700 dark:text-neutral-300">{unlockedCount} Unlocked</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center / Right: Target Telemetry & Ghost Projection Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-white/[0.08] pt-3 lg:pt-0 lg:pl-6">
          {/* Target SGPA interactive widget */}
          <div className="relative" ref={popoverRef}>
            <button
              onClick={() => setShowTargetPopover(!showTargetPopover)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-100/70 hover:bg-slate-200/70 border border-slate-200 dark:bg-white/[0.03] dark:hover:bg-white/[0.07] dark:border-white/[0.08] transition-all text-left cursor-pointer"
              title="Click to adjust Target SGPA"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-cyan-500/10 border border-indigo-200 dark:border-cyan-500/20 flex items-center justify-center text-indigo-600 dark:text-cyan-400 shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-neutral-400">
                  Target SGPA
                </div>
                <div className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{targetSgpa.toFixed(2)}</span>
                  <span
                    className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md ${
                      isAhead
                        ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10'
                        : 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10'
                    }`}
                  >
                    {isAhead ? `+${diff.toFixed(2)} lead` : `${diff.toFixed(2)} gap`}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 dark:text-neutral-500 ml-1" />
            </button>

            {/* Quick-Scrub Popover */}
            {showTargetPopover && (
              <div className="absolute top-full mt-2 left-0 z-50 w-64 p-3.5 bg-white dark:bg-[#161922] border border-slate-200 dark:border-white/[0.14] rounded-2xl shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-neutral-400">
                    Set Target SGPA
                  </span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-cyan-400 tabular-nums">
                    {targetSgpa.toFixed(2)}
                  </span>
                </div>

                {/* Preset buttons */}
                <div className="grid grid-cols-5 gap-1 mb-3">
                  {presetTargets.map((pt) => (
                    <button
                      key={pt}
                      onClick={() => onTargetChange(pt)}
                      className={`py-1 text-xs rounded-lg transition-all cursor-pointer ${
                        targetSgpa === pt
                          ? 'bg-indigo-600 text-white dark:bg-cyan-500 dark:text-black font-bold shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/[0.04] dark:text-neutral-300 dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      {pt.toFixed(1)}
                    </button>
                  ))}
                </div>

                {/* Fine slider scrub */}
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="5.0"
                    max="10.0"
                    step="0.05"
                    value={targetSgpa}
                    onChange={(e) => onTargetChange(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 dark:accent-cyan-400 bg-slate-200 dark:bg-white/[0.08] h-1.5 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Ghost Projection Toggle */}
          <button
            onClick={onToggleGhostMode}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              isGhostModeActive
                ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-cyan-500/15 dark:border-cyan-500/50 dark:text-cyan-300'
                : 'bg-slate-100/70 hover:bg-slate-200/70 border border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:border-white/[0.08] dark:text-neutral-400 dark:hover:text-white'
            }`}
            title="Toggle Ghost Projection Mode (Target Plan Overlay)"
          >
            <Sparkles
              className={`w-4 h-4 ${
                isGhostModeActive ? 'text-indigo-600 dark:text-cyan-400 animate-pulse' : 'text-slate-400 dark:text-neutral-500'
              }`}
            />
            <span>Target Planner</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                isGhostModeActive
                  ? 'bg-indigo-600 text-white dark:bg-cyan-500/30 dark:text-cyan-200'
                  : 'bg-slate-200 text-slate-500 dark:bg-white/[0.06] dark:text-neutral-500'
              }`}
            >
              {isGhostModeActive ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Quick Apply Button if Ghost Mode is active and viable */}
          {isGhostModeActive && canApplyPlan && onApplyPlan && (
            <button
              onClick={onApplyPlan}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-black font-bold text-xs transition-all shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
              title="Apply optimized marks to active curriculum (Ctrl+K)"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Apply Plan</span>
              <kbd className="hidden sm:inline-block ml-1 text-[10px] bg-white/20 dark:bg-black/20 px-1 rounded">
                Ctrl+K
              </kbd>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


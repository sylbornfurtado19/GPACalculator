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
    <div className="relative w-full rounded-2xl bg-[#11131A] border border-white/[0.08] shadow-2xl p-4 md:p-5 overflow-hidden transition-all">
      {/* Subtle background ambient mesh */}
      <div className="absolute top-0 right-1/4 w-96 h-40 bg-cyan-500/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-1/3 w-80 h-32 bg-indigo-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: The Radial Arc Telemetry Gauge & Master SGPA */}
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center shrink-0 w-24 h-24">
            <svg className="w-24 h-24 -rotate-210" viewBox="0 0 100 100">
              {/* Background track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.07)"
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
                stroke="rgba(255, 255, 255, 0.2)"
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
                    ? '#f43f5e'
                    : isAhead
                    ? '#10b981'
                    : '#06b6d4'
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
              <span className="text-[10px] tracking-wider uppercase text-neutral-400 font-mono">
                {activeScenarioName ? 'Simulated' : 'SGPA'}
              </span>
              <span className="text-2xl font-bold font-mono tabular-nums tracking-tight text-white">
                {effectiveSgpa.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-neutral-400 font-mono">
                Academic Performance
              </span>
              {telemetry.hasFailures ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                  <AlertTriangle className="w-3 h-3" />
                  {telemetry.failedCoursesCount} Backlog{telemetry.failedCoursesCount > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> All Passing
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-xl md:text-2xl font-semibold tracking-tight text-neutral-100">
                {telemetry.hasFailures
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

            {/* Clean Unboxed Metadata Strip */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 font-mono tabular-nums">
              <span>{telemetry.totalCredits} Total Credits</span>
              <span className="text-neutral-600">Â·</span>
              <span>{telemetry.earnedGradePoints} Grade Pts</span>
              <span className="text-neutral-600">Â·</span>
              <span>{telemetry.passingCredits}/{telemetry.totalCredits} Cr Passed</span>
              {unlockedCount > 0 && (
                <>
                  <span className="text-neutral-600">Â·</span>
                  <span className="text-neutral-300">{unlockedCount} Unlocked</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center / Right: Target Telemetry & Ghost Projection Controls */}
        <div className="flex flex-wrap items-center gap-3 lg:gap-4 border-t lg:border-t-0 lg:border-l border-white/[0.08] pt-4 lg:pt-0 lg:pl-6">
          {/* Target SGPA interactive widget */}
          <div className="relative" ref={popoverRef}>
            <button
              onClick={() => setShowTargetPopover(!showTargetPopover)}
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.16] transition-all text-left"
              title="Click to adjust Target SGPA"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                  Target SGPA
                </div>
                <div className="text-sm font-semibold font-mono tabular-nums text-white flex items-center gap-1.5">
                  <span>{targetSgpa.toFixed(2)}</span>
                  <span
                    className={`text-[11px] font-mono font-medium px-1.5 py-0.2 rounded ${
                      isAhead
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-amber-400 bg-amber-500/10'
                    }`}
                  >
                    {isAhead ? `+${diff.toFixed(2)} ahead` : `${diff.toFixed(2)} gap`}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500 ml-1" />
            </button>

            {/* Quick-Scrub Popover */}
            {showTargetPopover && (
              <div className="absolute top-full mt-2 left-0 z-50 w-64 p-3.5 bg-[#161922] border border-white/[0.14] rounded-xl shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                    Set Target SGPA
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {targetSgpa.toFixed(2)}
                  </span>
                </div>

                {/* Preset buttons */}
                <div className="grid grid-cols-5 gap-1 mb-3">
                  {presetTargets.map((pt) => (
                    <button
                      key={pt}
                      onClick={() => onTargetChange(pt)}
                      className={`py-1 text-xs font-mono rounded transition-all ${
                        targetSgpa === pt
                          ? 'bg-cyan-500 text-black font-bold shadow-sm'
                          : 'bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08]'
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
                    className="w-full accent-cyan-400 bg-white/[0.08] h-1.5 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Ghost Projection Toggle */}
          <button
            onClick={onToggleGhostMode}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
              isGhostModeActive
                ? 'bg-cyan-500/15 border border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]'
                : 'bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-neutral-400 hover:text-white'
            }`}
            title="Toggle Ghost Projection Mode (Target Plan Overlay)"
          >
            <Sparkles
              className={`w-4 h-4 ${
                isGhostModeActive ? 'text-cyan-400 animate-pulse' : 'text-neutral-500'
              }`}
            />
            <span>Ghost Projection</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded uppercase ${
                isGhostModeActive
                  ? 'bg-cyan-500/30 text-cyan-200'
                  : 'bg-white/[0.06] text-neutral-500'
              }`}
            >
              {isGhostModeActive ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Quick Apply Button if Ghost Mode is active and viable */}
          {isGhostModeActive && canApplyPlan && onApplyPlan && (
            <button
              onClick={onApplyPlan}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
              title="Apply optimized marks to active curriculum (Cmd+K)"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Apply Plan</span>
              <kbd className="hidden sm:inline-block ml-1 text-[10px] bg-black/20 text-black px-1 rounded">
                âŒ˜K
              </kbd>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


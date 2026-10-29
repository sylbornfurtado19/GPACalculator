"use client";
import React, { useState, useEffect, useRef } from 'react';
import { SemesterTelemetry } from '../../lib/gpa-engine';
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Sliders,
  Minus,
  Plus,
  Trophy,
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
  const previousSgpaRef = useRef(telemetry.sgpa);
  const celebratedRef = useRef(false);

  const currentSgpa = telemetry.sgpa;
  const effectiveSgpa =
    simulatedSgpa !== null && simulatedSgpa !== undefined
      ? simulatedSgpa
      : currentSgpa;
  const diff = Math.round((effectiveSgpa - targetSgpa) * 100) / 100;
  const isAhead = diff >= 0;

  // Particle celebration when hitting 9+ SGPA
  useEffect(() => {
    if (
      effectiveSgpa >= 9.0 &&
      (!celebratedRef.current || previousSgpaRef.current < 9.0)
    ) {
      celebratedRef.current = true;
      if (
        typeof window !== 'undefined' &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        import('canvas-confetti').then((confettiModule) => {
          const confetti = confettiModule.default;
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#10b981', '#06b6d4', '#6366f1', '#f59e0b'],
            disableForReducedMotion: true,
          });
        });
      }
    }
    previousSgpaRef.current = effectiveSgpa;
  }, [effectiveSgpa]);

  // Clean Symmetrical Arc Gauge Math
  const radius = 38;
  const strokeWidth = 6;
  const arcTotalAngle = 240;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (arcTotalAngle / 360) * circumference;
  const progressRatio = Math.min(1, Math.max(0, effectiveSgpa / 10));
  const strokeDashoffset = arcLength - progressRatio * arcLength;

  const presetTargets = [7.5, 8.0, 8.5, 9.0, 9.5];

  // Dynamic stroke color based on tier
  const strokeColor = telemetry.hasFailures
    ? '#f43f5e'
    : effectiveSgpa >= 9.0
    ? '#10b981'
    : effectiveSgpa >= 8.0
    ? '#06b6d4'
    : effectiveSgpa >= 7.0
    ? '#6366f1'
    : effectiveSgpa >= 5.0
    ? '#f59e0b'
    : '#f43f5e';

  return (
    <div className="relative w-full rounded-2xl glass-panel shadow-sm p-4 sm:p-5 transition-all">
      {/* Ambient glow backdrop */}
      <div
        className="absolute top-0 right-1/4 w-72 h-36 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ background: strokeColor }}
        aria-hidden="true"
      />

      {/* Main Top Area: Responsive Stack on mobile, side-by-side on desktop */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
        {/* Left / Top: Master SGPA Gauge + Academic Standing */}
        <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
          {/* Symmetrical Sgpa Ring */}
          <div className="relative flex items-center justify-center shrink-0 w-20 h-20 sm:w-24 sm:h-24">
            <svg
              className="w-20 h-20 sm:w-24 sm:h-24"
              viewBox="0 0 100 100"
              style={{ transform: 'rotate(150deg)' }}
              aria-hidden="true"
            >
              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="currentColor"
                className="text-border-subtle"
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
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>

            {/* Inner SGPA Value */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[9px] tracking-wider uppercase font-bold text-muted">
                {activeScenarioName ? 'Simulated' : 'SGPA'}
              </span>
              <span
                className="font-display text-xl sm:text-2xl font-extrabold tabular-nums tracking-tight leading-tight"
                style={{ color: strokeColor }}
              >
                {effectiveSgpa.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Standing Title & Status */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted">
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
              {effectiveSgpa >= 9.0 && !telemetry.hasFailures && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/25">
                  <Trophy className="w-3 h-3" /> O-Tier Honors
                </span>
              )}
            </div>

            <div className="font-display text-base sm:text-lg font-bold tracking-tight text-primary truncate">
              {telemetry.totalCredits === 0
                ? 'No Subjects Added'
                : telemetry.hasFailures
                ? 'Re-attempt Required'
                : effectiveSgpa >= 9.0
                ? 'Outstanding Performance'
                : effectiveSgpa >= 8.0
                ? 'Distinction Candidate'
                : effectiveSgpa >= 7.0
                ? 'First Class Standing'
                : 'Second Class Standing'}
            </div>

            {/* Quick Metadata Stats */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-secondary font-medium">
              <span className="bg-surface-elevated px-2 py-0.5 rounded-md tabular-nums border border-border-subtle">
                {telemetry.totalCredits} Credits
              </span>
              <span className="bg-surface-elevated px-2 py-0.5 rounded-md tabular-nums border border-border-subtle">
                {telemetry.earnedGradePoints} Points
              </span>
              <span className="bg-surface-elevated px-2 py-0.5 rounded-md tabular-nums border border-border-subtle">
                {telemetry.passingCredits}/{telemetry.totalCredits} Passed
              </span>
              {unlockedCount > 0 && (
                <span className="bg-surface-elevated px-2 py-0.5 rounded-md tabular-nums text-primary border border-border-subtle">
                  {unlockedCount} Unlocked
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right / Bottom Action Controls */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-2 border-t lg:border-t-0 lg:border-l border-border-subtle pt-3 lg:pt-0 lg:pl-6 shrink-0">
          {/* Target SGPA Toggle Box */}
          <button
            type="button"
            onClick={() => setIsTargetExpanded(!isTargetExpanded)}
            className="w-full sm:w-auto lg:w-64 flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-surface-elevated/70 hover:bg-surface-elevated border border-border-subtle hover:border-border-hover transition-all cursor-pointer text-left shadow-xs"
            title="Click to adjust Target SGPA"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-cyan-400 shrink-0">
                <Target className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-muted">
                  Target SGPA
                </div>
                <div className="text-sm font-bold tabular-nums text-primary flex items-center gap-1.5">
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
              className={`w-4 h-4 text-muted transition-transform duration-200 ${
                isTargetExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Quick Apply Button if Ghost Mode is active and feasible */}
          {isGhostModeActive && canApplyPlan && onApplyPlan && (
            <button
              type="button"
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

      {/* INLINE EXPANDABLE TARGET SETTER */}
      {isTargetExpanded && (
        <div className="mt-4 pt-3.5 border-t border-border-subtle animate-in fade-in slide-in-from-top-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-elevated/40 border border-border-subtle p-3.5 rounded-xl">
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <span className="text-xs font-semibold text-secondary">
                Target SGPA:
              </span>
              <span className="text-sm font-bold text-indigo-500 dark:text-cyan-400 tabular-nums">
                {targetSgpa.toFixed(2)} SGPA
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {presetTargets.map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => onTargetChange(pt)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold tabular-nums transition-all cursor-pointer ${
                    targetSgpa === pt
                      ? 'bg-indigo-600 text-white dark:bg-cyan-500 dark:text-black shadow-xs'
                      : 'bg-surface text-secondary border border-border-subtle hover:bg-surface-elevated hover:text-primary'
                  }`}
                >
                  {pt.toFixed(1)}
                </button>
              ))}
            </div>

            {/* Slider with Fine Steppers */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onTargetChange(Math.max(5.0, Math.round((targetSgpa - 0.1) * 100) / 100))}
                className="w-7 h-7 rounded-lg bg-surface border border-border-subtle flex items-center justify-center text-secondary hover:text-primary cursor-pointer active:scale-95"
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
                className="w-28 sm:w-36 accent-indigo-600 dark:accent-cyan-400 bg-surface h-1.5 rounded-lg cursor-pointer"
              />

              <button
                type="button"
                onClick={() => onTargetChange(Math.min(10.0, Math.round((targetSgpa + 0.1) * 100) / 100))}
                className="w-7 h-7 rounded-lg bg-surface border border-border-subtle flex items-center justify-center text-secondary hover:text-primary cursor-pointer active:scale-95"
                title="+0.1 SGPA"
              >
                <Plus className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => setIsTargetExpanded(false)}
                className="ml-2 text-xs font-semibold text-indigo-500 dark:text-cyan-400 hover:underline cursor-pointer"
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

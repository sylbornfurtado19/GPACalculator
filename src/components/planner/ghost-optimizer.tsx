"use client";
import React from 'react';
import { TargetPlanResult, Course } from '../../lib/gpa-engine';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';

export type WhatIfScenario = 'none' | 'ica_plus_5' | 'see_plus_5' | 'see_plus_10' | 'grade_leap' | 'bare_minimum';

interface GhostOptimizerProps {
  isGhostModeActive: boolean;
  onToggleGhostMode: () => void;
  targetPlan: TargetPlanResult | null;
  targetSgpa: number;
  currentSgpa: number;
  onApplyPlan: () => void;
  courses: Course[];
  activeScenario: WhatIfScenario;
  onSelectScenario: (scenario: WhatIfScenario) => void;
}

export const GhostOptimizer: React.FC<GhostOptimizerProps> = ({
  isGhostModeActive,
  onToggleGhostMode,
  targetPlan,
  targetSgpa,
  currentSgpa,
  onApplyPlan,
  courses,
  activeScenario,
  onSelectScenario,
}) => {
  const unlockedCount = courses.filter((c) => !c.isLocked).length;

  const scenarios: { id: WhatIfScenario; label: string; desc: string }[] = [
    { id: 'none', label: 'Actual Marks', desc: 'No simulation applied' },
    { id: 'ica_plus_5', label: '+5 All ICA', desc: 'Boost continuous assessment' },
    { id: 'see_plus_5', label: '+5 All SEE', desc: 'Slight final exam push' },
    { id: 'see_plus_10', label: '+10 All SEE', desc: 'Major final exam rally' },
    { id: 'grade_leap', label: 'Next Grade Leap', desc: 'Push every subject +1 tier' },
    { id: 'bare_minimum', label: 'Safety Net', desc: 'Minimum marks to pass all' },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Horizontal Strip: What-If Scenarios & Simulation Dials */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#11131A] border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-cyan-500/10 flex items-center justify-center text-indigo-600 dark:text-cyan-400">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-neutral-200">
            What-If Dial:
          </span>
        </div>

        {/* Segmented Scenario Pills with Mobile Horizontal Swipe */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
          {scenarios.map((sc) => {
            const isActive = activeScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => onSelectScenario(sc.id)}
                title={sc.desc}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white dark:bg-cyan-500 dark:text-black font-semibold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-neutral-300 border border-slate-200/60 dark:border-white/[0.06]'
                }`}
              >
                {sc.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Optimizer Banner / Diff Card (Active when Ghost Mode is on) */}
      {isGhostModeActive && targetPlan && (
        <div className="relative rounded-2xl bg-white dark:bg-[#11131A] border border-indigo-200 dark:border-cyan-500/30 shadow-md p-4 sm:p-5 overflow-hidden transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-cyan-500/10 border border-indigo-200 dark:border-cyan-500/30 flex items-center justify-center text-indigo-600 dark:text-cyan-400 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-cyan-400">
                    DP Reverse Target Optimizer
                  </span>
                  <span className="text-xs text-slate-500 dark:text-neutral-400">
                    Target: {targetSgpa.toFixed(2)} SGPA
                  </span>
                </div>

                <div className="text-sm text-slate-800 dark:text-neutral-200 font-medium">
                  {targetPlan.feasible ? (
                    <span className="flex items-center gap-2 flex-wrap">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Feasible Plan:</span>
                      <span>
                        Requires minimum{' '}
                        <strong className="text-indigo-600 dark:text-cyan-300 font-bold tabular-nums">
                          +{targetPlan.totalAdditionalMarksNeeded} marks
                        </strong>{' '}
                        across {unlockedCount} unlocked course(s).
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{targetPlan.message}</span>
                    </span>
                  )}
                </div>

                {/* Subtext explaining diff visibility */}
                <div className="text-xs text-slate-500 dark:text-neutral-400 flex items-center gap-2 flex-wrap">
                  <span className="tabular-nums">Current: {currentSgpa.toFixed(2)}</span>
                  <ArrowRight className="w-3 h-3 text-indigo-500 dark:text-cyan-400" />
                  <span className="text-indigo-600 dark:text-cyan-300 font-bold tabular-nums">
                    Projected: {targetPlan.projectedSgpa.toFixed(2)} SGPA
                  </span>
                  <span className="text-slate-300 dark:text-neutral-600">·</span>
                  <span>Grid rows show recommended marks</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Apply Plan or Dismiss */}
            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
              <button
                onClick={onToggleGhostMode}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:text-neutral-400 dark:hover:text-neutral-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:border-white/[0.08] transition-all cursor-pointer"
              >
                Hide Projection
              </button>

              {targetPlan.feasible && (
                <button
                  onClick={onApplyPlan}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:text-black dark:bg-cyan-400 dark:hover:bg-cyan-300 transition-all shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Apply Target Plan</span>
                  <kbd className="hidden sm:inline-block ml-1 text-[10px] bg-white/20 dark:bg-black/20 px-1.5 py-0.5 rounded">
                    Ctrl+K
                  </kbd>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


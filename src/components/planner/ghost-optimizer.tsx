"use client";
import React from 'react';
import { TargetPlanResult, Course } from '../../lib/gpa-engine';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Zap,
  SlidersHorizontal,
  RotateCcw,
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
    <div className="flex flex-col gap-4">
      {/* Horizontal Strip: What-If Scenarios & Simulation Dials */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#11131A] border border-white/[0.08]">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-mono font-medium text-neutral-300">
            What-If Dial:
          </span>
        </div>

        {/* Segmented Scenario Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {scenarios.map((sc) => {
            const isActive = activeScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => onSelectScenario(sc.id)}
                title={sc.desc}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.2)] font-semibold'
                    : 'bg-white/[0.03] hover:bg-white/[0.06] text-neutral-400 hover:text-neutral-200 border border-white/[0.06]'
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
        <div className="relative rounded-2xl bg-[#11131A] border border-cyan-500/30 shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)] p-4 sm:p-5 overflow-hidden transition-all laser-projector">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
                    DP Reverse Target Optimizer
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    Target: {targetSgpa.toFixed(2)} SGPA
                  </span>
                </div>

                <div className="text-sm text-neutral-200 font-medium">
                  {targetPlan.feasible ? (
                    <span className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">Feasible Plan:</span>
                      <span>
                        Requires minimum{' '}
                        <strong className="text-cyan-300 font-mono font-bold">
                          +{targetPlan.totalAdditionalMarksNeeded} marks
                        </strong>{' '}
                        across {unlockedCount} unlocked course(s).
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-rose-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{targetPlan.message}</span>
                    </span>
                  )}
                </div>

                {/* Subtext explaining diff visibility */}
                <div className="text-xs text-neutral-400 font-mono flex items-center gap-2">
                  <span>Current: {currentSgpa.toFixed(2)}</span>
                  <ArrowRight className="w-3 h-3 text-cyan-400" />
                  <span className="text-cyan-300 font-bold">
                    Projected: {targetPlan.projectedSgpa.toFixed(2)} SGPA
                  </span>
                  <span className="text-neutral-600">Â·</span>
                  <span>Grid rows show recommended marks in laser cyan</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Apply Plan or Dismiss */}
            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
              <button
                onClick={onToggleGhostMode}
                className="px-3 py-2 rounded-xl text-xs font-mono text-neutral-400 hover:text-neutral-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
              >
                Hide Projection
              </button>

              {targetPlan.feasible && (
                <button
                  onClick={onApplyPlan}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Apply Target Plan</span>
                  <kbd className="hidden sm:inline-block ml-1 text-[10px] bg-black/20 text-black px-1.5 py-0.5 rounded font-mono">
                    âŒ˜K
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


"use client";

import React from "react";
import { Target, Zap, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface TargetFormProps {
  targetSgpa: number;
  onTargetChange: (target: number) => void;
  strategy: "balanced" | "minimum-effort";
  onStrategyChange: (strategy: "balanced" | "minimum-effort") => void;
  onCalculate: () => void;
  isCalculating?: boolean;
}

const PRESET_TARGETS = [7.5, 8.0, 8.5, 9.0, 9.5, 10.0];

export function TargetForm({
  targetSgpa,
  onTargetChange,
  strategy,
  onStrategyChange,
}: TargetFormProps) {
  return (
    <Card className="glass-panel rounded-2xl select-none">
      <CardContent className="p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-display text-base sm:text-lg font-bold text-primary flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              Mission Target SGPA &amp; Strategy
            </h3>
            <p className="text-xs text-secondary leading-relaxed">
              Drag the target slider to dynamically solve discrete whole-number marks across all courses.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
              Goal:
            </span>
            <span className="font-display font-extrabold text-2xl text-indigo-500 dark:text-cyan-400 font-mono tabular-nums">
              {targetSgpa.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Target Slider with presets */}
        <div className="space-y-3 pt-1">
          <Slider
            value={targetSgpa}
            min={5.0}
            max={10.0}
            step={0.05}
            color="indigo"
            onChange={onTargetChange}
            label="Target SGPA Slider (5.00 – 10.00)"
            indicatorText={`${targetSgpa.toFixed(2)} SGPA`}
          />

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-[10px] uppercase font-bold text-muted mr-1 shrink-0">
              Presets:
            </span>
            {PRESET_TARGETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onTargetChange(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold tabular-nums transition-all cursor-pointer ${
                  Math.abs(targetSgpa - preset) < 0.01
                    ? "bg-indigo-600 text-white dark:bg-cyan-500 dark:text-black shadow-xs"
                    : "bg-surface-elevated text-secondary hover:text-primary hover:bg-surface border border-border-subtle"
                }`}
              >
                {preset.toFixed(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Strategy selection */}
        <div className="space-y-2 pt-2 border-t border-border-subtle">
          <label className="text-[11px] font-bold uppercase tracking-wider text-secondary">
            Optimization Strategy
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onStrategyChange("balanced")}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                strategy === "balanced"
                  ? "border-cyan-500/50 bg-cyan-500/10 shadow-md shadow-cyan-500/15"
                  : "border-border-subtle bg-surface-elevated/40 hover:bg-surface-elevated text-secondary hover:text-primary"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Scale className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-400" />
                Balanced Distribution Plan
              </div>
              <div className="text-[11px] text-muted mt-0.5">
                Spreads required marks uniformly so no single course demands unreasonable scores
              </div>
            </button>

            <button
              type="button"
              onClick={() => onStrategyChange("minimum-effort")}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                strategy === "minimum-effort"
                  ? "border-cyan-500/50 bg-cyan-500/10 shadow-md shadow-cyan-500/15"
                  : "border-border-subtle bg-surface-elevated/40 hover:bg-surface-elevated text-secondary hover:text-primary"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Minimum Effort (Greedy DP)
              </div>
              <div className="text-[11px] text-muted mt-0.5">
                Concentrates mark gains into highest credit courses to minimize total studying delta
              </div>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

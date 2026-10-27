"use client";

import React from "react";
import { Target, Zap, Scale, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  onCalculate,
  isCalculating = false,
}: TargetFormProps) {
  return (
    <Card className="border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs">
      <CardContent className="p-5 space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Target className="w-4 h-4 text-[var(--primary)]" />
              Configure Target SGPA & Optimization Strategy
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Specify your target academic goal. The reverse optimizer will evaluate discrete grade boundaries and compute the required component marks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Target SGPA selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Target SGPA (0.00 – 10.00)
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="10"
                step="0.05"
                value={targetSgpa}
                onChange={(e) => onTargetChange(Number(e.target.value))}
                className="font-mono text-base font-bold w-32"
              />
              <div className="flex flex-wrap gap-1">
                {PRESET_TARGETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onTargetChange(preset)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                      Math.abs(targetSgpa - preset) < 0.01
                        ? "bg-[var(--primary)] text-white shadow-2xs"
                        : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                    }`}
                  >
                    {preset.toFixed(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Strategy selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Optimization Plan Strategy
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onStrategyChange("balanced")}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  strategy === "balanced"
                    ? "border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)] font-semibold"
                    : "border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <Scale className="w-3.5 h-3.5" />
                  Balanced Plan
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Distributes effort proportionally across subjects
                </div>
              </button>

              <button
                type="button"
                onClick={() => onStrategyChange("minimum-effort")}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  strategy === "minimum-effort"
                    ? "border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)] font-semibold"
                    : "border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <Zap className="w-3.5 h-3.5" />
                  Minimum Effort
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Minimizes total extra marks required
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <Button onClick={onCalculate} disabled={isCalculating} size="md">
            <Sparkles className="w-4 h-4 mr-1.5" />
            {isCalculating ? "Optimizing..." : "Compute Target Plan"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

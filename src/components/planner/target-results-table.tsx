"use client";

import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Lock,
  Sparkles,
  Sliders,
} from "lucide-react";
import { OptimizerResult } from "@/types/academic";
import { GradeBadge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatGpa } from "@/lib/utils";

interface TargetResultsTableProps {
  result: OptimizerResult;
  currentSgpa: number;
  onApplyPlan: () => void;
}

export function TargetResultsTable({
  result,
  currentSgpa,
  onApplyPlan,
}: TargetResultsTableProps) {
  // Feasibility status
  const isAchievable = result.achievable;

  return (
    <Card className="glass-panel rounded-2xl select-none space-y-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              Optimization Outcome &amp; Mission Checklist
            </CardTitle>
            <CardDescription>{result.message}</CardDescription>
          </div>

          {isAchievable && (
            <Button onClick={onApplyPlan} size="sm" variant="glow">
              <Sliders className="w-3.5 h-3.5 mr-1" />
              Apply Plan to Live Estimator
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Feasibility Telemetry Banner */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
            isAchievable
              ? "border-emerald-500/30 bg-emerald-500/10 text-primary"
              : "border-rose-500/30 bg-rose-500/10 text-primary"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`p-2.5 rounded-xl text-white shadow-md ${
                isAchievable ? "bg-emerald-500 shadow-emerald-500/20" : "bg-rose-500 shadow-rose-500/20"
              }`}
            >
              {isAchievable ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted">
                {isAchievable ? "Mission Status: Achievable" : "Target Exceeds Boundary Limit"}
              </div>
              <div className="font-display text-lg font-bold">
                {isAchievable ? (
                  <span>
                    Projected SGPA:{" "}
                    <span className="font-mono text-emerald-500 tabular-nums">
                      {formatGpa(result.achievedSgpa)}
                    </span>
                  </span>
                ) : (
                  <span>
                    Max Achievable SGPA:{" "}
                    <span className="font-mono text-rose-500 tabular-nums">
                      {formatGpa(result.maxPossibleSgpa)}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-muted block text-[10px] uppercase font-bold tracking-wider">
                Current
              </span>
              <span className="font-mono font-bold text-base text-primary tabular-nums">
                {formatGpa(currentSgpa)}
              </span>
            </div>

            <ArrowRight className="w-4 h-4 text-muted" />

            <div>
              <span className="text-muted block text-[10px] uppercase font-bold tracking-wider">
                Targeted
              </span>
              <span className="font-mono font-bold text-base text-indigo-500 dark:text-cyan-400 tabular-nums">
                {formatGpa(result.achievedSgpa)}
              </span>
            </div>

            <div className="pl-4 border-l border-border-subtle">
              <span className="text-muted block text-[10px] uppercase font-bold tracking-wider">
                Net Effort
              </span>
              <span className="font-mono font-bold text-base text-primary tabular-nums">
                +{result.totalAdditionalMarks} marks
              </span>
            </div>
          </div>
        </div>

        {/* Stepped Mission Timeline / Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-secondary">
              Subject Step-by-Step Requirements
            </span>
            <span className="text-muted text-[11px]">
              {result.recommendations.length} Courses evaluated
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {result.recommendations.map((rec, index) => {
              const isStandard = rec.courseType === "standard";
              const totalDiff = Math.max(0, rec.icaDiff) + Math.max(0, rec.seeDiff);
              const hasDiff = totalDiff > 0;

              return (
                <div
                  key={rec.subjectId}
                  className="p-3.5 rounded-xl border border-border-subtle bg-surface-elevated/40 hover:bg-surface-elevated/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  {/* Subject info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-surface flex items-center justify-center font-mono font-bold text-[11px] text-muted border border-border-subtle shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-primary truncate">
                        {rec.subjectName}
                      </div>
                      <div className="text-[11px] text-secondary flex items-center gap-2">
                        <span className="text-indigo-500 dark:text-cyan-400 font-bold">
                          {rec.credits} cr
                        </span>
                        <span>·</span>
                        <span className="capitalize">{isStandard ? "Standard" : "ICA-Only"}</span>
                        {rec.isIcaLocked && (
                          <span className="text-amber-500 flex items-center gap-0.5 text-[10px]">
                            <Lock className="w-3 h-3" /> Locked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Marks Stepped Transition */}
                  <div className="flex items-center gap-4 self-end sm:self-center">
                    {/* Current vs Recommended */}
                    <div className="flex items-center gap-2 font-mono text-xs tabular-nums">
                      <div className="text-right text-muted">
                        <div>ICA: {rec.currentIca}</div>
                        {isStandard && <div>SEE: {rec.currentSee}</div>}
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted" />
                      <div className="text-left font-bold text-primary">
                        <div className={rec.icaDiff > 0 ? "text-cyan-600 dark:text-cyan-400" : ""}>
                          ICA: {rec.recommendedIca}
                        </div>
                        {isStandard && (
                          <div className={rec.seeDiff > 0 ? "text-cyan-600 dark:text-cyan-400" : ""}>
                            SEE: {rec.recommendedSee}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delta Badge */}
                    <div className="w-24 text-center shrink-0">
                      {hasDiff ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold font-mono bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                          +{totalDiff} marks
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold text-muted bg-surface border border-border-subtle">
                          No change
                        </span>
                      )}
                    </div>

                    {/* Target Grade Badge */}
                    <div className="shrink-0">
                      <GradeBadge grade={rec.expectedGrade} size="sm" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

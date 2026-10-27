"use client";

import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Lock,
  LockOpen,
  Sparkles,
} from "lucide-react";
import { OptimizerResult, TargetRecommendation } from "@/types/academic";
import { GradeBadge, StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatGpa, formatPercent } from "@/lib/utils";

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
  const sgpaDiff = result.achievedSgpa - currentSgpa;

  return (
    <Card className="border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--primary)]" />
              Optimization Outcome & Recommendation
            </CardTitle>
            <CardDescription>{result.message}</CardDescription>
          </div>

          {result.achievable && (
            <Button onClick={onApplyPlan} size="sm">
              Apply Plan to Live Estimator
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Top Summary Banner */}
        <div
          className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
            result.achievable
              ? "border-[var(--success)]/30 bg-[var(--success-bg)]/40 text-[var(--text-primary)]"
              : "border-[var(--warning)]/30 bg-[var(--warning-bg)]/40 text-[var(--text-primary)]"
          }`}
        >
          <div className="flex items-center gap-3">
            {result.achievable ? (
              <div className="p-2 rounded-lg bg-[var(--success)] text-white">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-[var(--warning)] text-white">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                {result.achievable ? "Target Achievable" : "Target Math Limit Reached"}
              </div>
              <div className="text-base font-bold text-[var(--text-primary)]">
                {result.achievable ? (
                  <span>
                    Achieved SGPA: <span className="font-mono text-[var(--primary)]">{formatGpa(result.achievedSgpa)}</span>
                  </span>
                ) : (
                  <span>
                    Highest Achievable SGPA:{" "}
                    <span className="font-mono text-[var(--warning)]">
                      {formatGpa(result.maxPossibleSgpa)}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">
                Current SGPA
              </span>
              <span className="font-mono font-bold text-sm text-[var(--text-primary)]">
                {formatGpa(currentSgpa)}
              </span>
            </div>

            <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />

            <div>
              <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">
                Projected SGPA
              </span>
              <span className="font-mono font-bold text-sm text-[var(--primary)]">
                {formatGpa(result.achievedSgpa)}
              </span>
            </div>

            <div className="pl-4 border-l border-[var(--border-color)]">
              <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">
                Net Extra Marks
              </span>
              <span className="font-mono font-bold text-sm text-[var(--text-primary)]">
                +{result.totalAdditionalMarks} marks
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="overflow-x-auto rounded-xl border border-[var(--border-color)]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
                <th className="p-3.5">Subject</th>
                <th className="p-3.5 text-center">Credits</th>
                <th className="p-3.5">Current Marks</th>
                <th className="p-3.5">Recommended Marks</th>
                <th className="p-3.5 text-center">Mark Delta</th>
                <th className="p-3.5 text-center">Expected Grade</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {result.recommendations.map((rec) => {
                const isStandard = rec.courseType === "standard";
                const totalDiff = Math.max(0, rec.icaDiff) + Math.max(0, rec.seeDiff);

                return (
                  <tr
                    key={rec.subjectId}
                    className="hover:bg-[var(--bg-surface)]/60 transition-colors"
                  >
                    <td className="p-3.5">
                      <div className="font-semibold text-[var(--text-primary)]">
                        {rec.subjectName}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] capitalize">
                        {isStandard ? "Standard course" : "ICA-only"}
                      </div>
                    </td>

                    <td className="p-3.5 text-center font-mono font-semibold text-[var(--primary)]">
                      {rec.credits}
                    </td>

                    {/* Current Marks */}
                    <td className="p-3.5">
                      <div className="space-y-0.5 font-mono">
                        <div>
                          ICA: <strong>{rec.currentIca}</strong>
                          {rec.isIcaLocked && (
                            <Lock className="w-3 h-3 inline ml-1 text-[var(--text-muted)]" />
                          )}
                        </div>
                        {isStandard && (
                          <div>
                            SEE: <strong>{rec.currentSee}</strong>
                            {rec.isSeeLocked && (
                              <Lock className="w-3 h-3 inline ml-1 text-[var(--text-muted)]" />
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Recommended Marks */}
                    <td className="p-3.5">
                      <div className="space-y-0.5 font-mono font-bold text-[var(--primary)]">
                        <div>
                          ICA: {rec.recommendedIca}
                          {rec.isIcaLocked && (
                            <span className="text-[10px] font-normal text-[var(--text-muted)] ml-1">
                              (locked)
                            </span>
                          )}
                        </div>
                        {isStandard && (
                          <div>
                            SEE: {rec.recommendedSee}
                            {rec.isSeeLocked && (
                              <span className="text-[10px] font-normal text-[var(--text-muted)] ml-1">
                                (locked)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Delta */}
                    <td className="p-3.5 text-center font-mono">
                      {totalDiff > 0 ? (
                        <span className="text-[var(--primary)] font-bold">
                          +{totalDiff} marks
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)]">No change</span>
                      )}
                    </td>

                    {/* Expected Grade */}
                    <td className="p-3.5 text-center">
                      <div className="flex flex-col items-center">
                        <GradeBadge grade={rec.expectedGrade} size="sm" />
                        <span className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">
                          {formatPercent(rec.expectedPercentage)} • {rec.expectedGradePoints} pts
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3.5 text-center">
                      <StatusBadge status={rec.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

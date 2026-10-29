"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TargetRecommendation } from "@/types/academic";
import { GradeBadge } from "@/components/ui/badge";
import { formatGpa } from "@/lib/utils";
import { ArrowRight, Check } from "lucide-react";

interface ApplyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  recommendations: TargetRecommendation[];
  currentSgpa: number;
  projectedSgpa: number;
}

export function ApplyPlanModal({
  isOpen,
  onClose,
  onConfirm,
  recommendations,
  currentSgpa,
  projectedSgpa,
}: ApplyPlanModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply Target Optimization Plan"
      description="Update all unlocked subject marks with the computed dynamic programming solution. This action can be reversed with 1-click Undo."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* SGPA Change Banner */}
        <div className="p-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-transparent flex items-center justify-around text-center">
          <div>
            <div className="text-[10px] text-muted font-bold uppercase tracking-wider">
              Current SGPA
            </div>
            <div className="text-xl font-bold font-mono text-primary tabular-nums">
              {formatGpa(currentSgpa)}
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-cyan-500" />
          <div>
            <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider">
              Projected SGPA
            </div>
            <div className="text-xl font-extrabold font-mono text-cyan-600 dark:text-cyan-400 tabular-nums">
              {formatGpa(projectedSgpa)}
            </div>
          </div>
        </div>

        {/* Change Preview List */}
        <div className="max-h-60 overflow-y-auto no-scrollbar rounded-xl border border-border-subtle bg-surface-elevated/40 divide-y divide-border-subtle">
          {recommendations.map((rec) => {
            const isStandard = rec.courseType === "standard";
            const totalDiff = Math.max(0, rec.icaDiff) + Math.max(0, rec.seeDiff);

            return (
              <div
                key={rec.subjectId}
                className="p-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="font-semibold text-primary truncate">
                    {rec.subjectName}
                  </div>
                  <div className="text-[11px] text-secondary font-mono">
                    ICA: {rec.currentIca} →{" "}
                    <strong className={rec.icaDiff > 0 ? "text-cyan-500" : ""}>
                      {rec.recommendedIca}
                    </strong>
                    {isStandard && (
                      <>
                        {" "}
                        | SEE: {rec.currentSee} →{" "}
                        <strong className={rec.seeDiff > 0 ? "text-cyan-500" : ""}>
                          {rec.recommendedSee}
                        </strong>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {totalDiff > 0 ? (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25">
                      +{totalDiff}
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted">Unchanged</span>
                  )}
                  <GradeBadge grade={rec.expectedGrade} size="sm" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="glow"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            <Check className="w-3.5 h-3.5 mr-1" /> Confirm &amp; Apply
          </Button>
        </div>
      </div>
    </Modal>
  );
}

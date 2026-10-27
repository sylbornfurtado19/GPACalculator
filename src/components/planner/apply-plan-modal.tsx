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
      title="Confirm Applying Target Plan"
      description="Review mark updates before applying them to your active estimate. You can always undo this action later."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* SGPA Change Banner */}
        <div className="p-3.5 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary-subtle)] flex items-center justify-around text-center">
          <div>
            <div className="text-[11px] text-[var(--text-muted)] font-semibold uppercase">
              Current SGPA
            </div>
            <div className="text-xl font-bold font-mono text-[var(--text-primary)]">
              {formatGpa(currentSgpa)}
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-[var(--primary)]" />
          <div>
            <div className="text-[11px] text-[var(--text-muted)] font-semibold uppercase">
              Projected SGPA
            </div>
            <div className="text-xl font-bold font-mono text-[var(--primary)]">
              {formatGpa(projectedSgpa)}
            </div>
          </div>
        </div>

        {/* Change Preview List */}
        <div className="max-h-60 overflow-y-auto rounded-lg border border-[var(--border-color)] divide-y divide-[var(--border-subtle)]">
          {recommendations.map((rec) => {
            const isStandard = rec.courseType === "standard";
            const totalDiff = Math.max(0, rec.icaDiff) + Math.max(0, rec.seeDiff);

            return (
              <div
                key={rec.subjectId}
                className="p-3 flex items-center justify-between text-xs hover:bg-[var(--bg-surface)]/50"
              >
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">
                    {rec.subjectName}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] font-mono">
                    ICA: {rec.currentIca} → <strong className="text-[var(--primary)]">{rec.recommendedIca}</strong>
                    {isStandard && (
                      <>
                        {" | "}SEE: {rec.currentSee} → <strong className="text-[var(--primary)]">{rec.recommendedSee}</strong>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <GradeBadge grade={rec.expectedGrade} size="sm" />
                  {totalDiff > 0 && (
                    <span className="font-mono text-[11px] text-[var(--primary)] font-bold">
                      +{totalDiff} marks
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            <Check className="w-4 h-4 mr-1.5" />
            Confirm & Apply Plan
          </Button>
        </div>
      </div>
    </Modal>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Target, RotateCcw, AlertCircle, Sparkles, BookOpen } from "lucide-react";
import { useAcademic } from "@/context/academic-context";
import { TargetForm } from "@/components/planner/target-form";
import { TargetResultsTable } from "@/components/planner/target-results-table";
import { ApplyPlanModal } from "@/components/planner/apply-plan-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { optimizeTargetSgpa } from "@/lib/target-optimizer";
import { OptimizerResult } from "@/types/academic";

export default function PlannerPage() {
  const {
    isHydrated,
    subjects,
    summary,
    targetSgpa,
    setTargetSgpa,
    applyOptimizerPlan,
    canUndo,
    undoLastPlan,
  } = useAcademic();

  const [strategy, setStrategy] = useState<"balanced" | "minimum-effort">("balanced");
  const [optimizerResult, setOptimizerResult] = useState<OptimizerResult | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Recalculate whenever targetSgpa, strategy, or subjects change
  useEffect(() => {
    if (subjects.length > 0) {
      const res = optimizeTargetSgpa(subjects, targetSgpa, strategy);
      setOptimizerResult(res);
    } else {
      setOptimizerResult(null);
    }
  }, [subjects, targetSgpa, strategy]);

  if (!isHydrated) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
        <p className="text-xs text-[var(--text-secondary)] font-medium">
          Loading Target Planner...
        </p>
      </div>
    );
  }

  const handleCompute = () => {
    if (subjects.length > 0) {
      const res = optimizeTargetSgpa(subjects, targetSgpa, strategy);
      setOptimizerResult(res);
    }
  };

  const handleConfirmApply = () => {
    if (!optimizerResult) return;
    applyOptimizerPlan(
      optimizerResult.recommendations,
      `Applied ${strategy} plan for Target SGPA ${targetSgpa.toFixed(2)}`
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2.5">
            <Target className="w-6 h-6 text-[var(--primary)]" />
            Target SGPA Planner
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Reverse mark calculator based on NMIMS discrete grade bands, credit weightage, and passing thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canUndo && (
            <Button variant="outline" size="sm" onClick={undoLastPlan}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Undo Last Plan
            </Button>
          )}

          <Link href="/calculator">
            <Button variant="secondary" size="sm">
              Live Calculator
            </Button>
          </Link>
        </div>
      </div>

      {/* When no subjects are enrolled */}
      {subjects.length === 0 ? (
        <Card className="border-dashed border-2 border-[var(--border-color)] p-8 text-center">
          <CardContent className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              No Subjects Available to Plan
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Add your subjects in the Dashboard or GPA Calculator first, then return to plan your target marks.
            </p>
            <div className="pt-2">
              <Link href="/">
                <Button size="sm">Go to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Target Form */}
          <TargetForm
            targetSgpa={targetSgpa}
            onTargetChange={setTargetSgpa}
            strategy={strategy}
            onStrategyChange={setStrategy}
            onCalculate={handleCompute}
          />

          {/* Results Table */}
          {optimizerResult && (
            <TargetResultsTable
              result={optimizerResult}
              currentSgpa={summary.sgpa}
              onApplyPlan={() => setIsApplyModalOpen(true)}
            />
          )}

          {/* Apply Plan Confirmation Modal */}
          {optimizerResult && (
            <ApplyPlanModal
              isOpen={isApplyModalOpen}
              onClose={() => setIsApplyModalOpen(false)}
              onConfirm={handleConfirmApply}
              recommendations={optimizerResult.recommendations}
              currentSgpa={summary.sgpa}
              projectedSgpa={optimizerResult.achievedSgpa}
            />
          )}
        </div>
      )}
    </div>
  );
}

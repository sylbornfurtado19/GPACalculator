"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { RotateCcw, BookOpen, Compass, ArrowRight } from "lucide-react";
import { useAcademic } from "@/context/academic-context";
import { TargetForm } from "@/components/planner/target-form";
import { TargetResultsTable } from "@/components/planner/target-results-table";
import { ApplyPlanModal } from "@/components/planner/apply-plan-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { optimizeTargetSgpa } from "@/lib/target-optimizer";

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
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Derive optimizer plan whenever targetSgpa, strategy, or subjects change
  const optimizerResult = useMemo(() => {
    if (subjects.length > 0) {
      return optimizeTargetSgpa(subjects, targetSgpa, strategy);
    }
    return null;
  }, [subjects, targetSgpa, strategy]);

  if (!isHydrated) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        <p className="text-xs text-secondary font-medium">
          Loading Mission Planner...
        </p>
      </div>
    );
  }

  const handleCompute = () => {
    // Dynamically derived in useMemo
  };

  const handleConfirmApply = () => {
    if (!optimizerResult) return;
    applyOptimizerPlan(
      optimizerResult.recommendations,
      `Applied ${strategy} plan for Target SGPA ${targetSgpa.toFixed(2)}`
    );
    window.dispatchEvent(
      new CustomEvent("nmims-toast", {
        detail: {
          title: "Target Plan Applied",
          message: `Updated all unlocked course marks to reach ${optimizerResult.achievedSgpa.toFixed(2)} SGPA`,
          type: "success",
        },
      })
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-primary flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Compass className="w-5 h-5" />
            </div>
            Planner &amp; Mission Optimizer
          </h1>
          <p className="text-xs text-secondary mt-1">
            Deterministic dynamic programming solver for NMIMS discrete grade thresholds and whole-number marks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canUndo && (
            <Button variant="outline" size="sm" onClick={undoLastPlan}>
              <RotateCcw className="w-3.5 h-3.5 mr-1 text-amber-500" /> Undo Last Plan
            </Button>
          )}

          <Link href="/calculator">
            <Button variant="secondary" size="sm">
              Live Calculator <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* When no subjects are enrolled */}
      {subjects.length === 0 ? (
        <Card className="border-dashed border-2 border-border-subtle p-8 sm:p-12 text-center glass-panel">
          <CardContent className="max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shadow-inner">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-lg font-bold text-primary">
                No Subjects Available to Optimize
              </h3>
              <p className="text-xs text-secondary leading-relaxed">
                Add your curriculum courses in the Live Calculator or Dashboard first, then define your target goal.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-2">
              <Link href="/calculator">
                <Button size="sm">Open GPA Calculator</Button>
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

          {/* Stepped Mission Timeline / Checklist Results */}
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

"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, RotateCcw, TrendingUp } from "lucide-react";
import { EvaluatedSubject, Subject } from "@/types/academic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateSgpa, analyzeNextGradeOpportunity } from "@/lib/gpa";
import { formatGpa, formatPercent } from "@/lib/utils";

interface WhatIfScenariosProps {
  subjects: EvaluatedSubject[];
  currentSgpa: number;
}

export function WhatIfScenarios({ subjects, currentSgpa }: WhatIfScenariosProps) {
  const [activeSimulation, setActiveSimulation] = useState<
    "none" | "ica-plus-5" | "see-plus-5" | "next-boundary"
  >("none");

  if (!subjects.length) return null;

  // Compute simulated subjects based on active scenario
  const getSimulatedSubjects = (): Subject[] => {
    switch (activeSimulation) {
      case "ica-plus-5":
        return subjects.map((sub) => ({
          ...sub,
          icaMarks: Math.min(sub.icaMax, sub.icaMarks + 5),
        }));
      case "see-plus-5":
        return subjects.map((sub) => ({
          ...sub,
          seeMarks: sub.courseType === "standard" ? Math.min(sub.seeMax, sub.seeMarks + 5) : 0,
        }));
      case "next-boundary": {
        const totalCredits = subjects.reduce((acc, s) => acc + s.credits, 0);
        return subjects.map((sub) => {
          const opp = analyzeNextGradeOpportunity(sub, totalCredits);
          if (opp.isMaxGrade || !opp.nextGrade) return sub;

          if (sub.courseType === "ica-only" && opp.marksNeededInIca !== null) {
            return {
              ...sub,
              icaMarks: Math.min(sub.icaMax, sub.icaMarks + opp.marksNeededInIca),
            };
          } else if (opp.marksNeededInSee !== null) {
            return {
              ...sub,
              seeMarks: Math.min(sub.seeMax, sub.seeMarks + opp.marksNeededInSee),
            };
          }
          return sub;
        });
      }
      default:
        return subjects;
    }
  };

  const simulatedSubjects = getSimulatedSubjects();
  const simulatedEval = calculateSgpa(simulatedSubjects);
  const simulatedSgpa = simulatedEval.summary.sgpa;
  const sgpaDiff = simulatedSgpa - currentSgpa;

  // Opportunities analysis
  const totalCredits = subjects.reduce((acc, s) => acc + s.credits, 0);
  const opportunities = subjects
    .map((s) => analyzeNextGradeOpportunity(s, totalCredits))
    .filter((opp) => !opp.isMaxGrade && opp.nextGrade)
    .sort((a, b) => b.potentialSgpaGain - a.potentialSgpaGain);

  return (
    <Card className="border-[var(--border-color)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              What-If Simulation Lab
            </CardTitle>
            <CardDescription>
              Test scenarios without modifying your saved marks. See how discrete mark improvements alter your SGPA.
            </CardDescription>
          </div>
          {activeSimulation !== "none" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveSimulation("none")}
              className="text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Simulation
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Simulation Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() =>
              setActiveSimulation(activeSimulation === "ica-plus-5" ? "none" : "ica-plus-5")
            }
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeSimulation === "ica-plus-5"
                ? "border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)] font-semibold shadow-xs"
                : "border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)]"
            }`}
          >
            <div className="text-xs font-semibold">+5 Marks across all ICA</div>
            <div className="text-[11px] text-[var(--text-secondary)] mt-1">
              Simulate scoring +5 in all continuous internals
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveSimulation(activeSimulation === "see-plus-5" ? "none" : "see-plus-5")
            }
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeSimulation === "see-plus-5"
                ? "border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)] font-semibold shadow-xs"
                : "border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)]"
            }`}
          >
            <div className="text-xs font-semibold">+5 Marks in SEE / TEE</div>
            <div className="text-[11px] text-[var(--text-secondary)] mt-1">
              Simulate scoring +5 in all term-end exams
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveSimulation(activeSimulation === "next-boundary" ? "none" : "next-boundary")
            }
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeSimulation === "next-boundary"
                ? "border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)] font-semibold shadow-xs"
                : "border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)]"
            }`}
          >
            <div className="text-xs font-semibold">Jump Every Next Boundary</div>
            <div className="text-[11px] text-[var(--text-secondary)] mt-1">
              Achieve the next letter grade in all subjects
            </div>
          </button>
        </div>

        {/* Comparison Banner if simulating */}
        {activeSimulation !== "none" && (
          <div className="p-4 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary-subtle)]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-[11px] uppercase font-semibold text-[var(--text-muted)]">
                  Current SGPA
                </span>
                <div className="text-xl font-bold font-mono text-[var(--text-primary)]">
                  {formatGpa(currentSgpa)}
                </div>
              </div>

              <ArrowRight className="w-5 h-5 text-[var(--primary)]" />

              <div>
                <span className="text-[11px] uppercase font-semibold text-[var(--text-muted)]">
                  Simulated SGPA
                </span>
                <div className="text-xl font-bold font-mono text-[var(--primary)]">
                  {formatGpa(simulatedSgpa)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-secondary)] font-medium">Impact:</span>
              <Badge variant={sgpaDiff > 0 ? "success" : "neutral"} className="text-xs font-mono font-bold">
                {sgpaDiff > 0 ? `+${formatGpa(sgpaDiff)} SGPA` : "No grade change"}
              </Badge>
            </div>
          </div>
        )}

        {/* High Leverage Subject Opportunities */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              High Leverage Opportunities (Next Grade Tier)
            </h4>
            <span className="text-[11px] text-[var(--text-muted)]">
              Ranked by SGPA sensitivity
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {opportunities.slice(0, 4).map((opp) => (
              <div
                key={opp.subjectId}
                className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-[var(--text-primary)]">
                    {opp.subjectName}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    {opp.currentGrade} ({opp.currentGradePoints} pts) →{" "}
                    <strong className="text-[var(--primary)]">{opp.nextGrade}</strong> ({opp.nextGradePoints} pts)
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    Needs:{" "}
                    {opp.marksNeededInSee !== null && `+${opp.marksNeededInSee} marks in SEE`}
                    {opp.marksNeededInSee !== null && opp.marksNeededInIca !== null && " or "}
                    {opp.marksNeededInIca !== null && `+${opp.marksNeededInIca} marks in ICA`}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <Badge variant="default" className="font-mono text-[11px]">
                    +{formatGpa(opp.potentialSgpaGain)} SGPA
                  </Badge>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    {opp.credits} Credits
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

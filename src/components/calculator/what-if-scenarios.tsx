"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, RotateCcw, TrendingUp, Zap, Award } from "lucide-react";
import { EvaluatedSubject, Subject } from "@/types/academic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateSgpa, analyzeNextGradeOpportunity } from "@/lib/gpa";
import { formatGpa } from "@/lib/utils";

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

  const maxGain = opportunities.length > 0 ? opportunities[0].potentialSgpaGain : 1;

  return (
    <Card className="glass-panel rounded-2xl select-none">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              What-If Simulation Lab
            </CardTitle>
            <CardDescription>
              Test hypothetical performance boosts without modifying your real marks.
            </CardDescription>
          </div>
          {activeSimulation !== "none" && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => setActiveSimulation("none")}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Simulation
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Simulation Toggle Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() =>
              setActiveSimulation(activeSimulation === "ica-plus-5" ? "none" : "ica-plus-5")
            }
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              activeSimulation === "ica-plus-5"
                ? "border-cyan-500/50 bg-cyan-500/10 shadow-md shadow-cyan-500/15"
                : "border-border-subtle bg-surface-elevated/40 hover:bg-surface-elevated hover:border-border-hover"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <Zap className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-400" />
              +5 Marks across all ICA
            </div>
            <div className="text-[11px] text-secondary mt-1">
              Simulate scoring +5 in all continuous internal components
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveSimulation(activeSimulation === "see-plus-5" ? "none" : "see-plus-5")
            }
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              activeSimulation === "see-plus-5"
                ? "border-cyan-500/50 bg-cyan-500/10 shadow-md shadow-cyan-500/15"
                : "border-border-subtle bg-surface-elevated/40 hover:bg-surface-elevated hover:border-border-hover"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-500" />
              +5 Marks across all SEE
            </div>
            <div className="text-[11px] text-secondary mt-1">
              Simulate scoring +5 in all final 100-mark term-end examinations
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveSimulation(activeSimulation === "next-boundary" ? "none" : "next-boundary")
            }
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              activeSimulation === "next-boundary"
                ? "border-cyan-500/50 bg-cyan-500/10 shadow-md shadow-cyan-500/15"
                : "border-border-subtle bg-surface-elevated/40 hover:bg-surface-elevated hover:border-border-hover"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <Award className="w-3.5 h-3.5 text-emerald-500" />
              Jump Every Next Boundary
            </div>
            <div className="text-[11px] text-secondary mt-1">
              Simulate upgrading every subject to its next discrete letter grade
            </div>
          </button>
        </div>

        {/* Dynamic Comparison Banner if simulating */}
        {activeSimulation !== "none" && (
          <div className="p-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-transparent flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-5 sm:gap-8">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted">
                  Current SGPA
                </span>
                <div className="text-xl sm:text-2xl font-bold font-mono text-primary tabular-nums">
                  {formatGpa(currentSgpa)}
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center text-cyan-500 shrink-0 border border-border-subtle">
                <ArrowRight className="w-4 h-4" />
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-600 dark:text-cyan-400">
                  Simulated SGPA
                </span>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-cyan-600 dark:text-cyan-400 tabular-nums">
                  {formatGpa(simulatedSgpa)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-secondary font-medium">Net Lift:</span>
              <Badge
                variant={sgpaDiff > 0 ? "success" : "neutral"}
                className="text-xs font-mono font-bold px-3 py-1"
              >
                {sgpaDiff > 0 ? `+${formatGpa(sgpaDiff)} SGPA` : "No grade change"}
              </Badge>
            </div>
          </div>
        )}

        {/* High Leverage Subject Opportunities (Ranked Bar Chart) */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-secondary">
              Ranked High-Leverage Opportunities
            </h4>
            <span className="text-[11px] text-muted">
              Higher credit courses yield maximum SGPA returns
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {opportunities.slice(0, 4).map((opp) => {
              const barPercent = maxGain > 0 ? Math.min(100, (opp.potentialSgpaGain / maxGain) * 100) : 50;
              return (
                <div
                  key={opp.subjectId}
                  className="p-3.5 rounded-xl border border-border-subtle bg-surface-elevated/50 flex flex-col justify-between gap-2.5 text-xs hover:border-border-hover transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-semibold text-primary truncate">
                        {opp.subjectName}
                      </div>
                      <div className="text-[11px] text-secondary flex items-center gap-1.5 flex-wrap">
                        <span>{opp.currentGrade}</span>
                        <ArrowRight className="w-3 h-3 text-muted" />
                        <span className="font-bold text-indigo-500 dark:text-cyan-400">
                          {opp.nextGrade}
                        </span>
                        <span className="text-muted">· {opp.credits} cr</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <Badge variant="cyan" className="font-mono text-xs font-bold">
                        +{formatGpa(opp.potentialSgpaGain)} SGPA
                      </Badge>
                    </div>
                  </div>

                  {/* Sensitivity Bar Track */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-muted font-mono">
                      <span>Requirement</span>
                      <span>
                        {opp.marksNeededInSee !== null && `+${opp.marksNeededInSee} in SEE`}
                        {opp.marksNeededInSee !== null && opp.marksNeededInIca !== null && " or "}
                        {opp.marksNeededInIca !== null && `+${opp.marksNeededInIca} in ICA`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-border-subtle overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${barPercent}%` }}
                      />
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

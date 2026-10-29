"use client";

import React from "react";
import {
  Award,
  Target,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { SgpaSummary } from "@/types/academic";
import { Card } from "@/components/ui/card";
import { formatGpa } from "@/lib/utils";

interface StatsOverviewProps {
  summary: SgpaSummary;
  targetSgpa: number;
}

export function StatsOverview({ summary, targetSgpa }: StatsOverviewProps) {
  const diff = summary.sgpa - targetSgpa;
  const isAhead = diff >= 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Target SGPA & Delta Card */}
      <Card className="p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
            Target Goal
          </span>
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Target className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="font-display text-2xl font-bold tracking-tight text-primary tabular-nums">
            {formatGpa(targetSgpa)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold">
            {isAhead ? (
              <span className="text-emerald-500 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +{formatGpa(diff)} ahead
              </span>
            ) : (
              <span className="text-amber-500 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3 rotate-180" /> {formatGpa(diff)} gap
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* 2. Total Enrolled Credits */}
      <Card className="p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
            Total Credits
          </span>
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="font-display text-2xl font-bold tracking-tight text-primary tabular-nums">
            {summary.totalCredits}
          </div>
          <div className="mt-1 text-[11px] text-secondary font-medium">
            Across {summary.totalSubjects} enrolled subjects
          </div>
        </div>
      </Card>

      {/* 3. Passing Compliance Status */}
      <Card className="p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
            Passing Status
          </span>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              summary.allPassed
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-rose-500/10 text-rose-500"
            }`}
          >
            {summary.allPassed ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
          </div>
        </div>
        <div className="mt-2">
          <div
            className={`font-display text-lg font-bold tracking-tight ${
              summary.allPassed ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {summary.allPassed ? "100% Passed" : `${summary.failedSubjects + summary.absentSubjects} Attention`}
          </div>
          <div className="mt-1 text-[11px] text-secondary font-medium">
            {summary.allPassed
              ? "All ICA & SEE minimums met"
              : "Review subjects with < 40%"}
          </div>
        </div>
      </Card>

      {/* 4. Weighted Grade Points Total */}
      <Card className="p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
            Total Points
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Award className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="font-display text-2xl font-bold tracking-tight text-primary tabular-nums">
            {summary.totalGradePoints.toFixed(0)}
          </div>
          <div className="mt-1 text-[11px] text-secondary font-medium">
            Σ(Grade Points × Credits)
          </div>
        </div>
      </Card>
    </div>
  );
}

"use client";

import React from "react";
import {
  Award,
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  BookOpen,
  Layers,
  AlertTriangle,
} from "lucide-react";
import { SgpaSummary } from "@/types/academic";
import { Card, CardContent } from "@/components/ui/card";
import { formatGpa } from "@/lib/utils";

interface StatsOverviewProps {
  summary: SgpaSummary;
  targetSgpa: number;
}

export function StatsOverview({ summary, targetSgpa }: StatsOverviewProps) {
  const diff = summary.sgpa - targetSgpa;
  const isAhead = diff >= 0;
  const targetMet = summary.totalSubjects > 0 && isAhead && summary.allPassed;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Current Estimated SGPA */}
      <Card className="col-span-2 md:col-span-1 lg:col-span-2 border-[var(--primary)]/30 bg-[var(--primary-subtle)]/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Award className="w-16 h-16 text-[var(--primary)]" />
        </div>
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[var(--primary)] text-white shadow-2xs">
              <Award className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Estimated SGPA
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-[var(--text-primary)]">
              {formatGpa(summary.sgpa)}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">/ 10.00</span>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5">
            {summary.allPassed ? (
              <span className="text-[var(--success)] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All passing requirements met
              </span>
            ) : (
              <span className="text-[var(--danger)] font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {summary.failedSubjects + summary.absentSubjects} subject(s) need attention
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Target SGPA */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            <Target className="w-4 h-4 text-amber-500" />
            <span>Target SGPA</span>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-[var(--text-primary)]">
            {formatGpa(targetSgpa)}
          </div>
          <div className="mt-1 text-[11px] text-[var(--text-muted)]">
            Configured target
          </div>
        </CardContent>
      </Card>

      {/* Target Gap */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            {isAhead ? (
              <TrendingUp className="w-4 h-4 text-[var(--success)]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-amber-500" />
            )}
            <span>Target Gap</span>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span
              className={`text-2xl font-bold font-mono ${
                isAhead ? "text-[var(--success)]" : "text-amber-500"
              }`}
            >
              {isAhead ? "+" : ""}
              {formatGpa(diff)}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-[var(--text-muted)]">
            {isAhead ? "Surpassing target" : "Shortfall from target"}
          </div>
        </CardContent>
      </Card>

      {/* Total Credits */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            <Layers className="w-4 h-4 text-[var(--primary)]" />
            <span>Total Credits</span>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-[var(--text-primary)]">
            {summary.totalCredits}
          </div>
          <div className="mt-1 text-[11px] text-[var(--text-muted)]">
            {summary.totalGradePoints.toFixed(1)} weighted GP
          </div>
        </CardContent>
      </Card>

      {/* Subjects & Pass Rate */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span>Pass Status</span>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-[var(--text-primary)]">
            {summary.passedSubjects} <span className="text-sm font-normal text-[var(--text-muted)]">/ {summary.totalSubjects}</span>
          </div>
          <div className="mt-1 text-[11px] text-[var(--text-muted)]">
            {summary.totalSubjects > 0
              ? `${Math.round((summary.passedSubjects / summary.totalSubjects) * 100)}% passing`
              : "No subjects"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

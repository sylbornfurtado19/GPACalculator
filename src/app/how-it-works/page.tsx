import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Award,
  CheckCircle2,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GradeBadge } from "@/components/ui/badge";
import { GRADE_TIERS } from "@/lib/grading";

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-primary flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          NMIMS Academic Grading &amp; Evaluation Rules
        </h1>
        <p className="text-xs text-secondary mt-1">
          Official reference on how internal assessments, term-end examinations, and weighted SGPA are computed.
        </p>
      </div>

      {/* 1. Official Grading Scale */}
      <Card className="glass-panel rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-500" />
            1. Official 10-Point Letter Grading Scale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-secondary leading-relaxed">
            Grades are evaluated using strict unrounded aggregate percentages. Passing required minimums (ICA ≥ 20/50, SEE ≥ 40/100) must be satisfied first.
          </p>

          <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface-elevated/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-elevated text-secondary font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Percentage Range</th>
                  <th className="p-3 text-center">Letter Grade</th>
                  <th className="p-3 text-center">Grade Points</th>
                  <th className="p-3">Qualitative Band</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle font-mono">
                {GRADE_TIERS.map((tier) => (
                  <tr key={tier.grade} className="hover:bg-surface-elevated/60 transition-colors">
                    <td className="p-3 font-semibold text-primary">
                      {tier.min}% to {tier.max === 100 ? "100%" : `< ${tier.max}%`}
                    </td>
                    <td className="p-3 text-center">
                      <GradeBadge grade={tier.grade} size="sm" />
                    </td>
                    <td className="p-3 text-center font-bold text-primary tabular-nums">
                      {tier.points}
                    </td>
                    <td className="p-3 font-sans text-secondary text-xs">
                      {tier.label}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 2. Course Evaluation Types */}
      <Card className="glass-panel rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500 dark:text-cyan-400" />
            2. Course Evaluation Schemes (Standard vs Only ICA)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-secondary leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border-subtle bg-surface-elevated/40 space-y-2">
              <h4 className="font-bold text-sm text-primary flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                Standard Courses (ICA + SEE)
              </h4>
              <p>
                Continuous Internal Assessment (ICA) carries <strong>50 marks</strong> (scaled to 50%), and Semester End Examination (SEE) carries <strong>100 marks</strong> (scaled to 50%).
              </p>
              <div className="p-2.5 rounded-lg bg-surface border border-border-subtle font-mono text-[11px] text-primary">
                Final % = (ICA / 50 × 50) + (SEE / 100 × 50) = ICA + (SEE / 2)
              </div>
              <p className="text-[11px] text-muted">
                Mandatory minimums: ICA ≥ 20/50 (40%) and SEE ≥ 40/100 (40%).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border-subtle bg-surface-elevated/40 space-y-2">
              <h4 className="font-bold text-sm text-primary flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500 dark:text-cyan-400" />
                ICA-Only Courses (Practical / Lab)
              </h4>
              <p>
                Evaluated purely on continuous laboratory assignments, vivas, and term-work out of <strong>50 marks</strong>.
              </p>
              <div className="p-2.5 rounded-lg bg-surface border border-border-subtle font-mono text-[11px] text-primary">
                Final % = (ICA / 50) × 100 = ICA × 2
              </div>
              <p className="text-[11px] text-muted">
                Mandatory minimum: ICA ≥ 20/50 (40%). No term-end exam.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. SGPA Calculation Formula */}
      <Card className="glass-panel rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            3. Credit-Weighted SGPA Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-secondary leading-relaxed">
          <p>
            Semester Grade Point Average (SGPA) is computed as the credit-weighted average of grade points across all registered courses:
          </p>

          <div className="p-4 rounded-xl bg-surface border border-border-subtle text-center font-mono text-sm text-primary font-bold">
            SGPA = Σ ( Grade Points × Course Credits ) / Σ ( Course Credits )
          </div>

          <p className="text-[11px] text-muted">
            If any registered subject has a failing grade (F) or absent status (AB), grade points awarded are 0 for that subject, severely pulling down aggregate SGPA.
          </p>

          <div className="pt-2 flex justify-end">
            <Link href="/calculator">
              <Button size="sm" variant="glow">
                Try Live Calculator <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Award,
  CheckCircle2,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GRADE_TIERS } from "@/lib/grading";

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-[var(--primary)]" />
          NMIMS Academic Grading & Evaluation Rules
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          A transparent reference on how internal assessments, term-end examinations, and SGPA are computed.
        </p>
      </div>

      {/* 1. Official Grading Scale */}
      <Card className="border-[var(--border-color)]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4 text-[var(--primary)]" />
            1. Official 10-Point Letter Grading Scale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Grades are evaluated using unrounded aggregate percentages. Passing required minimums must be met first.
          </p>

          <div className="overflow-x-auto rounded-xl border border-[var(--border-color)]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
                  <th className="p-3">Percentage Range</th>
                  <th className="p-3 text-center">Letter Grade</th>
                  <th className="p-3 text-center">Grade Points</th>
                  <th className="p-3">Qualitative Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {GRADE_TIERS.map((tier) => (
                  <tr key={tier.grade} className="hover:bg-[var(--bg-surface)]/50">
                    <td className="p-3 font-mono font-medium">
                      {tier.min}% to {tier.max === 100 ? "100%" : `< ${tier.max}%`}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-[var(--primary)]">
                      {tier.grade}
                    </td>
                    <td className="p-3 text-center font-mono font-semibold text-[var(--text-primary)]">
                      {tier.points}
                    </td>
                    <td className="p-3 text-[var(--text-secondary)]">{tier.label}</td>
                  </tr>
                ))}
                <tr className="hover:bg-[var(--bg-surface)]/50 bg-[var(--danger-bg)]/20">
                  <td className="p-3 font-mono font-medium">Absent (Any required component)</td>
                  <td className="p-3 text-center font-mono font-bold text-[var(--danger)]">AB</td>
                  <td className="p-3 text-center font-mono font-semibold text-[var(--danger)]">0</td>
                  <td className="p-3 text-[var(--danger)]">Absent / Incomplete</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 2. Course Evaluation Formulas & Passing Thresholds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Standard Course */}
        <Card className="border-[var(--border-color)]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />
              Standard Course (ICA + SEE/TEE)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-[var(--text-secondary)] leading-relaxed">
            <p>
              Standard courses comprise Continuous Assessment (ICA) and a Term-End Examination (SEE / TEE).
            </p>
            <div className="p-3 rounded-lg bg-[var(--bg-surface)] font-mono text-[11px] text-[var(--text-primary)] border border-[var(--border-subtle)]">
              Final Marks (out of 100) = ICA + (SEE / 2)
            </div>
            <div className="space-y-1 pt-1 text-[11px]">
              <div className="font-semibold text-[var(--text-primary)]">Mandatory Passing Criteria:</div>
              <ul className="list-disc list-inside space-y-0.5 text-[var(--text-secondary)]">
                <li>Minimum ICA marks: <strong>20 / 50 (40%)</strong></li>
                <li>Minimum SEE / TEE marks: <strong>40 / 100 (40%)</strong></li>
                <li>Minimum aggregate marks: <strong>40%</strong></li>
              </ul>
            </div>
            <div className="p-2 rounded-lg bg-[var(--warning-bg)]/40 border border-[var(--warning)]/20 text-[11px] text-[var(--warning)]">
              <strong>Crucial Rule:</strong> Scoring a high aggregate will NOT override failing either the ICA or SEE individual passing thresholds. Both must be satisfied.
            </div>
          </CardContent>
        </Card>

        {/* ICA-Only Course */}
        <Card className="border-[var(--border-color)]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ICA-Only Course (Labs & Workshops)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-[var(--text-secondary)] leading-relaxed">
            <p>
              Certain practical courses, laboratories, and workshops are evaluated strictly on internal continuous assessment.
            </p>
            <div className="p-3 rounded-lg bg-[var(--bg-surface)] font-mono text-[11px] text-[var(--text-primary)] border border-[var(--border-subtle)]">
              Final Percentage = ICA Marks × 2
            </div>
            <div className="space-y-1 pt-1 text-[11px]">
              <div className="font-semibold text-[var(--text-primary)]">Mandatory Passing Criteria:</div>
              <ul className="list-disc list-inside space-y-0.5 text-[var(--text-secondary)]">
                <li>Minimum ICA marks: <strong>20 / 50 (40%)</strong></li>
                <li>Term-End (SEE/TEE) passing criteria does NOT apply.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Credit-Weighted SGPA Formula */}
      <Card className="border-[var(--border-color)]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--primary)]" />
            3. Credit-Weighted Semester Grade Point Average (SGPA)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-[var(--text-secondary)] leading-relaxed">
          <p>
            SGPA is computed by multiplying the grade points earned in each subject by that course&apos;s credit value, summing the products across all courses, and dividing by the total registered credits.
          </p>

          <div className="p-4 rounded-xl bg-[var(--bg-surface)] text-center font-mono text-sm font-bold text-[var(--text-primary)] border border-[var(--border-subtle)]">
            SGPA = Σ (Grade Points × Credits) ÷ Σ (Credits)
          </div>

          <p className="text-[11px] text-[var(--text-muted)]">
            Note: Simple arithmetic averages do not accurately represent SGPA because higher-credit subjects exert greater mathematical weight.
          </p>
        </CardContent>
      </Card>

      {/* 4. Target Optimizer Philosophy */}
      <Card className="border-[var(--border-color)]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            4. How the Target Optimizer Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-[var(--text-secondary)] leading-relaxed">
          <p>
            Unlike naive linear target tools, our reverse calculator utilizes discrete integer optimization:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[var(--text-secondary)]">
            <li>
              <strong>Discrete Grade Bands:</strong> Increasing marks within the same band (e.g., from 72% to 78%) remains grade <strong>A (8 pts)</strong> and produces zero SGPA gain. Effort is only recommended when it successfully crosses into a higher grade tier.
            </li>
            <li>
              <strong>Respects Fixed Marks:</strong> Marks you lock (such as completed mid-terms or published internals) are strictly preserved.
            </li>
            <li>
              <strong>Credit Leverage:</strong> Prioritizes subjects with higher credit values where grade jumps yield the greatest multiplier on your final SGPA.
            </li>
          </ul>

          <div className="pt-2">
            <Link href="/planner">
              <Button size="sm">
                Try the Target Planner
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import React, { useMemo } from "react";
import {
  Lock,
  Unlock,
  Copy,
  Trash2,
  Edit2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { EvaluatedSubject } from "@/types/academic";
import { GradeBadge, StatusBadge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { formatPercent, formatGpa } from "@/lib/utils";
import { analyzeNextGradeOpportunity } from "@/lib/gpa";

interface SubjectCardProps {
  subject: EvaluatedSubject;
  totalSemesterCredits?: number;
  onUpdateMarks: (id: string, ica: number, see: number) => void;
  onToggleLock: (id: string, field: "isIcaLocked" | "isSeeLocked") => void;
  onEdit: (subject: EvaluatedSubject) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SubjectCard({
  subject,
  totalSemesterCredits = 20,
  onUpdateMarks,
  onToggleLock,
  onEdit,
  onDuplicate,
  onDelete,
}: SubjectCardProps) {
  const isStandard = subject.courseType === "standard";

  // Calculate leverage and marks needed to jump to the next grade boundary
  const nextTierOpportunity = useMemo(() => {
    return analyzeNextGradeOpportunity(subject, totalSemesterCredits);
  }, [subject, totalSemesterCredits]);

  // Compute progress toward next grade boundary
  const nextTargetPercent = nextTierOpportunity.nextGradePoints
    ? nextTierOpportunity.currentGradePoints === 0
      ? 40
      : nextTierOpportunity.currentGradePoints === 4
      ? 50
      : nextTierOpportunity.currentGradePoints === 5
      ? 55
      : nextTierOpportunity.currentGradePoints === 6
      ? 60
      : nextTierOpportunity.currentGradePoints === 7
      ? 70
      : nextTierOpportunity.currentGradePoints === 8
      ? 80
      : 90
    : 100;

  const currentPercent = subject.finalPercentage;
  const progressRatio = Math.min(100, Math.max(0, (currentPercent / nextTargetPercent) * 100));

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 hover:border-cyan-500/30 transition-all select-none">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-border-subtle">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-display font-bold text-sm sm:text-base text-primary tracking-tight truncate">
              {subject.name}
            </h4>
            {subject.code && (
              <span className="text-[11px] font-mono text-muted bg-surface-elevated px-1.5 py-0.5 rounded border border-border-subtle shrink-0">
                {subject.code}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-secondary flex-wrap">
            <span className="font-semibold text-indigo-500 dark:text-cyan-400">
              {subject.credits} Credits
            </span>
            <span>·</span>
            <span className="capitalize">{isStandard ? "Standard (ICA + SEE)" : "Only ICA Lab"}</span>
            {subject.priority === "high" && (
              <>
                <span>·</span>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">
                  High Priority
                </span>
              </>
            )}
          </div>
        </div>

        {/* Grade Pill & Status */}
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={subject.status} />
          <GradeBadge grade={subject.grade} size="md" />
          <div className="text-right">
            <div className="text-sm font-bold font-mono text-primary tabular-nums">
              {formatPercent(subject.finalPercentage)}
            </div>
            <div className="text-[10px] text-muted font-mono tabular-nums">
              {subject.gradePoints} pts
            </div>
          </div>
        </div>
      </div>

      {/* Failure Warning Box */}
      {subject.status === "fail" && subject.failureReasons.length > 0 && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2 text-xs text-rose-600 dark:text-rose-400 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            {subject.failureReasons.map((r, i) => (
              <p key={i}>{r}</p>
            ))}
          </div>
        </div>
      )}

      {/* Next Grade Boundary Progress Bar */}
      {!nextTierOpportunity.isMaxGrade && nextTierOpportunity.nextGrade && (
        <div className="p-2.5 rounded-xl bg-surface-elevated/60 border border-border-subtle space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-secondary">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>Next Grade Boundary:</span>
              <strong className="text-primary font-mono">{nextTierOpportunity.nextGrade}</strong>
            </div>
            <div className="text-muted font-mono font-medium">
              {isStandard && nextTierOpportunity.marksNeededInSee !== null ? (
                <span>+{nextTierOpportunity.marksNeededInSee} in SEE</span>
              ) : nextTierOpportunity.marksNeededInIca !== null ? (
                <span>+{nextTierOpportunity.marksNeededInIca} in ICA</span>
              ) : null}
              {nextTierOpportunity.potentialSgpaGain > 0 && (
                <span className="ml-1 text-emerald-500 font-bold">
                  (+{formatGpa(nextTierOpportunity.potentialSgpaGain)} SGPA)
                </span>
              )}
            </div>
          </div>
          {/* Progress track */}
          <div className="w-full h-1.5 rounded-full bg-border-subtle overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${progressRatio}%` }}
            />
          </div>
        </div>
      )}

      {/* Interactive Marks Controls (Dual Sliders) */}
      <div className="space-y-3 pt-1">
        {/* ICA Slider */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-secondary text-[11px] uppercase tracking-wide">
                Internal Assessment (ICA)
              </span>
              <button
                type="button"
                onClick={() => onToggleLock(subject.id, "isIcaLocked")}
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  subject.isIcaLocked
                    ? "bg-amber-500/15 text-amber-500 hover:bg-amber-500/25"
                    : "text-muted hover:text-secondary hover:bg-surface-elevated"
                }`}
                title={subject.isIcaLocked ? "Locked (Optimizer will preserve this)" : "Unlocked"}
              >
                {subject.isIcaLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span className="font-mono font-bold text-primary tabular-nums text-xs">
              {subject.icaMarks} / {subject.icaMax}
              <span className="text-[10px] text-muted ml-1">
                ({isStandard ? "wt. 50%" : "wt. 100%"})
              </span>
            </span>
          </div>
          <Slider
            value={subject.icaMarks}
            min={0}
            max={subject.icaMax}
            disabled={subject.isIcaLocked || subject.isIcaAbsent}
            color="indigo"
            onChange={(val) => onUpdateMarks(subject.id, val, subject.seeMarks)}
          />
        </div>

        {/* SEE Slider (Only for Standard Courses) */}
        {isStandard && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-secondary text-[11px] uppercase tracking-wide">
                  Term-End Exam (SEE)
                </span>
                <button
                  type="button"
                  onClick={() => onToggleLock(subject.id, "isSeeLocked")}
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    subject.isSeeLocked
                      ? "bg-amber-500/15 text-amber-500 hover:bg-amber-500/25"
                      : "text-muted hover:text-secondary hover:bg-surface-elevated"
                  }`}
                  title={subject.isSeeLocked ? "Locked (Optimizer will preserve this)" : "Unlocked"}
                >
                  {subject.isSeeLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="font-mono font-bold text-primary tabular-nums text-xs">
                {subject.seeMarks} / {subject.seeMax}
                <span className="text-[10px] text-muted ml-1">(wt. 50%)</span>
              </span>
            </div>
            <Slider
              value={subject.seeMarks}
              min={0}
              max={subject.seeMax}
              disabled={subject.isSeeLocked || subject.isSeeAbsent}
              color="cyan"
              onChange={(val) => onUpdateMarks(subject.id, subject.icaMarks, val)}
            />
          </div>
        )}
      </div>

      {/* Footer Quick Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs">
        <span className="text-[11px] text-muted font-medium">
          Min pass: ICA ≥ 20 {isStandard ? "· SEE ≥ 40" : ""}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(subject)}
            className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
            title="Edit Subject Config"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(subject.id)}
            className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
            title="Duplicate Subject"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(subject.id)}
            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Delete Subject"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

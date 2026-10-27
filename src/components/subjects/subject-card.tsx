"use client";

import React from "react";
import {
  Lock,
  Unlock,
  Copy,
  Trash2,
  Edit2,
  AlertCircle,
} from "lucide-react";
import { EvaluatedSubject } from "@/types/academic";
import { GradeBadge, StatusBadge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { formatPercent } from "@/lib/utils";

interface SubjectCardProps {
  subject: EvaluatedSubject;
  onUpdateMarks: (id: string, ica: number, see: number) => void;
  onToggleLock: (id: string, field: "isIcaLocked" | "isSeeLocked") => void;
  onEdit: (subject: EvaluatedSubject) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SubjectCard({
  subject,
  onUpdateMarks,
  onToggleLock,
  onEdit,
  onDuplicate,
  onDelete,
}: SubjectCardProps) {
  const isStandard = subject.courseType === "standard";

  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-xs transition-all hover:border-[var(--text-muted)] space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-[var(--text-primary)]">
              {subject.name}
            </h4>
            {subject.code && (
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                [{subject.code}]
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span className="font-medium text-[var(--primary)]">{subject.credits} Credits</span>
            <span>•</span>
            <span className="capitalize">{isStandard ? "Standard (ICA + SEE)" : "ICA-Only"}</span>
            {subject.priority === "high" && (
              <>
                <span>•</span>
                <span className="text-[10px] font-semibold text-amber-500 uppercase">High Priority</span>
              </>
            )}
          </div>
        </div>

        {/* Grade summary pill */}
        <div className="flex items-center gap-2">
          <StatusBadge status={subject.status} />
          <GradeBadge grade={subject.grade} size="md" />
          <div className="text-right">
            <div className="text-sm font-bold font-mono text-[var(--text-primary)]">
              {formatPercent(subject.finalPercentage)}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] font-mono">
              {subject.gradePoints} pts
            </div>
          </div>
        </div>
      </div>

      {/* Failure reason if applicable */}
      {subject.status === "fail" && subject.failureReasons.length > 0 && (
        <div className="p-2.5 rounded-lg bg-[var(--danger-bg)] border border-[var(--danger)]/20 flex items-start gap-2 text-xs text-[var(--danger)]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            {subject.failureReasons.map((r, i) => (
              <p key={i}>{r}</p>
            ))}
          </div>
        </div>
      )}

      {/* Marks Sliders & Controls */}
      <div className="space-y-3">
        {/* ICA Slider */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-[var(--text-secondary)]">ICA Marks</span>
              <button
                type="button"
                onClick={() => onToggleLock(subject.id, "isIcaLocked")}
                title={subject.isIcaLocked ? "Unlock ICA" : "Lock ICA"}
                className={`p-0.5 rounded cursor-pointer transition-colors ${
                  subject.isIcaLocked
                    ? "text-[var(--primary)] bg-[var(--primary-subtle)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {subject.isIcaLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span className="font-mono text-xs font-semibold text-[var(--text-primary)]">
              {subject.icaMarks} / {subject.icaMax}
            </span>
          </div>

          <Slider
            min={0}
            max={subject.icaMax}
            value={subject.icaMarks}
            disabled={subject.isIcaLocked || subject.isIcaAbsent}
            onChange={(val) => onUpdateMarks(subject.id, val, subject.seeMarks)}
          />
        </div>

        {/* SEE Slider (Standard only) */}
        {isStandard && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-[var(--text-secondary)]">SEE / TEE Marks</span>
                <button
                  type="button"
                  onClick={() => onToggleLock(subject.id, "isSeeLocked")}
                  title={subject.isSeeLocked ? "Unlock SEE" : "Lock SEE"}
                  className={`p-0.5 rounded cursor-pointer transition-colors ${
                    subject.isSeeLocked
                      ? "text-[var(--primary)] bg-[var(--primary-subtle)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {subject.isSeeLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="font-mono text-xs font-semibold text-[var(--text-primary)]">
                {subject.seeMarks} / {subject.seeMax} (Scaled: {(subject.seeMarks / 2).toFixed(1)}/50)
              </span>
            </div>

            <Slider
              min={0}
              max={subject.seeMax}
              value={subject.seeMarks}
              disabled={subject.isSeeLocked || subject.isSeeAbsent}
              onChange={(val) => onUpdateMarks(subject.id, subject.icaMarks, val)}
            />
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
        <span>
          Weighted GP: <strong className="text-[var(--text-primary)] font-mono">{subject.weightedGradePoints.toFixed(1)}</strong>
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDuplicate(subject.id)}
            title="Duplicate subject"
            className="p-1 rounded-md hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(subject)}
            title="Edit subject settings"
            className="p-1 rounded-md hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(subject.id)}
            title="Delete subject"
            className="p-1 rounded-md hover:bg-[var(--danger-bg)] text-[var(--danger)] transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

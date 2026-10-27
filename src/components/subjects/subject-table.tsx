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
import { formatPercent } from "@/lib/utils";

interface SubjectTableProps {
  subjects: EvaluatedSubject[];
  onUpdateMarks: (id: string, ica: number, see: number) => void;
  onToggleLock: (id: string, field: "isIcaLocked" | "isSeeLocked") => void;
  onEdit: (subject: EvaluatedSubject) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SubjectTable({
  subjects,
  onUpdateMarks,
  onToggleLock,
  onEdit,
  onDuplicate,
  onDelete,
}: SubjectTableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
            <th className="p-3.5">Subject</th>
            <th className="p-3.5 text-center">Type</th>
            <th className="p-3.5 text-center">Credits</th>
            <th className="p-3.5">ICA (Max 50)</th>
            <th className="p-3.5">SEE/TEE (Max 100)</th>
            <th className="p-3.5 text-center">Total %</th>
            <th className="p-3.5 text-center">Grade</th>
            <th className="p-3.5 text-center">Status</th>
            <th className="p-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-subtle)]">
          {subjects.map((sub) => {
            const isStandard = sub.courseType === "standard";
            return (
              <tr
                key={sub.id}
                className="hover:bg-[var(--bg-surface)]/60 transition-colors"
              >
                {/* Subject Name & Code */}
                <td className="p-3.5">
                  <div className="font-semibold text-[var(--text-primary)]">
                    {sub.name}
                  </div>
                  {sub.code && (
                    <div className="font-mono text-[11px] text-[var(--text-muted)]">
                      {sub.code}
                    </div>
                  )}
                  {sub.status === "fail" && sub.failureReasons.length > 0 && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-[var(--danger)]">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{sub.failureReasons[0]}</span>
                    </div>
                  )}
                </td>

                {/* Course Type */}
                <td className="p-3.5 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                    {isStandard ? "Standard" : "ICA-Only"}
                  </span>
                </td>

                {/* Credits */}
                <td className="p-3.5 text-center font-mono font-semibold text-[var(--primary)]">
                  {sub.credits}
                </td>

                {/* ICA Input & Lock */}
                <td className="p-3.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={sub.icaMax}
                      value={sub.icaMarks}
                      disabled={sub.isIcaLocked || sub.isIcaAbsent}
                      onChange={(e) =>
                        onUpdateMarks(sub.id, Number(e.target.value), sub.seeMarks)
                      }
                      className="w-16 px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-surface)] text-center font-mono text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => onToggleLock(sub.id, "isIcaLocked")}
                      title={sub.isIcaLocked ? "Unlock ICA" : "Lock ICA"}
                      className={`p-1 rounded cursor-pointer transition-colors ${
                        sub.isIcaLocked
                          ? "text-[var(--primary)] bg-[var(--primary-subtle)]"
                          : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {sub.isIcaLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>

                {/* SEE Input & Lock */}
                <td className="p-3.5">
                  {isStandard ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={sub.seeMax}
                        value={sub.seeMarks}
                        disabled={sub.isSeeLocked || sub.isSeeAbsent}
                        onChange={(e) =>
                          onUpdateMarks(sub.id, sub.icaMarks, Number(e.target.value))
                        }
                        className="w-16 px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-surface)] text-center font-mono text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => onToggleLock(sub.id, "isSeeLocked")}
                        title={sub.isSeeLocked ? "Unlock SEE" : "Lock SEE"}
                        className={`p-1 rounded cursor-pointer transition-colors ${
                          sub.isSeeLocked
                            ? "text-[var(--primary)] bg-[var(--primary-subtle)]"
                            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        {sub.isSeeLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-[var(--text-muted)] italic">N/A (Doubled ICA)</span>
                  )}
                </td>

                {/* Total % */}
                <td className="p-3.5 text-center font-mono font-bold text-[var(--text-primary)]">
                  {formatPercent(sub.finalPercentage)}
                </td>

                {/* Grade */}
                <td className="p-3.5 text-center">
                  <div className="flex flex-col items-center">
                    <GradeBadge grade={sub.grade} size="sm" />
                    <span className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">
                      {sub.gradePoints} pts
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="p-3.5 text-center">
                  <StatusBadge status={sub.status} />
                </td>

                {/* Actions */}
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onDuplicate(sub.id)}
                      title="Duplicate"
                      className="p-1 rounded hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(sub)}
                      title="Edit"
                      className="p-1 rounded hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(sub.id)}
                      title="Delete"
                      className="p-1 rounded hover:bg-[var(--danger-bg)] text-[var(--danger)] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

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
    <div className="w-full overflow-x-auto rounded-2xl border border-border-subtle glass-panel shadow-xs select-none">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-border-subtle bg-surface-elevated/60 text-secondary font-bold uppercase tracking-wider text-[10px]">
            <th className="p-3.5">Subject</th>
            <th className="p-3.5 text-center">Type</th>
            <th className="p-3.5 text-center">Credits</th>
            <th className="p-3.5">ICA (Max 50)</th>
            <th className="p-3.5">SEE (Max 100)</th>
            <th className="p-3.5 text-center">Total %</th>
            <th className="p-3.5 text-center">Grade</th>
            <th className="p-3.5 text-center">Status</th>
            <th className="p-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {subjects.map((sub) => {
            const isStandard = sub.courseType === "standard";
            return (
              <tr
                key={sub.id}
                className="hover:bg-surface-elevated/40 transition-colors"
              >
                {/* Subject Name & Code */}
                <td className="p-3.5 max-w-[200px]">
                  <div className="font-semibold text-primary truncate">
                    {sub.name}
                  </div>
                  {sub.code && (
                    <div className="font-mono text-[11px] text-muted">
                      {sub.code}
                    </div>
                  )}
                  {sub.status === "fail" && sub.failureReasons.length > 0 && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-rose-500 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span className="truncate">{sub.failureReasons[0]}</span>
                    </div>
                  )}
                </td>

                {/* Course Type */}
                <td className="p-3.5 text-center whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-surface-elevated text-secondary border border-border-subtle">
                    {isStandard ? "Standard" : "Only ICA"}
                  </span>
                </td>

                {/* Credits */}
                <td className="p-3.5 text-center font-mono font-bold text-indigo-500 dark:text-cyan-400 tabular-nums">
                  {sub.credits}
                </td>

                {/* ICA Input & Lock */}
                <td className="p-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={sub.icaMax}
                      value={sub.icaMarks}
                      inputMode="decimal"
                      disabled={sub.isIcaLocked || sub.isIcaAbsent}
                      onChange={(e) =>
                        onUpdateMarks(sub.id, Number(e.target.value), sub.seeMarks)
                      }
                      className="w-16 px-2 py-1 rounded-lg border border-border-subtle bg-surface text-center font-mono text-xs font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-40"
                    />
                    <button
                      type="button"
                      onClick={() => onToggleLock(sub.id, "isIcaLocked")}
                      title={sub.isIcaLocked ? "Unlock ICA" : "Lock ICA"}
                      className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                        sub.isIcaLocked
                          ? "text-amber-500 bg-amber-500/10 border border-amber-500/20"
                          : "text-muted hover:text-secondary hover:bg-surface-elevated"
                      }`}
                    >
                      {sub.isIcaLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>

                {/* SEE Input & Lock */}
                <td className="p-3.5 whitespace-nowrap">
                  {isStandard ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        max={sub.seeMax}
                        value={sub.seeMarks}
                        inputMode="decimal"
                        disabled={sub.isSeeLocked || sub.isSeeAbsent}
                        onChange={(e) =>
                          onUpdateMarks(sub.id, sub.icaMarks, Number(e.target.value))
                        }
                        className="w-16 px-2 py-1 rounded-lg border border-border-subtle bg-surface text-center font-mono text-xs font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-40"
                      />
                      <button
                        type="button"
                        onClick={() => onToggleLock(sub.id, "isSeeLocked")}
                        title={sub.isSeeLocked ? "Unlock SEE" : "Lock SEE"}
                        className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                          sub.isSeeLocked
                            ? "text-amber-500 bg-amber-500/10 border border-amber-500/20"
                            : "text-muted hover:text-secondary hover:bg-surface-elevated"
                        }`}
                      >
                        {sub.isSeeLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted italic">N/A (ICA × 2)</span>
                  )}
                </td>

                {/* Total % */}
                <td className="p-3.5 text-center font-mono font-bold text-primary tabular-nums">
                  {formatPercent(sub.finalPercentage)}
                </td>

                {/* Grade */}
                <td className="p-3.5 text-center">
                  <div className="flex flex-col items-center">
                    <GradeBadge grade={sub.grade} size="sm" />
                    <span className="text-[10px] text-muted font-mono mt-0.5 tabular-nums">
                      {sub.gradePoints} pts
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="p-3.5 text-center">
                  <StatusBadge status={sub.status} />
                </td>

                {/* Actions */}
                <td className="p-3.5 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onDuplicate(sub.id)}
                      title="Duplicate"
                      className="p-1.5 rounded-lg hover:bg-surface-elevated text-secondary hover:text-primary transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(sub)}
                      title="Edit"
                      className="p-1.5 rounded-lg hover:bg-surface-elevated text-secondary hover:text-primary transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(sub.id)}
                      title="Delete"
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
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

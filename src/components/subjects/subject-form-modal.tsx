"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CourseType, Subject, SubjectPriority } from "@/types/academic";

interface SubjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subject: Omit<Subject, "id">) => void;
  initialData?: Subject | null;
}

export function SubjectFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: SubjectFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Subject" : "Add New Subject"}
      description="Configure subject credits, course structure, and component marks."
      maxWidth="lg"
    >
      {isOpen && (
        <SubjectFormInner
          key={initialData ? initialData.id : "new"}
          initialData={initialData}
          onSubmit={onSubmit}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}

function SubjectFormInner({
  initialData,
  onSubmit,
  onClose,
}: {
  initialData?: Subject | null;
  onSubmit: (subject: Omit<Subject, "id">) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialData?.name || "");
  const [code, setCode] = useState(initialData?.code || "");
  const [credits, setCredits] = useState(initialData?.credits ?? 4);
  const [courseType, setCourseType] = useState<CourseType>(initialData?.courseType || "standard");
  const [icaMarks, setIcaMarks] = useState(initialData?.icaMarks ?? 35);
  const [icaMax, setIcaMax] = useState(initialData?.icaMax ?? 50);
  const [seeMarks, setSeeMarks] = useState(initialData?.seeMarks ?? 70);
  const [seeMax, setSeeMax] = useState(initialData?.seeMax ?? 100);
  const [isIcaAbsent, setIsIcaAbsent] = useState(Boolean(initialData?.isIcaAbsent));
  const [isSeeAbsent, setIsSeeAbsent] = useState(Boolean(initialData?.isSeeAbsent));
  const [isIcaLocked, setIsIcaLocked] = useState(Boolean(initialData?.isIcaLocked));
  const [isSeeLocked, setIsSeeLocked] = useState(Boolean(initialData?.isSeeLocked));
  const [priority, setPriority] = useState<SubjectPriority>(initialData?.priority || "medium");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Subject name is required";
    }

    if (credits <= 0) {
      newErrors.credits = "Credits must be greater than zero";
    }

    if (icaMarks < 0 || icaMarks > icaMax) {
      newErrors.icaMarks = `ICA marks must be between 0 and ${icaMax}`;
    }

    if (courseType === "standard") {
      if (seeMarks < 0 || seeMarks > seeMax) {
        newErrors.seeMarks = `SEE/TEE marks must be between 0 and ${seeMax}`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      name: name.trim(),
      code: code.trim() || undefined,
      credits: Number(credits),
      courseType,
      icaMarks: Number(icaMarks),
      icaMax: Number(icaMax),
      seeMarks: courseType === "standard" ? Number(seeMarks) : 0,
      seeMax: Number(seeMax),
      isIcaAbsent,
      isSeeAbsent: courseType === "standard" ? isSeeAbsent : false,
      isIcaLocked,
      isSeeLocked: courseType === "standard" ? isSeeLocked : false,
      priority,
    });

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              label="Subject Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Operating Systems"
              error={errors.name}
              required
            />
          </div>
          <div>
            <Input
              label="Course Code (Optional)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. CS301"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Input
              label="Credits *"
              type="number"
              min="0.5"
              step="0.5"
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
              error={errors.credits}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Course Structure
            </label>
            <select
              value={courseType}
              onChange={(e) => setCourseType(e.target.value as CourseType)}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="standard">Standard (ICA + SEE/TEE)</option>
              <option value="ica-only">ICA-Only (Labs / Workshop)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Target Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as SubjectPriority)}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="high">High (Favor during target planning)</option>
              <option value="medium">Medium (Standard)</option>
              <option value="low">Low (De-prioritize)</option>
            </select>
          </div>
        </div>

        {/* ICA Section */}
        <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
              Continuous Assessment (ICA)
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">Pass threshold: 20/50</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Marks Obtained"
              type="number"
              min="0"
              max={icaMax}
              value={icaMarks}
              onChange={(e) => setIcaMarks(Number(e.target.value))}
              disabled={isIcaAbsent}
              error={errors.icaMarks}
            />
            <Input
              label="Max Marks"
              type="number"
              value={icaMax}
              onChange={(e) => setIcaMax(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
              <input
                type="checkbox"
                checked={isIcaLocked}
                onChange={(e) => setIsIcaLocked(e.target.checked)}
                className="rounded text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <span>Lock ICA (Do not alter in target planner)</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-[var(--danger)] cursor-pointer">
              <input
                type="checkbox"
                checked={isIcaAbsent}
                onChange={(e) => setIsIcaAbsent(e.target.checked)}
                className="rounded text-[var(--danger)] focus:ring-[var(--danger)]"
              />
              <span>Mark as Absent</span>
            </label>
          </div>
        </div>

        {/* SEE Section (Only for standard courses) */}
        {courseType === "standard" && (
          <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                Term-End Exam (SEE / TEE)
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">Pass threshold: 40/100 (scaled to 50)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Marks Obtained"
                type="number"
                min="0"
                max={seeMax}
                value={seeMarks}
                onChange={(e) => setSeeMarks(Number(e.target.value))}
                disabled={isSeeAbsent}
                error={errors.seeMarks}
              />
              <Input
                label="Max Marks"
                type="number"
                value={seeMax}
                onChange={(e) => setSeeMax(Number(e.target.value))}
              />
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSeeLocked}
                  onChange={(e) => setIsSeeLocked(e.target.checked)}
                  className="rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <span>Lock SEE (Fixed exam score)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-[var(--danger)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSeeAbsent}
                  onChange={(e) => setIsSeeAbsent(e.target.checked)}
                  className="rounded text-[var(--danger)] focus:ring-[var(--danger)]"
                />
                <span>Mark as Absent</span>
              </label>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            {initialData ? "Save Changes" : "Add Subject"}
          </Button>
        </div>
      </form>
    );
}

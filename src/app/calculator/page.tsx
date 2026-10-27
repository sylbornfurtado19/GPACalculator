"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calculator,
  PlusCircle,
  LayoutGrid,
  List,
  Target,
  Sparkles,
} from "lucide-react";
import { useAcademic } from "@/context/academic-context";
import { SubjectTable } from "@/components/subjects/subject-table";
import { SubjectCard } from "@/components/subjects/subject-card";
import { SubjectFormModal } from "@/components/subjects/subject-form-modal";
import { WhatIfScenarios } from "@/components/calculator/what-if-scenarios";
import { EmptyDashboard } from "@/components/dashboard/empty-dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EvaluatedSubject, Subject } from "@/types/academic";
import { formatGpa } from "@/lib/utils";

export default function CalculatorPage() {
  const {
    isHydrated,
    subjects,
    evaluatedSubjects,
    summary,
    targetSgpa,
    addSubject,
    updateSubject,
    duplicateSubject,
    deleteSubject,
    loadPreset,
  } = useAcademic();

  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  if (!isHydrated) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
        <p className="text-xs text-[var(--text-secondary)] font-medium">
          Loading GPA Calculator...
        </p>
      </div>
    );
  }

  const handleUpdateMarks = (id: string, ica: number, see: number) => {
    updateSubject(id, {
      icaMarks: Math.max(0, ica),
      seeMarks: Math.max(0, see),
    });
  };

  const handleToggleLock = (id: string, field: "isIcaLocked" | "isSeeLocked") => {
    const sub = subjects.find((s) => s.id === id);
    if (!sub) return;
    updateSubject(id, { [field]: !sub[field] });
  };

  const handleEdit = (sub: EvaluatedSubject) => {
    setEditingSubject(sub);
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2.5">
            <Calculator className="w-6 h-6 text-[var(--primary)]" />
            Interactive GPA Estimator
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Real-time evaluation with instant feedback when crossing discrete NMIMS grade boundaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center p-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)]">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === "cards"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
              title="Card view with sliders"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Button onClick={handleOpenAddModal} size="sm">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Add Subject
          </Button>

          <Link href="/planner">
            <Button variant="secondary" size="sm">
              <Target className="w-4 h-4 mr-1.5 text-[var(--primary)]" />
              Target Planner
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <Card className="border-[var(--border-color)] bg-[var(--bg-card)]">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[var(--text-muted)] text-[11px] block font-semibold uppercase">
                Current SGPA
              </span>
              <span className="text-xl font-bold font-mono text-[var(--primary)]">
                {formatGpa(summary.sgpa)}
              </span>
            </div>
            <div className="border-l border-[var(--border-subtle)] pl-4">
              <span className="text-[var(--text-muted)] text-[11px] block font-semibold uppercase">
                Target SGPA
              </span>
              <span className="text-xl font-bold font-mono text-[var(--text-primary)]">
                {formatGpa(targetSgpa)}
              </span>
            </div>
            <div className="border-l border-[var(--border-subtle)] pl-4">
              <span className="text-[var(--text-muted)] text-[11px] block font-semibold uppercase">
                Registered Credits
              </span>
              <span className="text-xl font-bold font-mono text-[var(--text-primary)]">
                {summary.totalCredits}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[var(--text-secondary)]">Status:</span>
            <span
              className={`font-semibold ${
                summary.allPassed ? "text-[var(--success)]" : "text-[var(--danger)]"
              }`}
            >
              {summary.allPassed
                ? "All courses passing"
                : `${summary.failedSubjects + summary.absentSubjects} courses need attention`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Main Table or Card List */}
      {subjects.length === 0 ? (
        <EmptyDashboard
          onAddSubject={handleOpenAddModal}
          onLoadPreset={(id) => loadPreset(id)}
        />
      ) : (
        <div className="space-y-6">
          {viewMode === "table" ? (
            <SubjectTable
              subjects={evaluatedSubjects}
              onUpdateMarks={handleUpdateMarks}
              onToggleLock={handleToggleLock}
              onEdit={handleEdit}
              onDuplicate={duplicateSubject}
              onDelete={deleteSubject}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {evaluatedSubjects.map((sub) => (
                <SubjectCard
                  key={sub.id}
                  subject={sub}
                  onUpdateMarks={handleUpdateMarks}
                  onToggleLock={handleToggleLock}
                  onEdit={handleEdit}
                  onDuplicate={duplicateSubject}
                  onDelete={deleteSubject}
                />
              ))}
            </div>
          )}

          {/* What-If Simulation Section */}
          <WhatIfScenarios subjects={evaluatedSubjects} currentSgpa={summary.sgpa} />
        </div>
      )}

      {/* Subject Modal */}
      <SubjectFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSubject(null);
        }}
        onSubmit={(subData) => {
          if (editingSubject) {
            updateSubject(editingSubject.id, subData);
          } else {
            addSubject(subData);
          }
        }}
        initialData={editingSubject}
      />
    </div>
  );
}

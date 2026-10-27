"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Calculator,
  Target,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { useAcademic } from "@/context/academic-context";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { EmptyDashboard } from "@/components/dashboard/empty-dashboard";
import { SubjectCard } from "@/components/subjects/subject-card";
import { SubjectFormModal } from "@/components/subjects/subject-form-modal";
import { WhatIfScenarios } from "@/components/calculator/what-if-scenarios";
import { Button } from "@/components/ui/button";
import { EvaluatedSubject, Subject } from "@/types/academic";

export default function DashboardPage() {
  const {
    isHydrated,
    subjects,
    evaluatedSubjects,
    summary,
    targetSgpa,
    semesterLabel,
    addSubject,
    updateSubject,
    duplicateSubject,
    deleteSubject,
    loadPreset,
    canUndo,
    undoLastPlan,
  } = useAcademic();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  if (!isHydrated) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
        <p className="text-xs text-[var(--text-secondary)] font-medium">
          Loading academic workspace...
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

  const hasSubjects = subjects.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Academic Dashboard
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
              {semesterLabel}
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Real-time NMIMS credit-weighted SGPA estimation and discrete grade-boundary optimizer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canUndo && (
            <Button variant="outline" size="sm" onClick={undoLastPlan}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Undo Plan
            </Button>
          )}

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

      {/* KPI Stats Overview */}
      <StatsOverview summary={summary} targetSgpa={targetSgpa} />

      {/* Main Content Area */}
      {!hasSubjects ? (
        <EmptyDashboard
          onAddSubject={handleOpenAddModal}
          onLoadPreset={(id) => loadPreset(id)}
        />
      ) : (
        <div className="space-y-8">
          {/* Active Subjects Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Enrolled Subjects & Marks
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Drag sliders or enter scores to immediately recalculate credit-weighted SGPA.
                </p>
              </div>

              <Link
                href="/calculator"
                className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                <span>Full Calculator View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

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
          </div>

          {/* Quick What-If Simulation */}
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

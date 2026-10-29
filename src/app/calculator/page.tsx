"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calculator,
  PlusCircle,
  LayoutGrid,
  List,
  Target,
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

  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  if (!isHydrated) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        <p className="text-xs text-secondary font-medium">
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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-primary flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            Interactive GPA Estimator
          </h1>
          <p className="text-xs text-secondary mt-1">
            Real-time NMIMS marks tuning with live boundary feedback, locked states, and What-If analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center p-1 rounded-xl border border-border-subtle glass-panel shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "cards"
                  ? "bg-indigo-600 dark:bg-cyan-500 text-white dark:text-black shadow-xs font-bold"
                  : "text-secondary hover:text-primary"
              }`}
              title="Card view with interactive sliders"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-indigo-600 dark:bg-cyan-500 text-white dark:text-black shadow-xs font-bold"
                  : "text-secondary hover:text-primary"
              }`}
              title="Dense spreadsheet table view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button onClick={handleOpenAddModal} size="sm">
            <PlusCircle className="w-4 h-4 mr-1" />
            Add Subject
          </Button>

          <Link href="/planner">
            <Button variant="secondary" size="sm">
              <Target className="w-4 h-4 mr-1 text-indigo-500 dark:text-cyan-400" />
              Target Planner
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <Card className="glass-panel">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-muted text-[10px] block font-bold uppercase tracking-wider">
                Current SGPA
              </span>
              <span
                className={`font-display text-2xl font-extrabold font-mono tabular-nums ${
                  summary.sgpa >= 9
                    ? "text-emerald-500"
                    : summary.sgpa >= 8
                    ? "text-cyan-500"
                    : summary.sgpa >= 7
                    ? "text-indigo-500"
                    : summary.sgpa >= 5
                    ? "text-amber-500"
                    : "text-rose-500"
                }`}
              >
                {formatGpa(summary.sgpa)}
              </span>
            </div>
            <div className="border-l border-border-subtle pl-4">
              <span className="text-muted text-[10px] block font-bold uppercase tracking-wider">
                Target SGPA
              </span>
              <span className="font-display text-2xl font-extrabold font-mono text-primary tabular-nums">
                {formatGpa(targetSgpa)}
              </span>
            </div>
            <div className="border-l border-border-subtle pl-4">
              <span className="text-muted text-[10px] block font-bold uppercase tracking-wider">
                Credits Enrolled
              </span>
              <span className="font-display text-2xl font-extrabold font-mono text-primary tabular-nums">
                {summary.totalCredits}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-secondary text-xs">Compliance:</span>
            <span
              className={`font-semibold px-2.5 py-0.5 rounded-full text-xs border ${
                summary.allPassed
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
              }`}
            >
              {summary.allPassed
                ? "100% Minimum Criteria Met"
                : `${summary.failedSubjects + summary.absentSubjects} Attention Required`}
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
                  totalSemesterCredits={summary.totalCredits}
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

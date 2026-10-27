"use client";

import React from "react";
import { PlusCircle, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CURRICULUM_PRESETS } from "@/lib/presets";

interface EmptyDashboardProps {
  onAddSubject: () => void;
  onLoadPreset: (presetId: string) => void;
}

export function EmptyDashboard({ onAddSubject, onLoadPreset }: EmptyDashboardProps) {
  return (
    <Card className="border-dashed border-2 border-[var(--border-color)] bg-[var(--bg-card)]/50 p-8 text-center">
      <CardContent className="max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center">
          <BookOpen className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            No Subjects Added Yet
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Start by adding your enrolled courses, credit values, and estimated or known ICA / SEE marks to calculate your SGPA and plan your target grade.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={onAddSubject} size="md">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Add First Subject
          </Button>
        </div>

        {/* Preset quick links */}
        <div className="pt-6 border-t border-[var(--border-subtle)] space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Or load a sample NMIMS curriculum</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
            {CURRICULUM_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onLoadPreset(preset.id)}
                className="p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--primary)]/50 transition-all text-left cursor-pointer group"
              >
                <div className="font-semibold text-xs text-[var(--text-primary)] group-hover:text-[var(--primary)]">
                  {preset.name}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  {preset.subjects.length} subjects • Target SGPA {preset.targetSgpa.toFixed(1)}
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

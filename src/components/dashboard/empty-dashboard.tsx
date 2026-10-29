"use client";

import React from "react";
import { PlusCircle, Sparkles, BookOpen, ArrowRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CURRICULUM_PRESETS } from "@/lib/presets";

interface EmptyDashboardProps {
  onAddSubject: () => void;
  onLoadPreset: (presetId: string) => void;
}

export function EmptyDashboard({ onAddSubject, onLoadPreset }: EmptyDashboardProps) {
  const handleLoadCsPreset = () => {
    onLoadPreset("btech-cs-sem3");
    window.dispatchEvent(
      new CustomEvent("nmims-toast", {
        detail: {
          title: "B.Tech CS Preset Loaded",
          message: "Loaded official Sem 3 syllabus with DSA, COA, and Discrete Math",
          type: "success",
        },
      })
    );
  };

  return (
    <Card className="border-dashed border-2 border-border-subtle glass-panel p-8 sm:p-12 text-center rounded-3xl select-none relative overflow-hidden">
      {/* Background ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <CardContent className="max-w-md mx-auto space-y-5 relative z-10">
        {/* Animated Brand Emblem */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 animate-in zoom-in duration-300">
          <GraduationCap className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-primary">
            No Subjects Added Yet
          </h3>
          <p className="text-xs text-secondary leading-relaxed">
            Begin by loading an official NMIMS syllabus preset or adding your enrolled courses to start calculating real-time SGPA and computing target plans.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={handleLoadCsPreset} size="md" variant="glow">
            <Sparkles className="w-4 h-4 mr-1.5 text-yellow-300" />
            Load B.Tech CS Preset
          </Button>

          <Button onClick={onAddSubject} variant="secondary" size="md">
            <PlusCircle className="w-4 h-4 mr-1.5 text-indigo-500 dark:text-cyan-400" />
            Add Custom Subject
          </Button>
        </div>

        {/* Sample NMIMS Presets Grid */}
        <div className="pt-6 border-t border-border-subtle space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-muted uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-400" />
            <span>Or select an engineering stream preset</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
            {CURRICULUM_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onLoadPreset(preset.id);
                  window.dispatchEvent(
                    new CustomEvent("nmims-toast", {
                      detail: {
                        title: "Preset Loaded",
                        message: `Loaded ${preset.name}`,
                        type: "success",
                      },
                    })
                  );
                }}
                className="p-3 rounded-xl border border-border-subtle bg-surface-elevated/40 hover:bg-surface-elevated hover:border-cyan-500/40 transition-all text-left cursor-pointer group shadow-xs"
              >
                <div className="font-semibold text-xs text-primary group-hover:text-indigo-500 dark:group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                  <span className="truncate">{preset.name}</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                </div>
                <div className="text-[11px] text-muted mt-0.5">
                  {preset.subjects.length} subjects · Target {preset.targetSgpa.toFixed(1)} SGPA
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

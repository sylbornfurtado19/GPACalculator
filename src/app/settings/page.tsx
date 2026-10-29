"use client";

import React, { useState, useRef } from "react";
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Check,
  AlertCircle,
  FileJson,
  ArrowRight,
} from "lucide-react";
import { useAcademic } from "@/context/academic-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { generateExportJson } from "@/lib/storage";
import { validateExportJson } from "@/lib/validation";
import { CURRICULUM_PRESETS } from "@/lib/presets";

export default function SettingsPage() {
  const {
    isHydrated,
    semesterLabel,
    setSemesterLabel,
    targetSgpa,
    setTargetSgpa,
    subjects,
    loadPreset,
    resetAll,
    importState,
    getCurrentState,
  } = useAcademic();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isHydrated) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        <p className="text-xs text-secondary font-medium">
          Loading workspace settings...
        </p>
      </div>
    );
  }

  // Handle Export
  const handleExport = () => {
    const currentState = getCurrentState();
    const jsonString = generateExportJson(currentState);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nmims_gpa_${semesterLabel.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    window.dispatchEvent(
      new CustomEvent("nmims-toast", {
        detail: {
          title: "Backup Exported",
          message: "Saved your personal academic configuration file",
          type: "success",
        },
      })
    );
  };

  // Handle Import File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const validation = validateExportJson(content);

      if (!validation.success || !validation.data) {
        setImportMessage({
          type: "error",
          text: `Import failed: ${validation.error || "Invalid file format"}`,
        });
        return;
      }

      importState({
        version: validation.data.version,
        semesterLabel: validation.data.semesterLabel,
        targetSgpa: validation.data.targetSgpa,
        subjects: validation.data.subjects,
      });

      setImportMessage({
        type: "success",
        text: `Successfully imported ${validation.data.subjects.length} subjects for ${validation.data.semesterLabel}!`,
      });

      window.dispatchEvent(
        new CustomEvent("nmims-toast", {
          detail: {
            title: "Backup Restored",
            message: `Loaded ${validation.data.subjects.length} courses from backup`,
            type: "success",
          },
        })
      );
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-primary flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Settings className="w-5 h-5" />
          </div>
          Settings &amp; Data Management
        </h1>
        <p className="text-xs text-secondary mt-1">
          Manage local browser cache, term labels, and JSON state import/export.
        </p>
      </div>

      {/* General Configuration */}
      <Card className="glass-panel rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Semester Configuration</CardTitle>
          <CardDescription>
            Customize your active academic term title and default baseline target SGPA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Semester / Term Title"
              value={semesterLabel}
              onChange={(e) => setSemesterLabel(e.target.value)}
              placeholder="e.g. Semester 3 (B.Tech CS)"
            />
            <Input
              label="Default Target SGPA"
              type="number"
              min="0"
              max="10"
              step="0.05"
              value={targetSgpa}
              onChange={(e) => setTargetSgpa(Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Presets Loader */}
      <Card className="glass-panel rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            Curriculum Presets
          </CardTitle>
          <CardDescription>
            Quickly populate course templates based on official NMIMS degree programs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CURRICULUM_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="p-4 rounded-xl border border-border-subtle bg-surface-elevated/40 hover:bg-surface-elevated flex flex-col justify-between space-y-3 transition-colors"
              >
                <div>
                  <div className="font-semibold text-xs text-primary">
                    {preset.name}
                  </div>
                  <div className="text-[11px] text-indigo-500 dark:text-cyan-400 font-bold">
                    {preset.program}
                  </div>
                  <div className="text-[11px] text-secondary mt-1 leading-relaxed">
                    {preset.description}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-border-subtle">
                  <span className="text-[10px] text-muted font-mono">
                    {preset.subjects.length} Subjects · Target {preset.targetSgpa.toFixed(1)}
                  </span>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      loadPreset(preset.id);
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
                  >
                    Load Preset <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Import / Export Backup */}
      <Card className="glass-panel rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileJson className="w-4 h-4 text-indigo-500 dark:text-cyan-400" />
            Import &amp; Export Backup (JSON)
          </CardTitle>
          <CardDescription>
            Download your academic grades to take with you or restore from a previously exported backup file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button variant="secondary" size="md" onClick={handleExport} className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-1.5 text-cyan-500" />
              Export Academic Data (.json)
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto"
            >
              <Upload className="w-4 h-4 mr-1.5" />
              Import from Backup
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,application/json"
              className="hidden"
            />
          </div>

          {importMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                importMessage.type === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }`}
            >
              {importMessage.type === "success" ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{importMessage.text}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Guarantee & Reset Area */}
      <Card className="glass-panel rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Privacy &amp; Local Persistence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-secondary leading-relaxed">
          <p>
            Your academic records are stored strictly in your browser&apos;s local storage. This application runs 100% client-side and never transmits your grades, names, or target settings to any remote server or third-party service.
          </p>

          <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-primary">
                Reset All Academic Data
              </div>
              <div className="text-[11px] text-muted">
                Permanently clears all stored courses and restores a fresh empty state.
              </div>
            </div>

            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsResetModalOpen(true)}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset Workspace
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Confirm Workspace Reset"
        description="Are you sure you want to clear all enrolled subjects? This action will reset your active workspace."
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-secondary">
            You currently have <strong>{subjects.length} subject(s)</strong> configured. You can always use the &quot;Undo&quot; button immediately after if you make a mistake.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                resetAll();
                setIsResetModalOpen(false);
                window.dispatchEvent(
                  new CustomEvent("nmims-toast", {
                    detail: {
                      title: "Workspace Reset",
                      message: "All courses and preferences cleared",
                      type: "warning",
                    },
                  })
                );
              }}
            >
              Yes, Reset Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

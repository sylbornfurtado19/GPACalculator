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
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
        <p className="text-xs text-[var(--text-secondary)] font-medium">
          Loading settings...
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
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-[var(--primary)]" />
          Workspace Settings & Data Management
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Manage your academic session labels, browser persistence, and JSON backup files.
        </p>
      </div>

      {/* General Configuration */}
      <Card className="border-[var(--border-color)]">
        <CardHeader>
          <CardTitle className="text-base">Semester Configuration</CardTitle>
          <CardDescription>
            Customize your active academic term title and baseline target SGPA.
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
              step="0.1"
              value={targetSgpa}
              onChange={(e) => setTargetSgpa(Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Presets Loader */}
      <Card className="border-[var(--border-color)]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Curriculum Presets
          </CardTitle>
          <CardDescription>
            Quickly load structured sample courses based on NMIMS degree programs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CURRICULUM_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="font-semibold text-xs text-[var(--text-primary)]">
                    {preset.name}
                  </div>
                  <div className="text-[11px] text-[var(--primary)] font-medium">
                    {preset.program}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-1">
                    {preset.description}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[var(--border-subtle)]">
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    {preset.subjects.length} Subjects • Target {preset.targetSgpa.toFixed(1)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadPreset(preset.id)}
                    className="text-xs"
                  >
                    Load Preset
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Import / Export Backup */}
      <Card className="border-[var(--border-color)]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileJson className="w-4 h-4 text-[var(--primary)]" />
            Import & Export Backup (JSON)
          </CardTitle>
          <CardDescription>
            Download your academic marks to take with you or restore from a previously exported JSON backup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button variant="secondary" size="md" onClick={handleExport} className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-1.5" />
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
              className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                importMessage.type === "success"
                  ? "border-[var(--success)]/30 bg-[var(--success-bg)] text-[var(--success)]"
                  : "border-[var(--danger)]/30 bg-[var(--danger-bg)] text-[var(--danger)]"
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
      <Card className="border-[var(--border-color)]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--success)]" />
            Privacy & Local Storage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-[var(--text-secondary)] leading-relaxed">
          <p>
            Your academic records are stored strictly in your browser&apos;s local storage. GPA Calculator never transmits your scores, subject names, or estimates to any remote server or cloud database.
          </p>

          <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-[var(--text-primary)]">
                Reset All Academic Data
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                Permanently clears all stored subjects and restores an empty workspace.
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
          <p className="text-xs text-[var(--text-secondary)]">
            You currently have <strong>{subjects.length} subject(s)</strong> configured. You can always use the &quot;Undo&quot; button immediately after if you make a mistake.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
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

"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Course,
  DEFAULT_NMIMS_COURSES,
  computeSemesterTelemetry,
  optimizeForTargetSgpa,
  GRADE_SCALE,
} from '../lib/gpa-engine';
import { TelemetryHud } from '../components/dashboard/telemetry-hud';
import { CommandGrid } from '../components/subjects/command-grid';
import {
  GhostOptimizer,
  WhatIfScenario,
} from '../components/planner/ghost-optimizer';
import {
  Moon,
  Sun,
  RotateCcw,
  Download,
  Upload,
  BookOpen,
  Check,
  GraduationCap,
  Sparkles,
  Layers,
  FileText,
} from 'lucide-react';

export default function AcademicHudPage() {
  // Theme state: dark by default
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nmims_hud_theme');
      return (saved as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  // Active courses state
  const [courses, setCourses] = useState<Course[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nmims_hud_courses');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved courses', e);
        }
      }
    }
    return DEFAULT_NMIMS_COURSES;
  });

  // Target SGPA state (defaults to 8.5)
  const [targetSgpa, setTargetSgpa] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nmims_hud_target');
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val)) return val;
      }
    }
    return 8.5;
  });

  // Ghost Projection mode toggle
  const [isGhostModeActive, setIsGhostModeActive] = useState<boolean>(false);

  // Active What-If scenario
  const [activeScenario, setActiveScenario] = useState<WhatIfScenario>('none');

  // Modal / Drawer states
  const [showScaleModal, setShowScaleModal] = useState<boolean>(false);
  const [showPresetModal, setShowPresetModal] = useState<boolean>(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // Sync theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('nmims_hud_theme', theme);
  }, [theme]);

  // Persist courses to localStorage
  useEffect(() => {
    localStorage.setItem('nmims_hud_courses', JSON.stringify(courses));
  }, [courses]);

  // Persist target to localStorage
  useEffect(() => {
    localStorage.setItem('nmims_hud_target', targetSgpa.toString());
  }, [targetSgpa]);

  // Compute what-if simulated courses
  const simulatedCourses = useMemo(() => {
    if (activeScenario === 'none') return null;

    return courses.map((course) => {
      const c = { ...course };
      if (course.isLocked) return c;

      if (activeScenario === 'ica_plus_5') {
        c.icaMarks = Math.min(50, c.icaMarks + 5);
      } else if (activeScenario === 'see_plus_5') {
        if (c.type === 'standard') {
          c.seeMarks = Math.min(100, c.seeMarks + 5);
        }
      } else if (activeScenario === 'see_plus_10') {
        if (c.type === 'standard') {
          c.seeMarks = Math.min(100, c.seeMarks + 10);
        }
      } else if (activeScenario === 'bare_minimum') {
        // Ensure safety passing margins
        c.icaMarks = Math.max(20, c.icaMarks);
        if (c.type === 'standard') {
          c.seeMarks = Math.max(40, c.seeMarks);
        }
      } else if (activeScenario === 'grade_leap') {
        // Boost SEE by +12 or ICA by +6 to jump to next tier
        if (c.type === 'standard') {
          c.seeMarks = Math.min(100, c.seeMarks + 12);
        } else {
          c.icaMarks = Math.min(50, c.icaMarks + 6);
        }
      }
      return c;
    });
  }, [courses, activeScenario]);

  // Telemetry computations
  const currentTelemetry = useMemo(() => computeSemesterTelemetry(courses), [courses]);

  const simulatedTelemetry = useMemo(() => {
    if (!simulatedCourses) return null;
    return computeSemesterTelemetry(simulatedCourses);
  }, [simulatedCourses]);

  // Target DP Optimizer calculation
  const targetPlan = useMemo(() => {
    return optimizeForTargetSgpa(courses, targetSgpa);
  }, [courses, targetSgpa]);

  // Handlers for modifying courses
  const handleUpdateCourse = useCallback((id: string, updates: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const handleDeleteCourse = useCallback((id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleAddCourse = useCallback(() => {
    const newCourse: Course = {
      id: `c-${Date.now()}`,
      code: `CS${300 + Math.floor(Math.random() * 99)}`,
      name: 'New Course Title',
      type: 'standard',
      credits: 3,
      icaMarks: 35,
      seeMarks: 65,
      isLocked: false,
    };
    setCourses((prev) => [...prev, newCourse]);
  }, []);

  const handleDuplicateCourse = useCallback((id: string) => {
    setCourses((prev) => {
      const target = prev.find((c) => c.id === id);
      if (!target) return prev;
      const copy: Course = {
        ...target,
        id: `c-${Date.now()}`,
        code: `${target.code}-B`,
      };
      return [...prev, copy];
    });
  }, []);

  // Apply target plan to active course roster
  const handleApplyPlan = useCallback(() => {
    if (!targetPlan || !targetPlan.feasible) return;

    setCourses((prev) =>
      prev.map((c) => {
        const rec = targetPlan.recommendations[c.id];
        if (rec && !c.isLocked) {
          return {
            ...c,
            icaMarks: rec.recommendedIca,
            seeMarks: c.type === 'standard' ? rec.recommendedSee : 0,
          };
        }
        return c;
      })
    );

    setIsGhostModeActive(false);
    showToast('Applied Target Plan to Active Curriculum!');
  }, [targetPlan]);

  // Keyboard shortcut Cmd+K to apply target plan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isGhostModeActive && targetPlan?.feasible) {
          handleApplyPlan();
        } else {
          setIsGhostModeActive((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGhostModeActive, targetPlan, handleApplyPlan]);

  // Toast notification helper
  const showToast = (msg: string) => {
    setCopyToast(msg);
    setTimeout(() => setCopyToast(null), 3000);
  };

  // Export transcript as clean markdown
  const handleCopyTranscript = () => {
    let md = `# NMIMS Academic Transcript Summary\n`;
    md += `Current SGPA: ${currentTelemetry.sgpa.toFixed(2)} / 10.00\n`;
    md += `Total Credits: ${currentTelemetry.totalCredits} | Earned Grade Points: ${currentTelemetry.earnedGradePoints}\n\n`;
    md += `| Code | Course Name | Type | Credits | ICA (/50) | SEE (/100) | Final % | Grade | Points |\n`;
    md += `|---|---|---|---|---|---|---|---|---|\n`;

    courses.forEach((c) => {
      const ev = currentTelemetry.courseEvaluations[c.id];
      md += `| ${c.code} | ${c.name} | ${c.type} | ${c.credits} | ${c.icaMarks} | ${c.type === 'standard' ? c.seeMarks : 'N/A'} | ${ev.finalPercentage}% | ${ev.grade} | ${ev.gradePoints} |\n`;
    });

    navigator.clipboard.writeText(md).then(() => {
      showToast('Transcript copied to clipboard in Markdown format');
    });
  };

  // Export JSON configuration
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(courses, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nmims_gpa_plan_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Curriculum JSON exported successfully');
  };

  // Import JSON configuration
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setCourses(parsed);
          showToast('Imported courses successfully');
        }
      } catch (err) {
        showToast('Invalid JSON file format');
      }
    };
    reader.readAsText(file);
  };

  // Reset to default preset
  const handleReset = () => {
    setCourses(DEFAULT_NMIMS_COURSES);
    setActiveScenario('none');
    setIsGhostModeActive(false);
    showToast('Reset to NMIMS Standard Engineering Semester');
  };

  const unlockedCount = courses.filter((c) => !c.isLocked).length;

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#EDEDED] font-sans antialiased selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (Clean links) - Zone 3 (Primary Action) */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#090A0F]/85 border-b border-white/[0.08] px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-white font-mono">
              NMIMS Academic HUD
            </span>
          </div>

          {/* Zone 2: Concise Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-neutral-400">
            <button
              onClick={() => setShowScaleModal(true)}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Grading Scale</span>
            </button>
            <button
              onClick={() => setShowPresetModal(true)}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Curriculum Presets</span>
            </button>
            <button
              onClick={handleCopyTranscript}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Copy Markdown</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action Group */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 hover:text-white transition-all"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 hover:text-white transition-all"
              title="Reset to default courses"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsGhostModeActive(!isGhostModeActive)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
                isGhostModeActive
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                  : 'bg-white/[0.06] hover:bg-white/[0.1] text-neutral-200 border border-white/[0.1]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGhostModeActive ? 'Target Diff Active' : 'Target Planner'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Command Viewport */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-6">
        {/* Toast Alert Notification */}
        {copyToast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161922] border border-cyan-500/40 text-cyan-300 font-mono text-xs shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2">
            <Check className="w-4 h-4 text-cyan-400" />
            <span>{copyToast}</span>
          </div>
        )}

        {/* 1. Dynamic SGPA Telemetry HUD */}
        <TelemetryHud
          telemetry={currentTelemetry}
          targetSgpa={targetSgpa}
          onTargetChange={setTargetSgpa}
          simulatedSgpa={simulatedTelemetry ? simulatedTelemetry.sgpa : null}
          activeScenarioName={activeScenario !== 'none' ? activeScenario : null}
          isGhostModeActive={isGhostModeActive}
          onToggleGhostMode={() => setIsGhostModeActive(!isGhostModeActive)}
          canApplyPlan={targetPlan?.feasible}
          onApplyPlan={handleApplyPlan}
          unlockedCount={unlockedCount}
        />

        {/* 2. Ghost Optimizer & What-If Dial Dials */}
        <GhostOptimizer
          isGhostModeActive={isGhostModeActive}
          onToggleGhostMode={() => setIsGhostModeActive(!isGhostModeActive)}
          targetPlan={targetPlan}
          targetSgpa={targetSgpa}
          currentSgpa={currentTelemetry.sgpa}
          onApplyPlan={handleApplyPlan}
          courses={courses}
          activeScenario={activeScenario}
          onSelectScenario={setActiveScenario}
        />

        {/* 3. The Command Grid */}
        <CommandGrid
          courses={simulatedCourses || courses}
          evaluations={
            simulatedTelemetry
              ? simulatedTelemetry.courseEvaluations
              : currentTelemetry.courseEvaluations
          }
          onUpdateCourse={handleUpdateCourse}
          onDeleteCourse={handleDeleteCourse}
          onAddCourse={handleAddCourse}
          onDuplicateCourse={handleDuplicateCourse}
          isGhostModeActive={isGhostModeActive}
          targetPlan={targetPlan}
        />

        {/* Subtle Footer Bar with Real File Actions */}
        <footer className="mt-4 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <span>NMIMS Evaluation Engine (Autonomous & De-novo Standards)</span>
            <span className="text-neutral-600">Â·</span>
            <span>Deterministic DP Optimizer</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <span className="text-neutral-700">|</span>
            <label className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
            </label>
          </div>
        </footer>
      </main>

      {/* Grading Scale Modal / Slide-over */}
      {showScaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#11131A] border border-white/[0.12] shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-mono font-bold uppercase text-white">
                  Official NMIMS Grading Matrix
                </h3>
              </div>
              <button
                onClick={() => setShowScaleModal(false)}
                className="text-neutral-400 hover:text-white text-xs font-mono"
              >
                Close âœ•
              </button>
            </div>

            <div className="divide-y divide-white/[0.06] text-xs font-mono">
              <div className="grid grid-cols-4 py-2 font-bold text-neutral-400 uppercase text-[11px]">
                <span>Marks Range</span>
                <span>Grade</span>
                <span>Points</span>
                <span>Standing</span>
              </div>
              {GRADE_SCALE.map((scale) => (
                <div key={scale.grade} className="grid grid-cols-4 py-2 text-neutral-300">
                  <span>â‰¥ {scale.minMarks}%</span>
                  <span className="font-bold text-cyan-400">{scale.grade}</span>
                  <span>{scale.points}.0</span>
                  <span className="text-neutral-400">{scale.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.08] text-[11px] text-neutral-400 font-mono space-y-1">
              <div>â€¢ <strong>Standard Course:</strong> Final % = ICA (out of 50) + SEE/2 (out of 100).</div>
              <div>â€¢ <strong>Passing Condition:</strong> ICA â‰¥ 20 AND SEE â‰¥ 40.</div>
              <div>â€¢ <strong>ICA-Only Course:</strong> Final % = ICA * 2. Passing condition: ICA â‰¥ 20.</div>
            </div>
          </div>
        </div>
      )}

      {/* Preset Curriculums Modal */}
      {showPresetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#11131A] border border-white/[0.12] shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-mono font-bold uppercase text-white">
                  Curriculum Presets
                </h3>
              </div>
              <button
                onClick={() => setShowPresetModal(false)}
                className="text-neutral-400 hover:text-white text-xs font-mono"
              >
                Close âœ•
              </button>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setCourses(DEFAULT_NMIMS_COURSES);
                  setShowPresetModal(false);
                  showToast('Loaded NMIMS Computer Engineering Sem 4');
                }}
                className="w-full p-3 text-left rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] transition-all"
              >
                <div className="text-xs font-bold text-white font-mono">
                  NMIMS B.Tech CS/IT (Sem 4)
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  6 Courses Â· 18 Credits Â· Algorithms, OS, Architecture, Linear Algebra
                </div>
              </button>

              <button
                onClick={() => {
                  setCourses([
                    { id: 'ec-1', code: 'EC301', name: 'Signals & Systems', type: 'standard', credits: 4, icaMarks: 36, seeMarks: 70, isLocked: false },
                    { id: 'ec-2', code: 'EC302', name: 'Analog Circuit Design', type: 'standard', credits: 4, icaMarks: 34, seeMarks: 65, isLocked: false },
                    { id: 'ec-3', code: 'EC303', name: 'Digital Logic & FPGA', type: 'standard', credits: 3, icaMarks: 40, seeMarks: 78, isLocked: false },
                    { id: 'ec-4', code: 'EC304L', name: 'Embedded Hardware Lab', type: 'ica_only', credits: 2, icaMarks: 45, seeMarks: 0, isLocked: false },
                    { id: 'ec-5', code: 'MA301', name: 'Probability & Random Processes', type: 'standard', credits: 3, icaMarks: 38, seeMarks: 74, isLocked: false },
                  ]);
                  setShowPresetModal(false);
                  showToast('Loaded NMIMS Electronics / EXTC Sem 3');
                }}
                className="w-full p-3 text-left rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] transition-all"
              >
                <div className="text-xs font-bold text-white font-mono">
                  NMIMS Electronics / EXTC (Sem 3)
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  5 Courses Â· 16 Credits Â· Signals, Analog Circuits, Embedded Lab
                </div>
              </button>

              <button
                onClick={() => {
                  setCourses([
                    { id: 'mb-1', code: 'MT501', name: 'Enterprise Architecture & Cloud', type: 'standard', credits: 3, icaMarks: 42, seeMarks: 80, isLocked: false },
                    { id: 'mb-2', code: 'MT502', name: 'Financial Analytics & Valuation', type: 'standard', credits: 4, icaMarks: 38, seeMarks: 75, isLocked: false },
                    { id: 'mb-3', code: 'MT503', name: 'Product Management Studio', type: 'ica_only', credits: 3, icaMarks: 46, seeMarks: 0, isLocked: false },
                    { id: 'mb-4', code: 'MT504', name: 'Supply Chain Optimization', type: 'standard', credits: 3, icaMarks: 35, seeMarks: 68, isLocked: false },
                  ]);
                  setShowPresetModal(false);
                  showToast('Loaded NMIMS MBA Tech Sem 5');
                }}
                className="w-full p-3 text-left rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] transition-all"
              >
                <div className="text-xs font-bold text-white font-mono">
                  NMIMS MBA Tech / Management (Sem 5)
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  4 Courses Â· 13 Credits Â· Financial Analytics, PM Studio, Cloud
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


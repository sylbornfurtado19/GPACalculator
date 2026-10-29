"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Course,
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
  BookOpen,
  Check,
  GraduationCap,
  Sparkles,
  FileDown,
  X,
  Trash2,
  ChevronDown,
  AlertCircle,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { generateAcademicPdf } from '../lib/pdf-export';
import { BranchSemesterModal } from '../components/branch-semester-modal';
import {
  BATCHES,
  BRANCHES,
  PROGRAMS,
  ProgramType,
  getBatchLabel,
  getCurriculum,
} from '../lib/srb-database';

const APP_RELEASE_VERSION = 'v4_program_mbatech_diploma_release';

export default function AcademicHudPage() {
  // Theme state: defaults to off-white 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nmims_user_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light';
  });

  // Active courses state - strictly user's own data saved locally on laptop
  const [courses, setCourses] = useState<Course[]>(() => {
    if (typeof window !== 'undefined') {
      // Version check: if app updated, wipe legacy user preferences & courses
      const storedVersion = localStorage.getItem('nmims_app_version');
      if (storedVersion !== APP_RELEASE_VERSION) {
        localStorage.removeItem('nmims_user_courses');
        localStorage.removeItem('nmims_hud_courses');
        localStorage.removeItem('nmims_user_batch');
        localStorage.removeItem('nmims_user_program');
        localStorage.removeItem('nmims_user_branch');
        localStorage.removeItem('nmims_user_semester');
        localStorage.removeItem('nmims_gpa_calculator_v1');
        localStorage.removeItem('nmims_gpa_calculator_v2');
        localStorage.setItem('nmims_app_version', APP_RELEASE_VERSION);
        return [];
      }

      // 1. Immediately purge legacy demo storage keys
      localStorage.removeItem('nmims_hud_courses');

      // 2. Load the user's authentic personal courses
      const saved = localStorage.getItem('nmims_user_courses');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } catch (e) {
          console.error('Failed to parse saved courses', e);
        }
      }
    }
    return [];
  });

  // Target SGPA state (defaults to 8.5)
  const [targetSgpa, setTargetSgpa] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nmims_user_target');
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
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // Batch, Program, Branch & Semester state
  const [batch, setBatch] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const storedVersion = localStorage.getItem('nmims_app_version');
      if (storedVersion !== APP_RELEASE_VERSION) return '2026';
      return localStorage.getItem('nmims_user_batch') || '2026';
    }
    return '2026';
  });

  const [program, setProgram] = useState<ProgramType>(() => {
    if (typeof window !== 'undefined') {
      const storedVersion = localStorage.getItem('nmims_app_version');
      if (storedVersion !== APP_RELEASE_VERSION) return 'btech';
      return (localStorage.getItem('nmims_user_program') as ProgramType) || 'btech';
    }
    return 'btech';
  });

  const [branch, setBranch] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const storedVersion = localStorage.getItem('nmims_app_version');
      if (storedVersion !== APP_RELEASE_VERSION) return '';
      return localStorage.getItem('nmims_user_branch') || '';
    }
    return '';
  });

  const [semester, setSemester] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const storedVersion = localStorage.getItem('nmims_app_version');
      if (storedVersion !== APP_RELEASE_VERSION) return 1;
      const saved = localStorage.getItem('nmims_user_semester');
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val)) return val;
      }
    }
    return 1;
  });

  // Modal opens automatically on launch if no branch is chosen yet
  const [showBranchModal, setShowBranchModal] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedVersion = localStorage.getItem('nmims_app_version');
      if (storedVersion !== APP_RELEASE_VERSION) {
        // App update: reset all preferences
        localStorage.removeItem('nmims_user_courses');
        localStorage.removeItem('nmims_hud_courses');
        localStorage.removeItem('nmims_user_batch');
        localStorage.removeItem('nmims_user_program');
        localStorage.removeItem('nmims_user_branch');
        localStorage.removeItem('nmims_user_semester');
        localStorage.removeItem('nmims_gpa_calculator_v1');
        localStorage.removeItem('nmims_gpa_calculator_v2');
        localStorage.setItem('nmims_app_version', APP_RELEASE_VERSION);

        setCourses([]);
        setBatch('2026');
        setProgram('btech');
        setBranch('');
        setSemester(1);
        setShowBranchModal(true);
      } else {
        const savedBranch = localStorage.getItem('nmims_user_branch');
        if (!savedBranch) {
          setShowBranchModal(true);
        }
      }
    }
  }, []);

  const currentBranchObj = useMemo(
    () => BRANCHES.find((b) => b.id === branch),
    [branch]
  );

  const currentBatchObj = useMemo(
    () => BATCHES.find((b) => b.id === batch),
    [batch]
  );

  const currentProgObj = useMemo(
    () => PROGRAMS.find((p) => p.id === program) || PROGRAMS[0],
    [program]
  );

  const handleBatchBranchSemesterSelect = (
    selectedBatch: string,
    selectedProgram: ProgramType,
    selectedBranch: string,
    selectedSemester: number
  ) => {
    setBatch(selectedBatch);
    setProgram(selectedProgram);
    setBranch(selectedBranch);
    setSemester(selectedSemester);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nmims_user_batch', selectedBatch);
      localStorage.setItem('nmims_user_program', selectedProgram);
      localStorage.setItem('nmims_user_branch', selectedBranch);
      localStorage.setItem('nmims_user_semester', selectedSemester.toString());
    }

    // Load official SRB courses from the srb-database
    const srbCourses = getCurriculum(selectedBatch, selectedBranch, selectedSemester, selectedProgram);
    if (srbCourses && srbCourses.length > 0) {
      const loadedCourses: Course[] = srbCourses.map((s, idx) => ({
        id: `c-${selectedBatch}-${selectedProgram}-${selectedBranch}-s${selectedSemester}-${idx}-${Date.now()}`,
        code: s.code,
        name: s.name,
        type: s.type,
        credits: s.credits,
        icaMarks: s.type === 'ica_only' ? 40 : 35,
        seeMarks: s.type === 'ica_only' ? 0 : 65,
        isLocked: false,
      }));
      setCourses(loadedCourses);
    }

    setShowBranchModal(false);
    const branchObj = BRANCHES.find((b) => b.id === selectedBranch);
    const branchName = branchObj ? branchObj.code : selectedBranch.toUpperCase();
    const progObj = PROGRAMS.find((p) => p.id === selectedProgram) || PROGRAMS[0];
    const batchLabel = getBatchLabel(selectedBatch, selectedProgram);
    showToast(`Loaded ${progObj.code} · ${batchLabel} · ${branchName} · Sem ${selectedSemester}`);
  };

  // Sync theme to document and persist locally
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('nmims_user_theme', theme);
  }, [theme]);

  // Persist user's courses to localStorage on laptop in real-time
  useEffect(() => {
    localStorage.setItem('nmims_user_courses', JSON.stringify(courses));
  }, [courses]);

  // Persist target to localStorage on laptop in real-time
  useEffect(() => {
    localStorage.setItem('nmims_user_target', targetSgpa.toString());
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

  // Handlers for modifying courses (stored in localStorage automatically)
  const handleUpdateCourse = useCallback((id: string, updates: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const handleDeleteCourse = useCallback((id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Toast notification helper
  const showToast = useCallback((msg: string) => {
    setCopyToast(msg);
    setTimeout(() => setCopyToast(null), 3000);
  }, []);

  const handleAddCourse = useCallback(() => {
    const count = courses.length + 1;
    const newCourse: Course = {
      id: `c-${Date.now()}`,
      code: `SUB${count}`,
      name: `Subject ${count}`,
      type: 'standard',
      credits: 3,
      icaMarks: 35,
      seeMarks: 65,
      isLocked: false,
    };
    setCourses((prev) => [...prev, newCourse]);
  }, [courses.length]);

  const handleAddCourseraCourse = useCallback(() => {
    const defaultCredits = [4, 6, 7].includes(semester) ? 2 : 1;
    const newCourse: Course = {
      id: `c-coursera-${Date.now()}`,
      code: `COUR${semester}01`,
      name: `Coursera Elective (Sem ${semester})`,
      type: 'ica_only',
      credits: defaultCredits,
      icaMarks: 40,
      seeMarks: 0,
      isLocked: false,
    };
    setCourses((prev) => [...prev, newCourse]);
    showToast(`Added Coursera Elective (${defaultCredits} credit${defaultCredits > 1 ? 's' : ''}, ICA Only)`);
  }, [semester, showToast]);

  const handleAddDesignExperience = useCallback(() => {
    const defaultCredits = semester === 4 ? 1 : 2;
    const newCourse: Course = {
      id: `c-desexp-${Date.now()}`,
      code: `DESEXP${semester}`,
      name: `Design Experience (Sem ${semester})`,
      type: 'ica_only',
      credits: defaultCredits,
      icaMarks: 40,
      seeMarks: 0,
      isLocked: false,
    };
    setCourses((prev) => [...prev, newCourse]);
    showToast(`Added Design Experience (${defaultCredits} credit${defaultCredits > 1 ? 's' : ''}, ICA Only)`);
  }, [semester, showToast]);

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
    showToast('Applied Target Plan to Subjects!');
  }, [targetPlan, showToast]);

  // Export official NMIMS PDF grade card report
  const handleExportPdf = () => {
    if (courses.length === 0) {
      showToast('Add subjects first to export a PDF report');
      return;
    }
    try {
      generateAcademicPdf(courses, currentTelemetry);
      showToast('Downloaded NMIMS Grade Report PDF!');
    } catch (err) {
      console.error('Failed to generate PDF', err);
      showToast('Failed to export PDF');
    }
  };

  // Reset confirmation dialog state
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Reset to clean empty state (wipes stored data & preferences)
  const handleReset = () => {
    setCourses([]);
    setBatch('2026');
    setProgram('btech');
    setBranch('');
    setSemester(1);
    setActiveScenario('none');
    setIsGhostModeActive(false);
    setShowResetConfirm(false);
    localStorage.removeItem('nmims_user_courses');
    localStorage.removeItem('nmims_hud_courses');
    localStorage.removeItem('nmims_user_batch');
    localStorage.removeItem('nmims_user_program');
    localStorage.removeItem('nmims_user_branch');
    localStorage.removeItem('nmims_user_semester');
    localStorage.removeItem('nmims_gpa_calculator_v1');
    localStorage.removeItem('nmims_gpa_calculator_v2');
    setShowBranchModal(true);
    showToast('Reset all preferences & subjects. Please select your program, batch, branch & semester!');
  };

  const unlockedCount = courses.filter((c) => !c.isLocked).length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#090A0F] text-slate-900 dark:text-[#EDEDED] font-sans antialiased transition-colors duration-150">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#F8F9FA]/90 dark:bg-[#090A0F]/85 border-b border-slate-200/80 dark:border-white/[0.08] px-3 sm:px-6 md:px-8 py-2.5 sm:py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-2 sm:gap-2.5 whitespace-nowrap shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white block">
                <span className="sm:hidden">NMIMS GPA</span>
                <span className="hidden sm:inline">NMIMS GPA Engine</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-neutral-400 hidden sm:block">
                Autonomous NMIMS Evaluation & Target Optimizer
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-4 text-xs text-slate-600 dark:text-neutral-400 font-medium">
            <button
              onClick={() => setShowScaleModal(true)}
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Grading Scale</span>
            </button>
            <button
              onClick={handleExportPdf}
              className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] dark:text-neutral-200 border border-indigo-200/80 dark:border-white/[0.08] font-semibold transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
              <span>Export PDF</span>
            </button>
          </nav>

          {/* Actions Group */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Branch & Semester Selection Trigger Pill */}
            <button
              onClick={() => setShowBranchModal(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] dark:text-cyan-400 border border-indigo-200/80 dark:border-white/[0.08] text-xs font-semibold transition-all cursor-pointer"
              title="Change Program, Batch, Branch & Semester"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>
                {batch ? `'${batch.slice(-2)} ` : ''}
                {program !== 'btech' ? `${currentProgObj.code} ` : ''}
                {currentBranchObj ? currentBranchObj.code : (branch ? branch.toUpperCase() : 'Curriculum')}
                {branch ? ` · Sem ${semester}` : ''}
              </span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
            <button
              onClick={() => setShowScaleModal(true)}
              className="md:hidden p-2 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-neutral-300 transition-all cursor-pointer"
              title="View grading scale"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleExportPdf}
              className="md:hidden p-2 rounded-xl bg-indigo-50 dark:bg-cyan-500/10 hover:bg-indigo-100 border border-indigo-200 dark:border-cyan-500/20 text-indigo-700 dark:text-cyan-400 transition-all cursor-pointer"
              title="Export PDF Grade Card"
            >
              <FileDown className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-neutral-300 transition-all cursor-pointer"
              title={theme === 'dark' ? 'Switch to off-white light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {courses.length > 0 && (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="p-2 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-slate-200 dark:border-white/[0.08] text-slate-700 hover:text-rose-600 dark:text-neutral-300 dark:hover:text-rose-400 transition-all cursor-pointer"
                title="Clear all subjects"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => setIsGhostModeActive(!isGhostModeActive)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isGhostModeActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 dark:bg-cyan-500 dark:text-black'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:text-neutral-200 dark:border-white/[0.1]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isGhostModeActive ? 'Target Diff Active' : 'Target Planner'}</span>
              <span className="sm:hidden">{isGhostModeActive ? 'Target' : 'Plan'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Clear Confirmation Modal for Mobile/Desktop */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#11131A] border border-slate-200 dark:border-white/[0.12] shadow-2xl p-5 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Clear All Subjects?
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
              This will remove all entered subjects from your device. You can start fresh with new courses.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-neutral-300 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Viewport */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6">
        {/* Toast Alert Notification */}
        {copyToast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-[#161922] dark:border dark:border-cyan-500/40 text-xs font-medium shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2">
            <Check className="w-4 h-4 text-emerald-400 dark:text-cyan-400" />
            <span>{copyToast}</span>
          </div>
        )}

        {/* Active Academic Program Banner */}
        {branch && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-600 dark:text-neutral-400">Curriculum:</span>
              <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-cyan-500/10 font-bold text-indigo-700 dark:text-cyan-400 border border-indigo-200/60 dark:border-cyan-500/20">
                {getBatchLabel(batch, program)}
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 font-bold text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-500/20 text-[11px]">
                {currentProgObj.label}
              </span>
              <span className="text-slate-300 dark:text-neutral-600">·</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {currentBranchObj?.name || branch.toUpperCase()}
              </span>
              <span className="text-slate-300 dark:text-neutral-600">·</span>
              <span className="font-semibold text-slate-700 dark:text-neutral-300">
                Semester {semester}
              </span>
            </div>
            <button
              onClick={() => setShowBranchModal(true)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-cyan-400 dark:hover:text-cyan-300 cursor-pointer"
            >
              Change Curriculum ▾
            </button>
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

        {/* 2. Ghost Optimizer & What-If Dial (Shown when subjects exist) */}
        {courses.length > 0 && (
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
        )}

        {/* 3. Batch-Specific SRB Guidance & Manual Course Actions */}
        {batch === '2025' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5 text-amber-700 dark:text-amber-300">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  Batch 2025–29 Curriculum Notice (2nd Year)
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed max-w-2xl">
                  Coursera electives are not listed in the 2025–29 SRB syllabus. If you enrolled in an approved Coursera course this semester, add it to your roster with its designated credits (evaluated strictly as &apos;ICA Only&apos;).
                </p>
              </div>
            </div>
            <button
              onClick={handleAddCourseraCourse}
              className="self-end sm:self-center shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Coursera ({[4, 6, 7].includes(semester) ? '2 cr' : '1 cr'})</span>
            </button>
          </div>
        )}

        {batch === '2024' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-950 dark:text-cyan-200 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center shrink-0 mt-0.5 text-sky-700 dark:text-cyan-400">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900 dark:text-cyan-300">
                  Batch 2024–28 Curriculum Notice (3rd &amp; 4th Year)
                </h4>
                <p className="text-xs text-sky-800 dark:text-cyan-200/90 leading-relaxed max-w-2xl">
                  Neither Coursera nor Design Experience are part of the standard 2024–28 SRB document. If your department assigned either course this semester, use the quick shortcuts below to add them (both evaluated as &apos;ICA Only&apos;).
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={handleAddCourseraCourse}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-black active:scale-95 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Coursera ({[4, 6, 7].includes(semester) ? '2 cr' : '1 cr'})</span>
              </button>
              <button
                onClick={handleAddDesignExperience}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Design Exp ({semester === 4 ? '1 cr' : '2 cr'})</span>
              </button>
            </div>
          </div>
        )}

        {batch === '2026' && (
          <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-indigo-50/70 dark:bg-white/[0.03] border border-indigo-200/60 dark:border-white/[0.08] text-xs text-indigo-950 dark:text-neutral-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-cyan-400 shrink-0" />
              <span className="font-semibold text-indigo-900 dark:text-white">Batch 2026–30:</span>
              <span className="text-slate-600 dark:text-neutral-400">
                Mandatory Coursera electives and credits are already integrated into your official SRB curriculum as ICA-Only courses.
              </span>
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-indigo-100/70 dark:bg-cyan-500/10 text-indigo-700 dark:text-cyan-400 font-bold text-[10px] uppercase tracking-wider shrink-0">
              SRB Verified
            </span>
          </div>
        )}

        {/* 4. The Subject Grid / Mobile Cards */}
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

        {/* Subtle Footer Bar with Real PDF Export */}
        <footer className="mt-2 pt-4 border-t border-slate-200/80 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <span>NMIMS Autonomous Academic Standards</span>
            <span className="text-slate-300 dark:text-neutral-600">·</span>
            <span>Dynamic Programming GPA Engine</span>
          </div>

          <div className="flex items-center">
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </footer>
      </main>

      {/* Official NMIMS Grading Matrix Modal */}
      {showScaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#11131A] border border-slate-200 dark:border-white/[0.12] shadow-2xl p-5 sm:p-6 relative">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 dark:border-white/[0.08] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-cyan-500/10 flex items-center justify-center text-indigo-600 dark:text-cyan-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Official NMIMS Grading Matrix
                </h3>
              </div>
              <button
                onClick={() => setShowScaleModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/[0.06] text-xs">
              <div className="grid grid-cols-4 py-2 font-bold text-slate-500 dark:text-neutral-400 uppercase text-[11px]">
                <span>Marks Range</span>
                <span>Grade</span>
                <span>Points</span>
                <span>Standing</span>
              </div>
              {GRADE_SCALE.map((scale) => (
                <div key={scale.grade} className="grid grid-cols-4 py-2 text-slate-700 dark:text-neutral-300 items-center">
                  <span className="font-medium tabular-nums">≥ {scale.minMarks}%</span>
                  <span className="font-bold text-indigo-600 dark:text-cyan-400">{scale.grade}</span>
                  <span className="tabular-nums">{scale.points}.0</span>
                  <span className="text-slate-500 dark:text-neutral-400">{scale.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-200/80 dark:border-white/[0.08] text-xs text-slate-600 dark:text-neutral-400 space-y-1.5">
              <div className="flex items-start gap-1.5">
                <span className="text-indigo-600 dark:text-cyan-400 font-bold">•</span>
                <span><strong>Standard Course:</strong> Final % = ICA (out of 50) + SEE / 2 (out of 100).</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-indigo-600 dark:text-cyan-400 font-bold">•</span>
                <span><strong>Passing Criteria:</strong> ICA ≥ 20 AND SEE ≥ 40.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-indigo-600 dark:text-cyan-400 font-bold">•</span>
                <span><strong>ICA-Only Course:</strong> Final % = ICA × 2. Passing condition: ICA ≥ 20.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Branch & Semester Selector Modal */}
      <BranchSemesterModal
        isOpen={showBranchModal}
        currentBatch={batch}
        currentProgram={program}
        currentBranch={branch}
        currentSemester={semester}
        isDismissable={Boolean(branch)}
        onClose={() => setShowBranchModal(false)}
        onSelect={handleBatchBranchSemesterSelect}
      />
    </div>
  );
}

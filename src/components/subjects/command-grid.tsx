"use client";
import React, { useState } from 'react';
import {
  Course,
  CourseEvaluation,
  TargetPlanResult,
} from '../../lib/gpa-engine';
import { ScrubbableCell } from '../common/scrubbable-cell';
import {
  Lock,
  Unlock,
  Trash2,
  Plus,
  Copy,
  Info,
  BookOpen,
  Minus,
} from 'lucide-react';

interface CommandGridProps {
  courses: Course[];
  evaluations: Record<string, CourseEvaluation>;
  onUpdateCourse: (id: string, updates: Partial<Course>) => void;
  onDeleteCourse: (id: string) => void;
  onAddCourse: () => void;
  onDuplicateCourse: (id: string) => void;
  isGhostModeActive: boolean;
  targetPlan?: TargetPlanResult | null;
}

export const CommandGrid: React.FC<CommandGridProps> = ({
  courses,
  evaluations,
  onUpdateCourse,
  onDeleteCourse,
  onAddCourse,
  onDuplicateCourse,
  isGhostModeActive,
  targetPlan,
}) => {
  const [activeWarningId, setActiveWarningId] = useState<string | null>(null);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'O':
        return 'text-sky-700 bg-sky-50 border-sky-200 dark:text-cyan-400 dark:bg-cyan-500/10 dark:border-cyan-500/20';
      case 'A+':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20';
      case 'A':
        return 'text-teal-700 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-500/10 dark:border-teal-500/20';
      case 'B+':
        return 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20';
      case 'B':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-500/10 dark:border-indigo-500/20';
      case 'C':
        return 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20';
      case 'P':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-500/10 dark:border-yellow-500/20';
      case 'F':
      case 'AB':
      default:
        return 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/15 dark:border-rose-500/30';
    }
  };

  // If no courses are added yet, show a clean, friendly empty state
  if (courses.length === 0) {
    return (
      <div className="w-full rounded-2xl bg-white dark:bg-[#11131A] border border-slate-200/80 dark:border-white/[0.08] shadow-xs p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-cyan-500/10 border border-indigo-200 dark:border-cyan-500/20 flex items-center justify-center text-indigo-600 dark:text-cyan-400">
          <BookOpen className="w-7 h-7" />
        </div>
        <div className="max-w-md space-y-1.5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No Subjects Added Yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 leading-relaxed">
            Add your subjects for this semester to compute your real-time NMIMS GPA, evaluate passing status, and optimize target exam scores.
          </p>
        </div>
        <button
          onClick={onAddCourse}
          className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-black shadow-md shadow-indigo-500/20 dark:shadow-cyan-500/20 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Your First Subject</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-[#11131A] border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden">
      {/* Table & Card Header Bar */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-neutral-400">
            Course Roster
          </span>
          <span className="text-xs text-slate-500 dark:text-neutral-500 font-medium">
            ({courses.length} {courses.length === 1 ? 'subject' : 'subjects'})
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          <span className="hidden sm:inline text-slate-500 dark:text-neutral-400 font-medium">
            NMIMS Criteria: ICA ≥ 20 · SEE ≥ 40
          </span>
          <button
            onClick={onAddCourse}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] dark:text-neutral-200 border border-indigo-200/80 dark:border-white/[0.08] font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. MOBILE CARDS VIEW (Visible only on screens < md)        */}
      {/* ========================================================= */}
      <div className="block md:hidden divide-y divide-slate-100 dark:divide-white/[0.04] p-3 space-y-3">
        {courses.map((course) => {
          const evalResult = evaluations[course.id] || {
            finalPercentage: 0,
            grade: 'F',
            gradePoints: 0,
            weightedPoints: 0,
            isIcaPassed: true,
            isSeePassed: true,
            isPassed: true,
          };

          const rec = isGhostModeActive && targetPlan?.recommendations?.[course.id];
          const isStandard = course.type === 'standard';
          const icaFailed = !evalResult.isIcaPassed;
          const seeFailed = isStandard && !evalResult.isSeePassed;

          return (
            <div
              key={course.id}
              className={`rounded-2xl border p-3.5 space-y-3 transition-all ${
                !evalResult.isPassed
                  ? 'bg-rose-50/40 border-rose-200 dark:bg-rose-950/[0.15] dark:border-rose-900/40'
                  : course.isLocked
                  ? 'bg-slate-50/60 border-slate-200/80 dark:bg-white/[0.02] dark:border-white/[0.06]'
                  : 'bg-white border-slate-200/80 dark:bg-white/[0.03] dark:border-white/[0.06] shadow-2xs'
              }`}
            >
              {/* Card Top: Code, Title & Actions */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={course.code}
                      onChange={(e) => onUpdateCourse(course.id, { code: e.target.value })}
                      placeholder="CODE"
                      className="w-16 text-[11px] font-bold text-slate-500 focus:text-slate-900 dark:text-neutral-400 dark:focus:text-white bg-slate-100 dark:bg-white/[0.04] rounded px-1.5 py-0.5 border border-transparent focus:border-indigo-500 dark:focus:border-cyan-500 outline-none uppercase"
                    />
                    <input
                      type="text"
                      value={course.name}
                      onChange={(e) => onUpdateCourse(course.id, { name: e.target.value })}
                      placeholder="Course Title..."
                      className="flex-1 font-semibold text-sm text-slate-900 focus:text-indigo-600 dark:text-neutral-100 dark:focus:text-cyan-400 bg-transparent border-b border-transparent focus:border-indigo-400 dark:focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onUpdateCourse(course.id, { isLocked: !course.isLocked })}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      course.isLocked
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                        : 'text-slate-400 hover:text-slate-600 dark:text-neutral-500'
                    }`}
                    title={course.isLocked ? 'Course locked from optimizer' : 'Lock course'}
                  >
                    {course.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => onDuplicateCourse(course.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-neutral-500 dark:hover:text-neutral-200 cursor-pointer"
                    title="Duplicate course"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteCourse(course.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:text-neutral-500 dark:hover:text-rose-400 cursor-pointer"
                    title="Delete course"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Type toggle & Credits Selector */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-white/[0.04]">
                <button
                  onClick={() =>
                    onUpdateCourse(course.id, {
                      type: isStandard ? 'ica_only' : 'standard',
                      seeMarks: isStandard ? 0 : 70,
                    })
                  }
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    isStandard
                      ? 'bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-neutral-300'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-500/30'
                  }`}
                >
                  {isStandard ? 'Standard (ICA+SEE)' : 'Lab / ICA-Only'}
                </button>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-neutral-400 font-medium">
                  <span>Credits:</span>
                  <div className="flex items-center bg-slate-100 dark:bg-white/[0.04] rounded-lg border border-slate-200 dark:border-white/[0.06] overflow-hidden">
                    <button
                      onClick={() => onUpdateCourse(course.id, { credits: Math.max(1, course.credits - 1) })}
                      className="px-2 py-0.5 hover:bg-slate-200 dark:hover:bg-white/[0.08] cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 font-bold tabular-nums">{course.credits}</span>
                    <button
                      onClick={() => onUpdateCourse(course.id, { credits: Math.min(6, course.credits + 1) })}
                      className="px-2 py-0.5 hover:bg-slate-200 dark:hover:bg-white/[0.08] cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mark Steppers: ICA and SEE */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* ICA Control */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-neutral-400">
                    <span>ICA (/50)</span>
                    {rec && rec.icaDelta > 0 && isGhostModeActive && (
                      <span className="text-[10px] text-indigo-600 dark:text-cyan-400 font-bold">
                        +{rec.icaDelta}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <button
                      onClick={() => onUpdateCourse(course.id, { icaMarks: Math.max(0, course.icaMarks - 1) })}
                      disabled={course.isLocked}
                      className="w-8 h-8 rounded-lg bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-600 dark:text-neutral-300 font-bold active:bg-slate-200 cursor-pointer disabled:opacity-40"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={50}
                      value={course.icaMarks}
                      disabled={course.isLocked}
                      onChange={(e) => onUpdateCourse(course.id, { icaMarks: Math.min(50, Math.max(0, parseInt(e.target.value) || 0)) })}
                      className="w-12 text-center font-bold text-sm text-slate-900 dark:text-white tabular-nums bg-transparent outline-none"
                    />
                    <button
                      onClick={() => onUpdateCourse(course.id, { icaMarks: Math.min(50, course.icaMarks + 1) })}
                      disabled={course.isLocked}
                      className="w-8 h-8 rounded-lg bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-600 dark:text-neutral-300 font-bold active:bg-slate-200 cursor-pointer disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  {icaFailed && (
                    <div className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                      ⚠️ Min 20 required
                    </div>
                  )}
                </div>

                {/* SEE Control */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-neutral-400">
                    <span>SEE (/100)</span>
                    {rec && rec.seeDelta > 0 && isGhostModeActive && isStandard && (
                      <span className="text-[10px] text-indigo-600 dark:text-cyan-400 font-bold">
                        +{rec.seeDelta}
                      </span>
                    )}
                  </div>

                  {isStandard ? (
                    <>
                      <div className="flex items-center justify-between gap-1">
                        <button
                          onClick={() => onUpdateCourse(course.id, { seeMarks: Math.max(0, course.seeMarks - 5) })}
                          disabled={course.isLocked}
                          className="w-8 h-8 rounded-lg bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-600 dark:text-neutral-300 font-bold active:bg-slate-200 cursor-pointer disabled:opacity-40 text-xs"
                          title="-5 marks"
                        >
                          -5
                        </button>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={100}
                          value={course.seeMarks}
                          disabled={course.isLocked}
                          onChange={(e) => onUpdateCourse(course.id, { seeMarks: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                          className="w-12 text-center font-bold text-sm text-slate-900 dark:text-white tabular-nums bg-transparent outline-none"
                        />
                        <button
                          onClick={() => onUpdateCourse(course.id, { seeMarks: Math.min(100, course.seeMarks + 5) })}
                          disabled={course.isLocked}
                          className="w-8 h-8 rounded-lg bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-600 dark:text-neutral-300 font-bold active:bg-slate-200 cursor-pointer disabled:opacity-40 text-xs"
                          title="+5 marks"
                        >
                          +5
                        </button>
                      </div>

                      {seeFailed && (
                        <div className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                          ⚠️ Min 40 required
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="h-8 flex items-center justify-center text-[11px] text-slate-400 dark:text-neutral-500 font-medium italic">
                      Lab (No SEE Exam)
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Final % and Grade */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium">Final:</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                    {evalResult.finalPercentage.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getGradeColor(
                      evalResult.grade
                    )}`}
                  >
                    {evalResult.grade} ({evalResult.gradePoints} pts)
                  </span>
                  {evalResult.isPassed ? (
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">✓ Pass</span>
                  ) : (
                    <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">Backlog</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <button
          onClick={onAddCourse}
          className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-neutral-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-dashed border-slate-300 dark:border-white/[0.1] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Subject</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 2. DESKTOP TABLE VIEW (Visible only on screens md and up) */}
      {/* ========================================================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-white/[0.06] bg-slate-50/70 dark:bg-white/[0.02] text-slate-600 dark:text-neutral-400 uppercase tracking-wider text-[11px] font-semibold">
              <th className="py-3 px-4 w-64">Course & Code</th>
              <th className="py-3 px-3 w-28">Type</th>
              <th className="py-3 px-3 w-20 text-center">Credits</th>
              <th className="py-3 px-3 w-36 text-center">ICA / 50</th>
              <th className="py-3 px-3 w-36 text-center">SEE / 100</th>
              <th className="py-3 px-3 w-20 text-center">Lock</th>
              <th className="py-3 px-3 w-24 text-right">Final %</th>
              <th className="py-3 px-3 w-24 text-center">Grade</th>
              <th className="py-3 px-3 w-20 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            {courses.map((course) => {
              const evalResult = evaluations[course.id] || {
                finalPercentage: 0,
                grade: 'F',
                gradePoints: 0,
                weightedPoints: 0,
                isIcaPassed: true,
                isSeePassed: true,
                isPassed: true,
              };

              const rec = isGhostModeActive && targetPlan?.recommendations?.[course.id];
              const isStandard = course.type === 'standard';
              const icaFailed = !evalResult.isIcaPassed;
              const seeFailed = isStandard && !evalResult.isSeePassed;

              return (
                <tr
                  key={course.id}
                  className={`group transition-colors ${
                    !evalResult.isPassed
                      ? 'bg-rose-50/50 hover:bg-rose-50 dark:bg-rose-950/[0.08] dark:hover:bg-rose-950/[0.14]'
                      : course.isLocked
                      ? 'bg-slate-50/30 hover:bg-slate-50/60 dark:bg-white/[0.01] dark:hover:bg-white/[0.03]'
                      : 'hover:bg-slate-50/80 dark:hover:bg-white/[0.03]'
                  }`}
                >
                  {/* Course Code & Name */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={course.code}
                        onChange={(e) => onUpdateCourse(course.id, { code: e.target.value })}
                        placeholder="CODE"
                        className="w-16 text-[11px] font-bold text-slate-500 focus:text-slate-900 dark:text-neutral-400 dark:focus:text-white bg-transparent border-b border-transparent focus:border-indigo-500 dark:focus:border-cyan-500 outline-none uppercase"
                      />
                      <input
                        type="text"
                        value={course.name}
                        onChange={(e) => onUpdateCourse(course.id, { name: e.target.value })}
                        placeholder="Subject Title..."
                        className="w-full font-medium text-slate-900 focus:text-indigo-600 dark:text-neutral-200 dark:focus:text-white bg-transparent border-b border-transparent focus:border-indigo-500 dark:focus:border-cyan-500 outline-none"
                      />
                    </div>
                  </td>

                  {/* Course Type Toggle */}
                  <td className="py-2.5 px-3">
                    <button
                      onClick={() =>
                        onUpdateCourse(course.id, {
                          type: isStandard ? 'ica_only' : 'standard',
                          seeMarks: isStandard ? 0 : 70,
                        })
                      }
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                        isStandard
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-500/30 dark:hover:bg-indigo-900/80'
                      }`}
                      title="Toggle Standard (ICA+SEE) or Lab (ICA-Only)"
                    >
                      {isStandard ? 'Standard' : 'ICA-Only'}
                    </button>
                  </td>

                  {/* Credits */}
                  <td className="py-2.5 px-3 text-center">
                    <ScrubbableCell
                      value={course.credits}
                      min={1}
                      max={6}
                      step={1}
                      onChange={(credits) => onUpdateCourse(course.id, { credits })}
                      className="w-14 justify-center"
                      showBar={false}
                    />
                  </td>

                  {/* ICA Marks Cell / 50 */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center justify-center gap-1.5 relative">
                      <ScrubbableCell
                        value={course.icaMarks}
                        min={0}
                        max={50}
                        step={1}
                        disabled={course.isLocked}
                        onChange={(icaMarks) => onUpdateCourse(course.id, { icaMarks })}
                        className={`w-24 ${
                          isGhostModeActive && rec && rec.icaDelta > 0 ? 'border-indigo-400 dark:border-cyan-500/60' : ''
                        }`}
                        highlightDelta={isGhostModeActive && rec ? rec.icaDelta : 0}
                      />

                      {icaFailed && (
                        <div className="relative">
                          <button
                            onMouseEnter={() => setActiveWarningId(`${course.id}-ica`)}
                            onMouseLeave={() => setActiveWarningId(null)}
                            className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse cursor-pointer shadow-xs"
                          />
                          {activeWarningId === `${course.id}-ica` && (
                            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 w-48 p-2 rounded-xl bg-white dark:bg-[#161922] border border-rose-300 dark:border-rose-500/40 text-[11px] text-rose-600 dark:text-rose-300 shadow-xl pointer-events-none">
                              Failed ICA component! Must be ≥ 20/50.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* SEE Marks Cell / 100 */}
                  <td className="py-2.5 px-3">
                    {isStandard ? (
                      <div className="flex items-center justify-center gap-1.5 relative">
                        <ScrubbableCell
                          value={course.seeMarks}
                          min={0}
                          max={100}
                          step={1}
                          disabled={course.isLocked}
                          onChange={(seeMarks) => onUpdateCourse(course.id, { seeMarks })}
                          className={`w-24 ${
                            isGhostModeActive && rec && rec.seeDelta > 0 ? 'border-indigo-400 dark:border-cyan-500/60' : ''
                          }`}
                          highlightDelta={isGhostModeActive && rec ? rec.seeDelta : 0}
                        />

                        {seeFailed && (
                          <div className="relative">
                            <button
                              onMouseEnter={() => setActiveWarningId(`${course.id}-see`)}
                              onMouseLeave={() => setActiveWarningId(null)}
                              className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse cursor-pointer shadow-xs"
                            />
                            {activeWarningId === `${course.id}-see` && (
                              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 w-48 p-2 rounded-xl bg-white dark:bg-[#161922] border border-rose-300 dark:border-rose-500/40 text-[11px] text-rose-600 dark:text-rose-300 shadow-xl pointer-events-none">
                                Failed SEE component! Must be ≥ 40/100.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-slate-400 dark:text-neutral-500 text-[11px] font-medium">
                        Lab (No SEE)
                      </div>
                    )}
                  </td>

                  {/* Lock Toggle Button */}
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onUpdateCourse(course.id, { isLocked: !course.isLocked })}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        course.isLocked
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-neutral-500 dark:hover:text-neutral-300 dark:hover:bg-white/[0.04]'
                      }`}
                      title={
                        course.isLocked
                          ? 'Locked: Target Optimizer will not touch these marks'
                          : 'Unlocked: Optimizer can adjust marks to reach target'
                      }
                    >
                      {course.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                  </td>

                  {/* Final Percentage Column */}
                  <td className="py-2.5 px-3 text-right tabular-nums">
                    {isGhostModeActive && rec && rec.recommendedPercentage !== evalResult.finalPercentage ? (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-slate-400 dark:text-neutral-500 line-through">
                          {evalResult.finalPercentage.toFixed(1)}%
                        </span>
                        <span className="font-bold text-indigo-600 dark:text-cyan-400">
                          {rec.recommendedPercentage.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span className="font-semibold text-slate-900 dark:text-neutral-200">
                        {evalResult.finalPercentage.toFixed(1)}%
                      </span>
                    )}
                  </td>

                  {/* Grade Pill Column */}
                  <td className="py-2.5 px-3 text-center">
                    {isGhostModeActive && rec && rec.recommendedGrade !== evalResult.grade ? (
                      <div className="flex items-center justify-center gap-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold border opacity-50 ${getGradeColor(
                            evalResult.grade
                          )}`}
                        >
                          {evalResult.grade}
                        </span>
                        <span className="text-indigo-600 dark:text-cyan-400 font-bold">→</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold border shadow-xs ${getGradeColor(
                            rec.recommendedGrade
                          )}`}
                        >
                          {rec.recommendedGrade}
                        </span>
                      </div>
                    ) : (
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getGradeColor(
                          evalResult.grade
                        )}`}
                      >
                        {evalResult.grade} ({evalResult.gradePoints})
                      </span>
                    )}
                  </td>

                  {/* Actions Column */}
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onDuplicateCourse(course.id)}
                        className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                        title="Duplicate course"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteCourse(course.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:text-neutral-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Inline Quick Add Row */}
            <tr
              onClick={onAddCourse}
              className="group cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-cyan-500/[0.03] transition-colors border-t border-dashed border-slate-200 dark:border-white/[0.08]"
            >
              <td colSpan={9} className="py-3 px-5 text-center text-slate-500 group-hover:text-indigo-600 dark:text-neutral-400 dark:group-hover:text-cyan-300 text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Click to add another course</span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Grid Status / Info Footer */}
      <div className="px-4 sm:px-5 py-2.5 bg-slate-50/80 dark:bg-white/[0.02] border-t border-slate-200/80 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-neutral-400">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
          <span>Click marks to edit. Lock icon freezes scores during optimizer runs.</span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span>Passing: Final % ≥ 40 · ICA ≥ 20/50 · SEE ≥ 40/100</span>
        </div>
      </div>
    </div>
  );
};

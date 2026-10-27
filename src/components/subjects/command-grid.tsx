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
  AlertCircle,
  Copy,
  Info,
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
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'A+':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'A':
        return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
      case 'B+':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'B':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'C':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'P':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'F':
      case 'AB':
      default:
        return 'text-rose-400 bg-rose-500/15 border-rose-500/30';
    }
  };

  return (
    <div className="w-full rounded-2xl bg-[#11131A] border border-white/[0.08] shadow-2xl overflow-hidden">
      {/* Table Header Bar */}
      <div className="px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400">
            Course Roster & Evaluation Matrix
          </span>
          <span className="text-xs font-mono text-neutral-400">
            ({courses.length} courses)
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
          <span className="hidden sm:inline">NMIMS Rules: ICA â‰¥ 20 Â· SEE â‰¥ 40</span>
          <span className="hidden sm:inline text-neutral-600">Â·</span>
          <button
            onClick={onAddCourse}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Dense Command Grid Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02] text-neutral-400 font-mono uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-4 font-medium w-64">Course & Code</th>
              <th className="py-2.5 px-3 font-medium w-28">Type</th>
              <th className="py-2.5 px-3 font-medium w-20 text-center">Credits</th>
              <th className="py-2.5 px-3 font-medium w-36 text-center">ICA / 50</th>
              <th className="py-2.5 px-3 font-medium w-36 text-center">SEE / 100</th>
              <th className="py-2.5 px-3 font-medium w-20 text-center">Lock</th>
              <th className="py-2.5 px-3 font-medium w-24 text-right">Final %</th>
              <th className="py-2.5 px-3 font-medium w-24 text-center">Grade</th>
              <th className="py-2.5 px-3 font-medium w-20 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
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

              // Checking component failures for inline warning micro-dots
              const icaFailed = !evalResult.isIcaPassed;
              const seeFailed = isStandard && !evalResult.isSeePassed;

              return (
                <tr
                  key={course.id}
                  className={`group transition-colors ${
                    !evalResult.isPassed
                      ? 'bg-rose-950/[0.08] hover:bg-rose-950/[0.14]'
                      : course.isLocked
                      ? 'bg-white/[0.01] hover:bg-white/[0.03]'
                      : 'hover:bg-white/[0.03]'
                  }`}
                >
                  {/* Course Code & Name (inline editable) */}
                  <td className="py-2.5 px-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={course.code}
                          onChange={(e) => onUpdateCourse(course.id, { code: e.target.value })}
                          placeholder="CODE"
                          className="w-16 font-mono text-[11px] font-semibold text-neutral-400 focus:text-white bg-transparent border-b border-transparent focus:border-cyan-500 outline-none uppercase"
                        />
                        <input
                          type="text"
                          value={course.name}
                          onChange={(e) => onUpdateCourse(course.id, { name: e.target.value })}
                          placeholder="Subject Title..."
                          className="w-full font-medium text-neutral-200 focus:text-white bg-transparent border-b border-transparent focus:border-cyan-500 outline-none"
                        />
                      </div>
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
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded transition-colors ${
                        isStandard
                          ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                          : 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/80'
                      }`}
                      title="Click to toggle between Standard and ICA-Only evaluation"
                    >
                      {isStandard ? 'Standard' : 'ICA-Only'}
                    </button>
                  </td>

                  {/* Credits Scrubbable Cell */}
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
                          isGhostModeActive && rec && rec.icaDelta > 0 ? 'border-cyan-500/60' : ''
                        }`}
                        highlightDelta={isGhostModeActive && rec ? rec.icaDelta : 0}
                      />

                      {/* Inline Warning Micro-Dot if ICA < 20 */}
                      {icaFailed && (
                        <div className="relative">
                          <button
                            onMouseEnter={() => setActiveWarningId(`${course.id}-ica`)}
                            onMouseLeave={() => setActiveWarningId(null)}
                            className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse cursor-pointer shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                          />
                          {activeWarningId === `${course.id}-ica` && (
                            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 w-48 p-2 rounded-lg bg-[#161922] border border-rose-500/40 text-[11px] font-mono text-rose-300 shadow-xl pointer-events-none">
                              Failed ICA component! Must be â‰¥ 20/50.
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
                            isGhostModeActive && rec && rec.seeDelta > 0 ? 'border-cyan-500/60' : ''
                          }`}
                          highlightDelta={isGhostModeActive && rec ? rec.seeDelta : 0}
                        />

                        {/* Inline Warning Micro-Dot if SEE < 40 */}
                        {seeFailed && (
                          <div className="relative">
                            <button
                              onMouseEnter={() => setActiveWarningId(`${course.id}-see`)}
                              onMouseLeave={() => setActiveWarningId(null)}
                              className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse cursor-pointer shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                            />
                            {activeWarningId === `${course.id}-see` && (
                              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 w-48 p-2 rounded-lg bg-[#161922] border border-rose-500/40 text-[11px] font-mono text-rose-300 shadow-xl pointer-events-none">
                                Failed SEE component! Must be â‰¥ 40/100.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-neutral-400 font-mono text-[11px]">
                        N/A (ICA only)
                      </div>
                    )}
                  </td>

                  {/* Lock Toggle Button */}
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onUpdateCourse(course.id, { isLocked: !course.isLocked })}
                      className={`p-1.5 rounded transition-all ${
                        course.isLocked
                          ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20'
                          : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04]'
                      }`}
                      title={
                        course.isLocked
                          ? 'Locked: Target Optimizer will not touch these marks'
                          : 'Unlocked: Optimizer can adjust marks to reach target'
                      }
                    >
                      {course.isLocked ? (
                        <Lock className="w-3.5 h-3.5" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </td>

                  {/* Final Percentage Column */}
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                    {isGhostModeActive && rec && rec.recommendedPercentage !== evalResult.finalPercentage ? (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-neutral-400 line-through">
                          {evalResult.finalPercentage.toFixed(1)}%
                        </span>
                        <span className="font-bold text-cyan-400">
                          {rec.recommendedPercentage.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span className="font-semibold text-neutral-200">
                        {evalResult.finalPercentage.toFixed(1)}%
                      </span>
                    )}
                  </td>

                  {/* Grade Pill Column */}
                  <td className="py-2.5 px-3 text-center">
                    {isGhostModeActive && rec && rec.recommendedGrade !== evalResult.grade ? (
                      <div className="flex items-center justify-center gap-1 font-mono">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold border opacity-50 ${getGradeColor(
                            evalResult.grade
                          )}`}
                        >
                          {evalResult.grade}
                        </span>
                        <span className="text-cyan-400 font-bold">â†’</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold border shadow-[0_0_8px_rgba(6,182,212,0.4)] ${getGradeColor(
                            rec.recommendedGrade
                          )}`}
                        >
                          {rec.recommendedGrade}
                        </span>
                      </div>
                    ) : (
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-mono text-[11px] font-bold border ${getGradeColor(
                          evalResult.grade
                        )}`}
                      >
                        {evalResult.grade} ({evalResult.gradePoints})
                      </span>
                    )}
                  </td>

                  {/* Actions Column */}
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onDuplicateCourse(course.id)}
                        className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                        title="Duplicate course"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteCourse(course.id)}
                        className="p-1 rounded text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
              className="group cursor-pointer hover:bg-cyan-500/[0.03] transition-colors border-t border-dashed border-white/[0.08]"
            >
              <td colSpan={9} className="py-3 px-5 text-center text-neutral-400 group-hover:text-cyan-300 font-mono text-xs">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Click or press Enter to add row</span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Grid Status / Info Footer */}
      <div className="px-5 py-2.5 bg-white/[0.02] border-t border-white/[0.06] flex flex-wrap items-center justify-between text-[11px] text-neutral-400 font-mono">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-neutral-400" />
          <span>Drag horizontally to scrub marks. Click cell to type directly. Lock icons freeze scores during optimization.</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Passing: Final % â‰¥ 40 Â· ICA â‰¥ 20/50 Â· SEE â‰¥ 40/100</span>
        </div>
      </div>
    </div>
  );
};


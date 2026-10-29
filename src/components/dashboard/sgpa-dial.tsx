"use client";

import React, { useEffect, useRef } from "react";
import { Sparkles, Trophy, Award, Flame, AlertCircle } from "lucide-react";
import { formatGpa } from "@/lib/utils";

interface SgpaDialProps {
  sgpa: number;
  targetSgpa?: number;
  totalCredits: number;
  allPassed: boolean;
  className?: string;
}

export function SgpaDial({
  sgpa,
  targetSgpa = 8.5,
  totalCredits,
  allPassed,
  className = "",
}: SgpaDialProps) {
  const previousSgpaRef = useRef(sgpa);
  const hasCelebratedRef = useRef(false);

  // Trigger confetti burst on SGPA >= 9.0
  useEffect(() => {
    if (
      sgpa >= 9.0 &&
      (!hasCelebratedRef.current || previousSgpaRef.current < 9.0)
    ) {
      hasCelebratedRef.current = true;
      if (
        typeof window !== "undefined" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        import("canvas-confetti").then((confettiModule) => {
          const confetti = confettiModule.default;
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#10b981", "#06b6d4", "#6366f1", "#f59e0b"],
            disableForReducedMotion: true,
          });
        });
      }
    }
    previousSgpaRef.current = sgpa;
  }, [sgpa]);

  // Radius and circumference for SVG circle
  const size = 220;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Meter spans 270 degrees (leaving 90 deg gap at bottom)
  const arcLength = circumference * 0.75;
  const progressRatio = Math.max(0, Math.min(1, sgpa / 10));
  const strokeDashoffset = arcLength * (1 - progressRatio);

  // Color tier mapping
  const tier =
    sgpa >= 9.0
      ? {
          name: "Outstanding",
          grade: "O Tier",
          text: "text-emerald-500",
          glow: "rgba(16, 185, 129, 0.35)",
          gradient: ["#34d399", "#10b981"],
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/30",
          icon: Trophy,
        }
      : sgpa >= 8.0
      ? {
          name: "Excellent",
          grade: "A+ Tier",
          text: "text-cyan-500 dark:text-cyan-400",
          glow: "rgba(56, 189, 248, 0.35)",
          gradient: ["#38bdf8", "#0284c7"],
          bg: "bg-cyan-500/10",
          border: "border-cyan-500/30",
          icon: Award,
        }
      : sgpa >= 7.0
      ? {
          name: "Very Good",
          grade: "A Tier",
          text: "text-indigo-500 dark:text-indigo-400",
          glow: "rgba(99, 102, 241, 0.35)",
          gradient: ["#818cf8", "#4f46e5"],
          bg: "bg-indigo-500/10",
          border: "border-indigo-500/30",
          icon: Sparkles,
        }
      : sgpa >= 6.0
      ? {
          name: "Good",
          grade: "B+ Tier",
          text: "text-purple-500 dark:text-purple-400",
          glow: "rgba(168, 85, 247, 0.3)",
          gradient: ["#c084fc", "#9333ea"],
          bg: "bg-purple-500/10",
          border: "border-purple-500/30",
          icon: Flame,
        }
      : sgpa >= 5.0
      ? {
          name: "Average",
          grade: "B/C Tier",
          text: "text-amber-500",
          glow: "rgba(245, 158, 11, 0.3)",
          gradient: ["#fbbf24", "#d97706"],
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          icon: AlertCircle,
        }
      : {
          name: "Critical",
          grade: "F / Review",
          text: "text-rose-500",
          glow: "rgba(244, 63, 94, 0.3)",
          gradient: ["#fb7185", "#e11d48"],
          bg: "bg-rose-500/10",
          border: "border-rose-500/30",
          icon: AlertCircle,
        };

  const TierIcon = tier.icon;
  const deltaFromTarget = sgpa - targetSgpa;
  const isAhead = deltaFromTarget >= 0;

  return (
    <div
      className={`glass-card p-6 sm:p-7 rounded-3xl relative overflow-hidden flex flex-col items-center justify-between text-center select-none ${className}`}
      style={{
        boxShadow: `0 8px 32px -4px ${tier.glow}, inset 0 1px 0 0 var(--border-specular)`,
      }}
    >
      {/* Background radial accent glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full pointer-events-none filter blur-3xl opacity-30"
        style={{ background: tier.gradient[0] }}
        aria-hidden="true"
      />

      {/* Top Header Badge */}
      <div className="flex items-center justify-between w-full z-10 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary">
          <TierIcon className={`w-4 h-4 ${tier.text}`} />
          <span>Academic Standing</span>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${tier.bg} ${tier.border} ${tier.text}`}
        >
          {tier.grade}
        </span>
      </div>

      {/* Central SVG Dial Gauge */}
      <div className="relative w-[210px] h-[210px] sm:w-[230px] sm:h-[230px] flex items-center justify-center my-1 z-10">
        <svg
          className="w-full h-full -rotate-[225deg]"
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="sgpaGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={tier.gradient[0]} />
              <stop offset="100%" stopColor={tier.gradient[1]} />
            </linearGradient>
          </defs>

          {/* Background Arc Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            className="text-border-subtle"
          />

          {/* Active Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#sgpaGaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s ease",
            }}
          />
        </svg>

        {/* Center Readout Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted">
            Estimated SGPA
          </span>
          <div className="flex items-baseline my-0.5">
            <span
              className={`font-display text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums ${tier.text}`}
            >
              {formatGpa(sgpa)}
            </span>
          </div>
          <span className="text-xs font-mono text-muted tabular-nums">
            / 10.00 scale
          </span>
        </div>
      </div>

      {/* Bottom Sub-Telemetry */}
      <div className="w-full grid grid-cols-2 gap-2 pt-3 border-t border-border-subtle z-10 text-xs">
        <div className="flex flex-col items-start px-2 py-1 rounded-xl bg-surface-elevated/60">
          <span className="text-[10px] text-muted font-medium uppercase tracking-wide">
            Target Goal
          </span>
          <span className="font-mono font-bold text-primary tabular-nums">
            {formatGpa(targetSgpa)}
            <span
              className={`ml-1 text-[10px] font-semibold ${
                isAhead ? "text-emerald-500" : "text-amber-500"
              }`}
            >
              ({isAhead ? `+${formatGpa(deltaFromTarget)}` : formatGpa(deltaFromTarget)})
            </span>
          </span>
        </div>

        <div className="flex flex-col items-start px-2 py-1 rounded-xl bg-surface-elevated/60">
          <span className="text-[10px] text-muted font-medium uppercase tracking-wide">
            Enrolled Credits
          </span>
          <span className="font-mono font-bold text-primary tabular-nums flex items-center gap-1">
            {totalCredits} cr
            {allPassed ? (
              <span className="text-[10px] text-emerald-500 font-semibold">· All Clear</span>
            ) : (
              <span className="text-[10px] text-rose-500 font-semibold">· Backlog</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

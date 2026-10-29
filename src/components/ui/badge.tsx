"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LetterGrade, SubjectStatus } from "@/types/academic";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "neutral" | "outline" | "cyan" | "indigo";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    neutral: "bg-surface-elevated text-secondary border-border-subtle",
    outline: "bg-transparent text-primary border-border-subtle",
    cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold border transition-all duration-150 select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// Letter Grade style map using the token system defined in globals.css
const GRADE_STYLE_MAP: Record<LetterGrade, { style: React.CSSProperties; label: string }> = {
  O: {
    style: {
      color: "var(--grade-o-text)",
      backgroundColor: "var(--grade-o-bg)",
      borderColor: "var(--grade-o-border)",
      boxShadow: "0 0 16px -2px var(--grade-o-glow)",
    },
    label: "Outstanding (10)",
  },
  "A+": {
    style: {
      color: "var(--grade-aplus-text)",
      backgroundColor: "var(--grade-aplus-bg)",
      borderColor: "var(--grade-aplus-border)",
      boxShadow: "0 0 16px -2px var(--grade-aplus-glow)",
    },
    label: "Excellent (9)",
  },
  A: {
    style: {
      color: "var(--grade-a-text)",
      backgroundColor: "var(--grade-a-bg)",
      borderColor: "var(--grade-a-border)",
      boxShadow: "0 0 16px -2px var(--grade-a-glow)",
    },
    label: "Very Good (8)",
  },
  "B+": {
    style: {
      color: "var(--grade-bplus-text)",
      backgroundColor: "var(--grade-bplus-bg)",
      borderColor: "var(--grade-bplus-border)",
      boxShadow: "0 0 16px -2px var(--grade-bplus-glow)",
    },
    label: "Good (7)",
  },
  B: {
    style: {
      color: "var(--grade-b-text)",
      backgroundColor: "var(--grade-b-bg)",
      borderColor: "var(--grade-b-border)",
      boxShadow: "0 0 14px -2px var(--grade-b-glow)",
    },
    label: "Above Avg (6)",
  },
  C: {
    style: {
      color: "var(--grade-c-text)",
      backgroundColor: "var(--grade-c-bg)",
      borderColor: "var(--grade-c-border)",
      boxShadow: "0 0 14px -2px var(--grade-c-glow)",
    },
    label: "Average (5)",
  },
  P: {
    style: {
      color: "var(--grade-p-text)",
      backgroundColor: "var(--grade-p-bg)",
      borderColor: "var(--grade-p-border)",
      boxShadow: "0 0 12px -2px var(--grade-p-glow)",
    },
    label: "Pass (4)",
  },
  F: {
    style: {
      color: "var(--grade-f-text)",
      backgroundColor: "var(--grade-f-bg)",
      borderColor: "var(--grade-f-border)",
      boxShadow: "0 0 16px -2px var(--grade-f-glow)",
    },
    label: "Fail (0)",
  },
  AB: {
    style: {
      color: "var(--grade-ab-text)",
      backgroundColor: "var(--grade-ab-bg)",
      borderColor: "var(--grade-ab-border)",
      boxShadow: "0 0 16px -2px var(--grade-ab-glow)",
    },
    label: "Absent (0)",
  },
};

export function GradeBadge({
  grade,
  size = "md",
  className,
}: {
  grade: LetterGrade;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const item = GRADE_STYLE_MAP[grade] || GRADE_STYLE_MAP.F;

  const sizeClass = {
    xs: "px-1.5 py-0.2 text-[10px] min-w-[24px] h-5 rounded-md",
    sm: "px-2 py-0.5 text-[11px] min-w-[28px] h-6 rounded-md",
    md: "px-2.5 py-1 text-xs min-w-[34px] h-7 rounded-lg",
    lg: "px-3.5 py-1.5 text-sm min-w-[42px] h-9 rounded-xl",
  }[size];

  return (
    <span
      key={grade}
      style={item.style}
      title={item.label}
      className={cn(
        "font-display inline-flex items-center justify-center font-bold border tracking-wider select-none transition-all duration-200 animate-in zoom-in-90 fade-in",
        sizeClass,
        className
      )}
    >
      {grade}
    </span>
  );
}

export function StatusBadge({ status }: { status: SubjectStatus }) {
  switch (status) {
    case "pass":
      return <Badge variant="success">Passed</Badge>;
    case "fail":
      return <Badge variant="danger">Failed</Badge>;
    case "absent":
      return <Badge variant="warning">Absent</Badge>;
  }
}

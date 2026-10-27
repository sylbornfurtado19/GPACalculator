import * as React from "react";
import { cn } from "@/lib/utils";
import { LetterGrade, SubjectStatus } from "@/types/academic";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "neutral" | "outline";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-[var(--primary-subtle)] text-[var(--primary)] border-[var(--primary)]/20",
    success: "bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]/20",
    warning: "bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning)]/20",
    danger: "bg-[var(--danger-bg)] text-[var(--danger)] border-[var(--danger)]/20",
    neutral: "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-color)]",
    outline: "bg-transparent text-[var(--text-primary)] border-[var(--border-color)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function GradeBadge({ grade, size = "md" }: { grade: LetterGrade; size?: "sm" | "md" | "lg" }) {
  let variant: BadgeProps["variant"] = "neutral";

  switch (grade) {
    case "O":
    case "A+":
      variant = "success";
      break;
    case "A":
    case "B+":
      variant = "default";
      break;
    case "B":
    case "C":
      variant = "warning";
      break;
    case "P":
      variant = "neutral";
      break;
    case "F":
    case "AB":
      variant = "danger";
      break;
  }

  const sizeClass = {
    sm: "px-1.5 py-0.2 text-[10px]",
    md: "px-2 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm font-bold tracking-wider",
  }[size];

  return (
    <Badge variant={variant} className={cn("font-mono font-bold", sizeClass)}>
      {grade}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: SubjectStatus }) {
  if (status === "pass") {
    return <Badge variant="success">Pass</Badge>;
  }
  if (status === "absent") {
    return <Badge variant="danger">Absent</Badge>;
  }
  return <Badge variant="danger">Fail</Badge>;
}

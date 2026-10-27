import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, hint, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full flex flex-col space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-[var(--text-secondary)]"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "w-full px-3 py-1.5 text-sm rounded-lg border bg-[var(--bg-card)] text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent disabled:opacity-50 disabled:bg-[var(--bg-surface)]",
            error ? "border-[var(--danger)]" : "border-[var(--border-color)]",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <span className="text-[11px] text-[var(--text-muted)]">{hint}</span>
        )}
        {error && (
          <span className="text-[11px] font-medium text-[var(--danger)]">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

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
            className="text-xs font-semibold uppercase tracking-wider text-secondary"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          inputMode={type === "number" ? "decimal" : props.inputMode}
          className={cn(
            "w-full px-3 py-2 text-base sm:text-sm rounded-xl border bg-surface-elevated/70 text-primary transition-all duration-150 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/60 disabled:opacity-40 disabled:pointer-events-none tabular-nums shadow-inner",
            error
              ? "border-rose-500/80 focus:ring-rose-500/40"
              : "border-border-subtle hover:border-border-hover",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <span className="text-[11px] text-muted">{hint}</span>
        )}
        {error && (
          <span className="text-[11px] font-medium text-rose-500">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

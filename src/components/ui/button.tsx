import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer";

    const variantStyles = {
      primary:
        "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-xs focus-visible:ring-[var(--primary)]",
      secondary:
        "bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-color)] focus-visible:ring-[var(--text-secondary)]",
      outline:
        "border border-[var(--border-color)] bg-transparent hover:bg-[var(--bg-surface)] text-[var(--text-primary)] focus-visible:ring-[var(--primary)]",
      danger:
        "bg-[var(--danger)] text-white hover:opacity-90 shadow-xs focus-visible:ring-[var(--danger)]",
      ghost:
        "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]",
    };

    const sizeStyles = {
      sm: "text-xs px-2.5 py-1.5 gap-1.5",
      md: "text-sm px-3.5 py-2 gap-2",
      lg: "text-base px-5 py-2.5 gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

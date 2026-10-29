"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "glow";
  size?: "xs" | "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-semibold rounded-xl select-none transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-40 disabled:pointer-events-none active:scale-[0.97] cursor-pointer";

    const variantStyles = {
      primary:
        "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-black dark:shadow-cyan-500/20 border border-white/20",
      secondary:
        "glass-panel text-primary hover:bg-surface-elevated/80 border border-border-subtle hover:border-border-hover shadow-xs",
      outline:
        "border border-border-subtle hover:border-cyan-500/50 hover:bg-cyan-500/5 text-primary bg-transparent",
      danger:
        "bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-500/20 border border-rose-400/30",
      ghost:
        "bg-transparent text-secondary hover:text-primary hover:bg-surface-elevated/60",
      glow:
        "bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-500/25 border border-white/20",
    };

    const sizeStyles = {
      xs: "text-[11px] px-2.5 py-1 gap-1 rounded-lg h-7",
      sm: "text-xs px-3 py-1.5 gap-1.5 rounded-lg h-8",
      md: "text-xs sm:text-sm px-4 py-2 gap-2 rounded-xl h-10 min-h-[40px]",
      lg: "text-sm sm:text-base px-5 py-2.5 gap-2.5 rounded-2xl h-12 min-h-[48px]",
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

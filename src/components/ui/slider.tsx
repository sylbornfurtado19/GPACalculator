"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  indicatorText?: string;
  color?: "indigo" | "cyan" | "emerald" | "amber" | "rose";
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  disabled = false,
  className,
  label,
  indicatorText,
  color = "indigo",
}: SliderProps) {
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const colorStyles = {
    indigo: "accent-indigo-600 dark:accent-cyan-400 from-indigo-500 to-cyan-400",
    cyan: "accent-cyan-500 from-cyan-500 to-sky-400",
    emerald: "accent-emerald-500 from-emerald-500 to-teal-400",
    amber: "accent-amber-500 from-amber-500 to-yellow-400",
    rose: "accent-rose-500 from-rose-500 to-pink-400",
  }[color];

  return (
    <div className={cn("w-full flex flex-col space-y-1.5", className)}>
      {(label || indicatorText) && (
        <div className="flex justify-between items-center text-xs">
          {label && (
            <span className="font-medium text-secondary text-[11px] sm:text-xs">
              {label}
            </span>
          )}
          {indicatorText && (
            <span className="font-mono font-bold text-primary tabular-nums text-xs">
              {indicatorText}
            </span>
          )}
        </div>
      )}
      <div className="relative flex items-center w-full h-7 touch-none select-none">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-label={label || "Slider input"}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            "w-full h-2 sm:h-2.5 rounded-full appearance-none cursor-pointer focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-all",
            colorStyles
          )}
          style={{
            background: `linear-gradient(to right, rgb(99 102 241) 0%, rgb(56 189 248) ${percentage}%, var(--border-subtle) ${percentage}%, var(--border-subtle) 100%)`,
          }}
        />
      </div>
    </div>
  );
}

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
}: SliderProps) {
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className={cn("w-full flex flex-col space-y-1.5", className)}>
      {(label || indicatorText) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="font-medium text-[var(--text-secondary)]">{label}</span>}
          {indicatorText && (
            <span className="font-mono font-medium text-[var(--text-primary)]">
              {indicatorText}
            </span>
          )}
        </div>
      )}
      <div className="relative flex items-center w-full h-5 touch-none select-none">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-[var(--bg-surface)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)] focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percentage}%, var(--bg-surface) ${percentage}%, var(--bg-surface) 100%)`,
          }}
        />
      </div>
    </div>
  );
}

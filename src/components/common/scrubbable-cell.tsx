"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ScrubbableCellProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (nextValue: number) => void;
  disabled?: boolean;
  label?: string;
  suffix?: string;
  className?: string;
  showBar?: boolean;
  highlightDelta?: number; // e.g. +6 if target plan recommends +6
}

export const ScrubbableCell: React.FC<ScrubbableCellProps> = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  disabled = false,
  suffix = '',
  className = '',
  showBar = true,
  highlightDelta = 0,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number>(0);
  const startValRef = useRef<number>(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setEditValue(String(value));
    }
  }, [value, isEditing]);

  const commitValue = useCallback(
    (parsed: number) => {
      const clamped = Math.max(min, Math.min(max, Math.round(parsed)));
      onChange(clamped);
      setEditValue(String(clamped));
      setIsEditing(false);
    },
    [min, max, onChange]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || isEditing) return;
    if (e.button !== 0) return; // left click only

    startXRef.current = e.clientX;
    startValRef.current = value;
    setIsDragging(false);

    let hasDragged = false;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startXRef.current;
      if (Math.abs(deltaX) > 3) {
        hasDragged = true;
        setIsDragging(true);
        document.body.classList.add('scrub-active');
      }

      if (hasDragged) {
        // Sensitivity: 4 pixels per step, or fine step with shift
        const scale = moveEvent.shiftKey ? 0.2 : 0.4;
        const change = Math.round(deltaX * scale) * step;
        const nextVal = Math.max(min, Math.min(max, startValRef.current + change));
        onChange(nextVal);
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.classList.remove('scrub-active');

      setTimeout(() => {
        setIsDragging(false);
      }, 50);

      // If user merely clicked without dragging, switch to direct input edit mode
      if (!hasDragged) {
        setIsEditing(true);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Touch drag support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isEditing) return;
    startXRef.current = e.touches[0].clientX;
    startValRef.current = value;
    let hasDragged = false;

    const onTouchMove = (moveEvent: TouchEvent) => {
      const deltaX = moveEvent.touches[0].clientX - startXRef.current;
      if (Math.abs(deltaX) > 6) {
        hasDragged = true;
        setIsDragging(true);
      }
      if (hasDragged) {
        const change = Math.round(deltaX * 0.4) * step;
        const nextVal = Math.max(min, Math.min(max, startValRef.current + change));
        onChange(nextVal);
      }
    };

    const onTouchEnd = () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      setIsDragging(false);
      if (!hasDragged) {
        setIsEditing(true);
      }
    };

    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  if (isEditing) {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <input
          ref={inputRef}
          type="number"
          min={min}
          max={max}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commitValue(parseFloat(editValue) || 0);
            } else if (e.key === 'Escape') {
              setIsEditing(false);
              setEditValue(String(value));
            }
          }}
          onBlur={() => {
            commitValue(parseFloat(editValue) || 0);
          }}
          className="w-full text-center text-xs font-semibold tabular-nums text-slate-900 dark:text-white bg-slate-100 dark:bg-cyan-950/60 border border-indigo-400 dark:border-cyan-500/50 rounded-lg px-2 py-1 outline-none ring-2 ring-indigo-500/20 dark:ring-cyan-500/40"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      title={disabled ? 'Locked' : 'Click to type, drag horizontally to scrub'}
      className={`relative select-none overflow-hidden group cursor-ew-resize inline-flex items-center justify-between rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
        disabled
          ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04]'
          : 'bg-slate-100/70 dark:bg-white/[0.04] hover:bg-slate-200/70 dark:hover:bg-white/[0.08] border border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.18]'
      } ${className}`}
    >
      {/* Background fill gauge bar */}
      {showBar && (
        <div
          className={`absolute left-0 top-0 bottom-0 pointer-events-none transition-all duration-75 ${
            highlightDelta > 0
              ? 'bg-indigo-500/15 dark:bg-cyan-500/20'
              : 'bg-slate-200/50 dark:bg-white/[0.04] group-hover:bg-slate-300/40 dark:group-hover:bg-white/[0.07]'
          }`}
          style={{ width: `${percentage}%` }}
        />
      )}

      {/* Main numeric value */}
      <span className="relative z-10 tabular-nums tracking-tight font-semibold text-slate-800 dark:text-neutral-100">
        {value}
        {suffix && <span className="text-[10px] text-slate-500 dark:text-neutral-500 ml-0.5">{suffix}</span>}
      </span>

      {/* Recommended diff indicator */}
      {highlightDelta > 0 && (
        <span className="relative z-10 ml-1.5 text-[10px] text-indigo-600 dark:text-cyan-400 font-bold bg-indigo-50 dark:bg-cyan-950/80 px-1 rounded">
          +{highlightDelta}
        </span>
      )}
    </div>
  );
};


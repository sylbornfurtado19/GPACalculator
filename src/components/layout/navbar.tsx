"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Calculator,
  Target,
  BookOpen,
  Settings,
  Undo2,
  Command,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useAcademic } from "@/context/academic-context";
import { formatGpa } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
  { href: "/calculator", label: "Calculator", shortLabel: "Calc", icon: Calculator },
  { href: "/planner", label: "Target Planner", shortLabel: "Planner", icon: Target },
  { href: "/how-it-works", label: "Grading Rules", shortLabel: "Rules", icon: BookOpen },
  { href: "/settings", label: "Settings", shortLabel: "Settings", icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const { summary, canUndo, undoLastPlan, lastPlanDescription } = useAcademic();

  const openCommandPalette = () => {
    window.dispatchEvent(new CustomEvent("nmims-open-command-palette"));
  };

  return (
    <>
      {/* Desktop & Mobile Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border-subtle glass-panel backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo & Brand Identity */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-sm sm:text-base text-primary tracking-tight">
                    NMIMS GPA
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 text-[10px] font-mono font-semibold uppercase">
                    HUD
                  </span>
                </div>
                <span className="text-[10px] text-muted hidden sm:inline-block -mt-0.5 font-medium">
                  Official Academic Grading &amp; Target Engine
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 glass-card px-2 py-1 rounded-2xl border border-border-subtle">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? "bg-indigo-600 dark:bg-cyan-500 text-white dark:text-black shadow-xs font-bold"
                        : "text-secondary hover:text-primary hover:bg-surface-elevated/80"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2">
              {/* Live SGPA Micro Pill (Visible on both Mobile and Desktop) */}
              <div
                title="Current Estimated SGPA"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface-elevated/90 border border-border-subtle shadow-xs tabular-nums"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted hidden xs:inline">
                  SGPA
                </span>
                <span
                  className={`font-mono text-xs sm:text-sm font-extrabold ${
                    summary.sgpa >= 9
                      ? "text-emerald-500"
                      : summary.sgpa >= 8
                      ? "text-cyan-500"
                      : summary.sgpa >= 7
                      ? "text-indigo-500"
                      : summary.sgpa >= 5
                      ? "text-amber-500"
                      : "text-rose-500"
                  }`}
                >
                  {formatGpa(summary.sgpa)}
                </span>
              </div>

              {/* Undo Target Plan Button */}
              {canUndo && (
                <button
                  type="button"
                  onClick={undoLastPlan}
                  title={`Undo applied plan: ${lastPlanDescription || ""}`}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-all cursor-pointer animate-in fade-in"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Undo Plan</span>
                </button>
              )}

              {/* Command Palette Trigger (Cmd/Ctrl + K) */}
              <button
                type="button"
                onClick={openCommandPalette}
                title="Open Command Palette (Cmd/Ctrl + K)"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-secondary hover:text-primary rounded-xl border border-border-subtle hover:border-border-hover bg-surface/70 hover:bg-surface-elevated transition-all cursor-pointer"
              >
                <Command className="w-3.5 h-3.5 text-muted" />
                <span className="text-muted font-mono text-[10px] bg-surface-elevated px-1 py-0.5 rounded border border-border-subtle">
                  ⌘K
                </span>
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (Permanent, 44px+ touch targets, safe-area padded) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-border-subtle pb-safe backdrop-blur-2xl shadow-2xl"
      >
        <div className="grid grid-cols-5 h-14 items-center">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center h-full min-h-[44px] transition-all duration-150 ${
                  isActive
                    ? "text-indigo-600 dark:text-cyan-400 font-bold"
                    : "text-muted hover:text-secondary"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""}`} />
                <span className="text-[10px] mt-0.5 leading-none">
                  {item.shortLabel}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-600 dark:bg-cyan-400 shadow-sm" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

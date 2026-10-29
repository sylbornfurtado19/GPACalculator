import React from "react";
import Link from "next/link";
import { GraduationCap, ShieldCheck, Cpu } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border-subtle glass-panel mt-auto py-6 sm:py-8 mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-secondary">
            <GraduationCap className="w-4 h-4 text-indigo-500 dark:text-cyan-400" />
            <span className="font-bold text-primary">NMIMS GPA HUD</span>
            <span>·</span>
            <span>B.Tech · MBA Tech · Diploma Curriculum Systems</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-secondary">
            <Link href="/" className="hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/calculator" className="hover:text-primary transition-colors">
              Live Calculator
            </Link>
            <Link href="/planner" className="hover:text-primary transition-colors">
              Mission Planner
            </Link>
            <Link href="/how-it-works" className="hover:text-primary transition-colors">
              Grading Rules
            </Link>
            <Link href="/settings" className="hover:text-primary transition-colors">
              Settings &amp; Backup
            </Link>
          </div>
        </div>

        <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted">
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>100% Client-Side. No telemetry, tracking, or cloud database storage.</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            <span>Deterministic DP Optimizer · NMIMS Official Scale</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

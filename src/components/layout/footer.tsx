import React from "react";
import Link from "next/link";
import { GraduationCap, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-[var(--border-color)] bg-[var(--bg-card)] mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <GraduationCap className="w-4 h-4 text-[var(--primary)]" />
            <span className="font-semibold text-[var(--text-primary)]">GPA Calculator</span>
            <span>—</span>
            <span>NMIMS Academic Productivity Suite (Phase 1)</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-[var(--text-secondary)]">
            <Link href="/how-it-works" className="hover:text-[var(--text-primary)] transition-colors">
              Grading Rules
            </Link>
            <Link href="/planner" className="hover:text-[var(--text-primary)] transition-colors">
              Target Optimizer
            </Link>
            <Link href="/settings" className="hover:text-[var(--text-primary)] transition-colors">
              Data & Privacy
            </Link>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[var(--text-muted)]">
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--success)]" />
            <span>All calculations run locally in your browser. No personal data is stored externally.</span>
          </p>
          <p>
            <strong>Disclaimer:</strong> Independent student tool. Not an official product of SVKM&apos;s NMIMS.
          </p>
        </div>
      </div>
    </footer>
  );
}

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
  Menu,
  X,
  Undo2,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAcademic } from "@/context/academic-context";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calculator", label: "GPA Calculator", icon: Calculator },
  { href: "/planner", label: "Target Planner", icon: Target },
  { href: "/how-it-works", label: "How It Works", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { canUndo, undoLastPlan, lastPlanDescription } = useAcademic();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-color)] bg-[var(--bg-card)]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--primary)] text-white shadow-xs group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-[var(--text-primary)] tracking-tight">
                  GPA Calculator
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-[var(--primary-subtle)] text-[var(--primary)] rounded-md border border-[var(--primary)]/20">
                  NMIMS
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-none">
                Academic Planner
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[var(--primary-subtle)] text-[var(--primary)] shadow-2xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            {canUndo && (
              <Button
                variant="outline"
                size="sm"
                onClick={undoLastPlan}
                title={lastPlanDescription || "Undo target plan"}
                className="hidden sm:inline-flex text-xs text-[var(--text-secondary)]"
              >
                <Undo2 className="w-3.5 h-3.5 mr-1" />
                Undo Plan
              </Button>
            )}

            <ThemeToggle />

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border-color)] bg-[var(--bg-card)] px-4 pt-2 pb-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[var(--primary-subtle)] text-[var(--primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          {canUndo && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  undoLastPlan();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-xs justify-center"
              >
                <Undo2 className="w-3.5 h-3.5 mr-1" />
                Undo Last Target Plan
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

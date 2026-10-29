"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Search,
  LayoutDashboard,
  Calculator,
  Target,
  BookOpen,
  Settings,
  Sun,
  Moon,
  Sparkles,
  Download,
  RotateCcw,
  X,
  ChevronRight,
} from "lucide-react";
import { useAcademic } from "@/context/academic-context";
import { generateExportJson } from "@/lib/storage";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { loadPreset, getCurrentState, resetAll } = useAcademic();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Global keydown listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setQuery("");
        setSelectedIndex(0);
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setQuery("");
      setSelectedIndex(0);
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("nmims-open-command-palette", handleCustomOpen);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("nmims-open-command-palette", handleCustomOpen);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const actions = [
    {
      id: "nav-dashboard",
      title: "Go to Dashboard",
      category: "Navigation",
      icon: LayoutDashboard,
      perform: () => router.push("/"),
    },
    {
      id: "nav-calculator",
      title: "Open Live GPA Calculator",
      category: "Navigation",
      icon: Calculator,
      perform: () => router.push("/calculator"),
    },
    {
      id: "nav-planner",
      title: "Open Mission Target Planner",
      category: "Navigation",
      icon: Target,
      perform: () => router.push("/planner"),
    },
    {
      id: "nav-rules",
      title: "View NMIMS Grading Scale & Rules",
      category: "Navigation",
      icon: BookOpen,
      perform: () => router.push("/how-it-works"),
    },
    {
      id: "nav-settings",
      title: "Open Settings & Backups",
      category: "Navigation",
      icon: Settings,
      perform: () => router.push("/settings"),
    },
    {
      id: "theme-toggle",
      title: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
      category: "Appearance",
      icon: theme === "dark" ? Sun : Moon,
      perform: () => setTheme(theme === "dark" ? "light" : "dark"),
    },
    {
      id: "preset-btech-cs",
      title: "Load Sample Curriculum: B.Tech CS Sem 3",
      category: "Curriculum",
      icon: Sparkles,
      perform: () => {
        loadPreset("btech-cs-sem3");
        window.dispatchEvent(
          new CustomEvent("nmims-toast", {
            detail: {
              title: "Preset Loaded",
              message: "Loaded official B.Tech CS Sem 3 syllabus courses",
              type: "success",
            },
          })
        );
      },
    },
    {
      id: "export-json",
      title: "Export JSON State Backup",
      category: "Data",
      icon: Download,
      perform: () => {
        const state = getCurrentState();
        const json = generateExportJson(state);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `nmims_gpa_backup_${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        window.dispatchEvent(
          new CustomEvent("nmims-toast", {
            detail: {
              title: "Backup Downloaded",
              message: "Saved your personal academic state to file",
              type: "success",
            },
          })
        );
      },
    },
    {
      id: "reset-data",
      title: "Reset All Subjects & Preferences",
      category: "Danger Zone",
      icon: RotateCcw,
      perform: () => {
        resetAll();
        window.dispatchEvent(
          new CustomEvent("nmims-toast", {
            detail: {
              title: "App Reset",
              message: "Wiped all local subjects and preferences",
              type: "warning",
            },
          })
        );
      },
    },
  ];

  const filtered = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (action: (typeof actions)[0]) => {
    action.perform();
    setIsOpen(false);
  };

  const handleKeyDownInList = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-24 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Palette Panel */}
      <div className="relative z-10 w-full max-w-lg glass-panel rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-border-subtle flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-subtle shrink-0">
          <Search className="w-4 h-4 text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownInList}
            placeholder="Search commands, routes, actions... (↑↓ to select)"
            className="w-full bg-transparent text-sm text-primary placeholder:text-muted focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted hover:text-primary p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[10px] font-mono text-muted bg-surface-elevated px-1.5 py-0.5 rounded border border-border-subtle shrink-0">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto no-scrollbar p-2 divide-y divide-border-subtle/50">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">
              No matching commands found.
            </div>
          ) : (
            filtered.map((action, idx) => {
              const Icon = action.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleSelect(action)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600/10 dark:bg-cyan-500/15 text-primary border border-cyan-500/30"
                      : "text-secondary hover:text-primary hover:bg-surface-elevated/60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-indigo-600 dark:bg-cyan-500 text-white dark:text-black shadow-xs"
                          : "bg-surface-elevated text-muted"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-primary truncate">
                        {action.title}
                      </div>
                      <div className="text-[10px] text-muted">{action.category}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted shrink-0" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-border-subtle bg-surface-elevated/40 text-[10px] text-muted flex items-center justify-between shrink-0">
          <span>Navigate with ↑ and ↓</span>
          <span>Press Enter to select</span>
        </div>
      </div>
    </div>
  );
}

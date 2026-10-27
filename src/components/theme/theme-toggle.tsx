"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Laptop } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-20 h-9 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] opacity-50" />
    );
  }

  return (
    <div className="flex items-center p-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs">
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-label="Switch to light theme"
        className={`p-1.5 rounded-md text-xs font-medium transition-all ${
          theme === "light"
            ? "bg-[var(--primary)] text-white shadow-xs"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => setTheme("system")}
        aria-label="Use system theme"
        className={`p-1.5 rounded-md text-xs font-medium transition-all ${
          theme === "system"
            ? "bg-[var(--primary)] text-white shadow-xs"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
      >
        <Laptop className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-label="Switch to dark theme"
        className={`p-1.5 rounded-md text-xs font-medium transition-all ${
          theme === "dark"
            ? "bg-[var(--primary)] text-white shadow-xs"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

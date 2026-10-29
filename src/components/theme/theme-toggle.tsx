"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    // View Transitions API circular reveal animation if supported
    if (
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      // View Transitions API
      const transition = (document as unknown as { startViewTransition: (cb: () => void) => { ready: Promise<void> } }).startViewTransition(() => {
        setTheme(nextTheme);
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 400,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      });
    } else {
      setTheme(nextTheme);
    }
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl border border-border-subtle bg-surface-elevated/50 opacity-40" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-border-subtle bg-surface/70 hover:bg-surface-elevated hover:border-border-hover transition-all text-secondary hover:text-primary active:scale-95 cursor-pointer shadow-xs"
    >
      <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-cyan-400" />
    </button>
  );
}

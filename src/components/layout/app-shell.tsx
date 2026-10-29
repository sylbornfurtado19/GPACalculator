"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AcademicProvider } from "@/context/academic-context";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = !pathname || pathname === "/" || pathname === "";

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AcademicProvider>
        <div className="min-h-screen flex flex-col bg-canvas text-primary relative selection:bg-cyan-500/20 selection:text-cyan-400">
          {/* Ambient Mesh Glow Backdrop */}
          <div className="mesh-ambient-bg" aria-hidden="true" />

          {isHome ? (
            children
          ) : (
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 mb-16 md:mb-0">
                {children}
              </main>
              <Footer />
            </div>
          )}
        </div>
      </AcademicProvider>
    </ThemeProvider>
  );
}

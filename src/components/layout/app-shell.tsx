"use client";

import React from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AcademicProvider } from "@/context/academic-context";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AcademicProvider>
        <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-200">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
        </div>
      </AcademicProvider>
    </ThemeProvider>
  );
}

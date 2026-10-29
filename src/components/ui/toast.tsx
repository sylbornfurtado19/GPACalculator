"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type?: "success" | "warning" | "error" | "info";
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{
        title: string;
        message?: string;
        type?: "success" | "warning" | "error" | "info";
      }>;
      if (!customEvent.detail) return;

      const newToast: ToastMessage = {
        id: `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: customEvent.detail.title,
        message: customEvent.detail.message,
        type: customEvent.detail.type || "success",
      };

      setToasts((prev) => [...prev.slice(-3), newToast]);

      // Auto dismiss after 3.8s
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 3800);
    };

    window.addEventListener("nmims-toast", handleToastEvent);
    return () => window.removeEventListener("nmims-toast", handleToastEvent);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-16 sm:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.type === "success"
            ? CheckCircle2
            : toast.type === "warning" || toast.type === "error"
            ? AlertTriangle
            : Info;

        const borderStyle =
          toast.type === "success"
            ? "border-emerald-500/40 bg-surface/95 text-emerald-500 shadow-emerald-500/10"
            : toast.type === "error"
            ? "border-rose-500/40 bg-surface/95 text-rose-500 shadow-rose-500/10"
            : "border-cyan-500/40 bg-surface/95 text-cyan-500 shadow-cyan-500/10";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl border shadow-xl glass-panel flex items-start gap-3 animate-in slide-in-from-bottom-3 duration-200 ${borderStyle}`}
          >
            <Icon className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 space-y-0.5">
              <h5 className="font-display text-xs font-bold text-primary tracking-tight">
                {toast.title}
              </h5>
              {toast.message && (
                <p className="text-[11px] text-secondary leading-tight">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-muted hover:text-primary p-0.5 rounded cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}


import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGpa(value: number): string {
  if (isNaN(value) || !isFinite(value)) return "0.00";
  return value.toFixed(2);
}

export function formatPercent(value: number): string {
  if (isNaN(value) || !isFinite(value)) return "0%";
  return `${value.toFixed(1)}%`;
}

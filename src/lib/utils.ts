import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea una fecha en español, ej. "hace 3 días". */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const ranges: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [3600, "minute"],
    [86400, "hour"],
    [86400 * 30, "day"],
    [86400 * 365, "month"],
    [Infinity, "year"],
  ];
  const divisors = [1, 60, 3600, 86400, 86400 * 30, 86400 * 365];
  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
  for (let i = 0; i < ranges.length; i++) {
    if (seconds < ranges[i][0]) {
      const value = -Math.floor(seconds / divisors[i]);
      return rtf.format(value, ranges[i][1]);
    }
  }
  return "";
}

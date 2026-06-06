import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Devuelve el estado de alerta de fecha límite de una tarea. */
export function dueDateAlert(
  dueDate: Date | null | undefined,
  dueBucket: string,
): { label: string; cls: string } | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (dueBucket === "TODAY") {
    return { label: "Vence hoy", cls: "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:ring-orange-800" };
  }

  if (dueDate) {
    const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    if (due < today) {
      return { label: "Vencida", cls: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800" };
    }
    if (due.getTime() === today.getTime()) {
      return { label: "Vence hoy", cls: "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:ring-orange-800" };
    }
    const diff = Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
    if (diff <= 3) {
      return { label: `Vence en ${diff}d`, cls: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-800" };
    }
  }

  return null;
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

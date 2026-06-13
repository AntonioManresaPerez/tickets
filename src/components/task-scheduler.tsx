"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function endOfWeek(): Date {
  const d = new Date();
  const day = d.getDay(); // 0 = domingo
  const diff = day === 0 ? 0 : 7 - day; // hasta el próximo domingo
  d.setDate(d.getDate() + diff);
  return d;
}

export function TaskScheduler({
  taskId,
  dueDate,
  dueBucket,
}: {
  taskId: number;
  dueDate: string | null;
  dueBucket: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const current = dueDate ? new Date(dueDate) : null;
  const todayISO = toISODate(new Date());
  const isToday = current && toISODate(current) === todayISO;

  async function save(patch: { dueBucket: string; dueDate: string | null }) {
    setSaving(true);
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSaving(false);
    if (res.ok) router.refresh();
  }

  const planned = current ? (
    <p className="text-sm">
      <span className="text-slate-400 dark:text-slate-500">Planificada para </span>
      <span className="font-semibold text-blue-600 dark:text-blue-400">
        {isToday ? "hoy" : format(current, "EEEE d MMM", { locale: es })}
      </span>
    </p>
  ) : (
    <p className="text-sm text-slate-400 dark:text-slate-500">Sin planificar</p>
  );

  const btn =
    "rounded-lg border px-3 py-2 text-sm font-medium transition disabled:opacity-60";

  return (
    <div className="space-y-3">
      {planned}

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => save({ dueBucket: "TODAY", dueDate: todayISO })}
            className={cn(
              btn,
              isToday
                ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600",
            )}
          >
            Hoy
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save({ dueBucket: "WEEK", dueDate: toISODate(endOfWeek()) })}
            className={cn(
              btn,
              dueBucket === "WEEK" && !isToday
                ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600",
            )}
          >
            Esta semana
          </button>
        </div>

        <label className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
          <CalendarClock className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="date"
            value={current ? toISODate(current) : ""}
            disabled={saving}
            onChange={(e) =>
              save({ dueBucket: "NONE", dueDate: e.target.value || null })
            }
            className="w-full bg-transparent outline-none dark:[color-scheme:dark]"
          />
        </label>

        {current && (
          <button
            type="button"
            disabled={saving}
            onClick={() => save({ dueBucket: "NONE", dueDate: null })}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <X className="h-3.5 w-3.5" />
            Quitar planificación
          </button>
        )}
      </div>
    </div>
  );
}

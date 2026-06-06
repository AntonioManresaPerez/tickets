"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { STATUS, STATUS_ORDER, type StatusKey } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StatusWorkflow({
  taskId,
  current,
}: {
  taskId: number;
  current: StatusKey;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<StatusKey>(current);
  const [saving, setSaving] = useState(false);

  const idx = STATUS_ORDER.indexOf(status);
  const next = STATUS_ORDER[idx + 1];
  const prev = STATUS_ORDER[idx - 1];

  async function move(to: StatusKey) {
    const before = status;
    setStatus(to);
    setSaving(true);
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: to }),
    });
    setSaving(false);
    if (res.ok) router.refresh();
    else setStatus(before);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_ORDER.map((s, i) => {
          const reached = i <= idx;
          return (
            <span
              key={s}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition",
                reached ? STATUS[s].badge : "bg-slate-50 text-slate-400 ring-slate-200 dark:bg-slate-700 dark:text-slate-500 dark:ring-slate-600",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  reached ? STATUS[s].dot : "bg-slate-300 dark:bg-slate-600",
                )}
              />
              {STATUS[s].label}
            </span>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {next ? (
          <button
            onClick={() => move(next)}
            disabled={saving}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60",
              STATUS[next].solid,
            )}
          >
            Pasar a {STATUS[next].label}
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800">
            <Check className="h-4 w-4" />
            Finalizada
          </span>
        )}
        {prev && (
          <button
            onClick={() => move(prev)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a {STATUS[prev].label}
          </button>
        )}
      </div>
    </div>
  );
}

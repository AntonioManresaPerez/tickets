"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, ArrowLeft, Check, Pause, Play } from "lucide-react";
import { STATUS, STATUS_ORDER, type StatusKey } from "@/lib/constants";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function StatusWorkflow({
  taskId,
  current,
  prevStatus,
}: {
  taskId: number;
  current: StatusKey;
  prevStatus?: StatusKey | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<StatusKey>(current);
  const [saving, setSaving] = useState(false);
  // Al continuar una tarea parada, volvemos a donde estaba (o a "En progreso").
  const resumeTo: StatusKey = prevStatus && prevStatus !== "PAUSED" ? prevStatus : "IN_PROGRESS";

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
    if (res.ok) {
      toast({ type: "success", message: `Estado: ${STATUS[to].label}` });
      router.refresh();
    } else {
      setStatus(before);
      toast({ type: "error", message: "No se pudo cambiar el estado" });
    }
  }

  const paused = status === "PAUSED";
  const idx = STATUS_ORDER.indexOf(status);
  const next = STATUS_ORDER[idx + 1];
  const prev = STATUS_ORDER[idx - 1];

  return (
    <div className="space-y-4">
      {/* Barra de progreso lineal */}
      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_ORDER.map((s, i) => {
          const reached = !paused && i <= idx;
          return (
            <span
              key={s}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition",
                reached ? STATUS[s].badge : "bg-slate-50 text-slate-400 ring-slate-200 dark:bg-slate-700 dark:text-slate-500 dark:ring-slate-600",
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", reached ? STATUS[s].dot : "bg-slate-300 dark:bg-slate-600")} />
              {STATUS[s].label}
            </span>
          );
        })}
        {paused && (
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", STATUS.PAUSED.badge)}>
            <Pause className="h-3 w-3" />
            Parada
          </span>
        )}
      </div>

      {/* Acciones */}
      {paused ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => move(resumeTo)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
          >
            <Play className="h-4 w-4" />
            Continuar{resumeTo !== "IN_PROGRESS" ? ` (${STATUS[resumeTo].label})` : ""}
          </button>
          <p className="text-sm text-slate-400 dark:text-slate-500">La tarea está parada.</p>
        </div>
      ) : (
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
          {/* Pausar disponible mientras está activa (no en Pendiente ni Finalizada) */}
          {status !== "PENDING" && status !== "DONE" && (
            <button
              onClick={() => move("PAUSED")}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100 disabled:opacity-60 dark:border-rose-900 dark:bg-rose-900/20 dark:text-rose-400"
            >
              <Pause className="h-4 w-4" />
              Parar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Trash2 } from "lucide-react";
import { StatusBadge, PriorityBadge, LabelTag } from "@/components/badges";
import { Avatar } from "@/components/avatar";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { timeAgo, dueDateAlert, cn } from "@/lib/utils";
import {
  STATUS,
  STATUS_ORDER,
  PRIORITY,
  PRIORITY_ORDER,
  type StatusKey,
  type PriorityKey,
} from "@/lib/constants";

export type TaskRow = {
  id: number;
  title: string;
  description: string | null;
  status: StatusKey;
  priority: PriorityKey;
  labels: string[];
  assigneeName: string | null;
  dueDate: string | null;
  dueBucket: string;
  createdAt: string;
};

type Opt = { id: string; name: string };

export function TaskList({
  tasks,
  users,
  sprints,
}: {
  tasks: TaskRow[];
  users: Opt[];
  sprints: Opt[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function clear() {
    setSelected(new Set());
  }
  const allSelected = tasks.length > 0 && selected.size === tasks.length;
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(tasks.map((t) => t.id)));
  }

  async function bulk(action: string, value: string | null) {
    if (selected.size === 0) return;
    if (action === "delete") {
      const ok = await confirm({
        title: "Eliminar tareas",
        message: `Se eliminarán ${selected.size} tarea(s). No se puede deshacer.`,
      });
      if (!ok) return;
    }
    setBusy(true);
    const res = await fetch("/api/tasks/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected], action, value }),
    });
    setBusy(false);
    if (res.ok) {
      const d = await res.json().catch(() => ({}));
      toast({ type: "success", message: `${d.count ?? selected.size} tarea(s) actualizada(s)` });
      clear();
      router.refresh();
    } else {
      toast({ type: "error", message: "No se pudo aplicar el cambio" });
    }
  }

  const selectClass =
    "rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200";

  return (
    <>
      {/* Mobile: cards */}
      <div className="space-y-3 lg:hidden">
        {tasks.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-400 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            No se encontraron tareas con esos filtros.
          </p>
        ) : (
          tasks.map((t) => {
            const alert = t.status !== "DONE" ? dueDateAlert(t.dueDate ? new Date(t.dueDate) : null, t.dueBucket) : null;
            const sel = selected.has(t.id);
            return (
              <div
                key={t.id}
                className={cn(
                  "flex gap-3 rounded-2xl border bg-white p-4 shadow-sm transition dark:bg-slate-800",
                  sel ? "border-blue-400 dark:border-blue-600" : "border-slate-200 dark:border-slate-700",
                )}
              >
                <input
                  type="checkbox"
                  checked={sel}
                  onChange={() => toggle(t.id)}
                  aria-label="Seleccionar tarea"
                  className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 dark:border-slate-600"
                />
                <Link href={`/tasks/${t.id}`} className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-slate-100">{t.title}</span>
                      {alert && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${alert.cls}`}>
                          {alert.label}
                        </span>
                      )}
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={t.priority} />
                      <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        {t.assigneeName && <Avatar name={t.assigneeName} size="xs" />}
                        {t.assigneeName ?? "Sin asignar"}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">#{t.id} · {timeAgo(t.createdAt)}</span>
                  </div>
                </Link>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:block">
        <div className="grid grid-cols-[2.5rem_3.5rem_1fr_11rem_8rem_11rem_7rem] items-center gap-3 border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-700">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            aria-label="Seleccionar todas"
            className="h-4 w-4 rounded border-slate-300 text-blue-600 dark:border-slate-600"
          />
          <span>#</span>
          <span>Título</span>
          <span>Estado</span>
          <span>Prioridad</span>
          <span>Asignado a</span>
          <span className="text-right">Creada</span>
        </div>

        {tasks.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-slate-400">No se encontraron tareas con esos filtros.</p>
        ) : (
          tasks.map((t) => {
            const alert = t.status !== "DONE" ? dueDateAlert(t.dueDate ? new Date(t.dueDate) : null, t.dueBucket) : null;
            const sel = selected.has(t.id);
            return (
              <div
                key={t.id}
                className={cn(
                  "grid grid-cols-[2.5rem_3.5rem_1fr_11rem_8rem_11rem_7rem] items-center gap-3 border-b border-slate-50 px-5 py-3.5 text-sm transition last:border-0 dark:border-slate-700/50",
                  sel ? "bg-blue-50/60 dark:bg-blue-900/20" : "hover:bg-slate-50 dark:hover:bg-slate-700/50",
                )}
              >
                <input
                  type="checkbox"
                  checked={sel}
                  onChange={() => toggle(t.id)}
                  aria-label="Seleccionar tarea"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 dark:border-slate-600"
                />
                <Link href={`/tasks/${t.id}`} className="contents">
                  <span className="text-slate-400">{t.id}</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium text-slate-900 dark:text-slate-100">{t.title}</span>
                      {alert && (
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${alert.cls}`}>
                          {alert.label}
                        </span>
                      )}
                      {t.labels.map((l) => <LabelTag key={l}>{l}</LabelTag>)}
                    </div>
                    {t.description && <p className="mt-0.5 truncate text-xs text-slate-400">{t.description}</p>}
                  </div>
                  <span><StatusBadge status={t.status} /></span>
                  <span><PriorityBadge priority={t.priority} /></span>
                  <span className="flex items-center gap-1.5 truncate text-slate-600 dark:text-slate-300">
                    {t.assigneeName && <Avatar name={t.assigneeName} size="xs" />}
                    {t.assigneeName ?? "Sin asignar"}
                  </span>
                  <span className="text-right text-xs text-slate-400">{timeAgo(t.createdAt)}</span>
                </Link>
              </div>
            );
          })
        )}
      </div>

      {/* Barra de acciones en lote */}
      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-20 z-40 flex justify-center px-4 lg:bottom-6">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <span className="px-1 text-sm font-medium text-slate-700 dark:text-slate-200">
              {selected.size} sel.
            </span>
            <select disabled={busy} defaultValue="" onChange={(e) => e.target.value && bulk("status", e.target.value)} className={selectClass}>
              <option value="" disabled>Estado…</option>
              {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
            </select>
            <select disabled={busy} defaultValue="" onChange={(e) => e.target.value && bulk("priority", e.target.value)} className={selectClass}>
              <option value="" disabled>Prioridad…</option>
              {PRIORITY_ORDER.map((p) => <option key={p} value={p}>{PRIORITY[p].label}</option>)}
            </select>
            <select disabled={busy} defaultValue="" onChange={(e) => bulk("assignee", e.target.value || null)} className={selectClass}>
              <option value="" disabled>Asignar…</option>
              <option value="">Sin asignar</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            {sprints.length > 0 && (
              <select disabled={busy} defaultValue="" onChange={(e) => bulk("sprint", e.target.value || null)} className={selectClass}>
                <option value="" disabled>Sprint…</option>
                <option value="">Sin sprint</option>
                {sprints.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            )}
            <button
              disabled={busy}
              onClick={() => bulk("delete", null)}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <button onClick={clear} aria-label="Cancelar selección" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

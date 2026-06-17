"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, CheckCircle2, Circle, ChevronDown } from "lucide-react";
import { STATUS, PRIORITY, PRIORITY_ORDER, type StatusKey } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Sub = { id: number; title: string; status: StatusKey };
type User = { id: string; name: string };

const defaultForm = { title: "", priority: "MEDIUM", assigneeId: "" };

export function Subtasks({
  parentId,
  subtasks,
  users = [],
}: {
  parentId: number;
  subtasks: Sub[];
  users?: User[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);

  const done = subtasks.filter((s) => s.status === "DONE").length;

  async function add() {
    if (!form.title.trim()) return;
    setBusy(true);
    const body: Record<string, unknown> = {
      title: form.title.trim(),
      parentId,
      priority: form.priority,
    };
    if (form.assigneeId) body.assigneeId = form.assigneeId;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) {
      setForm(defaultForm);
      setAdding(false);
      setExpanded(false);
      router.refresh();
    }
  }

  async function toggle(sub: Sub) {
    const next: StatusKey = sub.status === "DONE" ? "PENDING" : "DONE";
    await fetch(`/api/tasks/${sub.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
  }

  const inputCls =
    "flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100";
  const selectCls =
    "rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200";

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Subtareas
          {subtasks.length > 0 && (
            <span className="ml-2 font-normal text-slate-400">
              {done}/{subtasks.length}
            </span>
          )}
        </h2>
        <button
          onClick={() => { setAdding((v) => !v); setExpanded(false); setForm(defaultForm); }}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Añadir
        </button>
      </div>

      {subtasks.length === 0 && !adding && (
        <p className="text-sm text-slate-400 dark:text-slate-500">Sin subtareas.</p>
      )}

      <ul className="space-y-1">
        {subtasks.map((s) => (
          <li key={s.id} className="flex items-center gap-2">
            <button
              onClick={() => toggle(s)}
              className="shrink-0 text-slate-300 transition hover:text-emerald-500 dark:text-slate-500"
              aria-label={s.status === "DONE" ? "Marcar pendiente" : "Marcar hecha"}
            >
              {s.status === "DONE" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </button>
            <Link
              href={`/tasks/${s.id}`}
              className={cn(
                "flex-1 truncate text-sm hover:underline",
                s.status === "DONE"
                  ? "text-slate-400 line-through dark:text-slate-500"
                  : "text-slate-700 dark:text-slate-300",
              )}
            >
              {s.title}
            </Link>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${STATUS[s.status].badge}`}>
              {STATUS[s.status].label}
            </span>
          </li>
        ))}
      </ul>

      {adding && (
        <div className="mt-3 space-y-2">
          {/* Título siempre visible */}
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !expanded) add();
                if (e.key === "Escape") { setAdding(false); setExpanded(false); }
              }}
              placeholder="Título de la subtarea…"
              className={inputCls}
            />
            {/* Expandir opciones extra */}
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              title="Más opciones"
              className={cn(
                "shrink-0 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
                expanded
                  ? "border-blue-300 bg-blue-50 text-blue-600 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "border-slate-300 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400",
              )}
            >
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
            </button>
            <button
              onClick={add}
              disabled={busy || !form.title.trim()}
              className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              Crear
            </button>
          </div>

          {/* Opciones extra (prioridad + responsable) */}
          {expanded && (
            <div className="flex flex-wrap gap-2 pl-0">
              <select
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                className={selectCls}
              >
                {PRIORITY_ORDER.map((p) => (
                  <option key={p} value={p}>{PRIORITY[p].label}</option>
                ))}
              </select>
              {users.length > 0 && (
                <select
                  value={form.assigneeId}
                  onChange={(e) => setForm((f) => ({ ...f, assigneeId: e.target.value }))}
                  className={selectCls}
                >
                  <option value="">Responsable (hereda del padre)</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

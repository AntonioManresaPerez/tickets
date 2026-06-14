"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, CheckCircle2, Circle } from "lucide-react";
import { STATUS, type StatusKey } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Sub = { id: number; title: string; status: StatusKey };

export function Subtasks({ parentId, subtasks }: { parentId: number; subtasks: Sub[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);

  const done = subtasks.filter((s) => s.status === "DONE").length;

  async function add() {
    if (!title.trim()) return;
    setBusy(true);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), parentId }),
    });
    setBusy(false);
    if (res.ok) {
      setTitle("");
      setAdding(false);
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
          onClick={() => setAdding((v) => !v)}
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
        <div className="mt-3 flex items-center gap-2">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
              if (e.key === "Escape") setAdding(false);
            }}
            placeholder="Título de la subtarea…"
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          />
          <button
            onClick={add}
            disabled={busy || !title.trim()}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            Crear
          </button>
        </div>
      )}
    </section>
  );
}

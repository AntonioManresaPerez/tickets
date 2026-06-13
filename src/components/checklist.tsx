"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, CheckSquare, Square } from "lucide-react";

type Item = { id: string; text: string; done: boolean };

export function Checklist({ taskId, items }: { taskId: number; items: Item[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const done = items.filter((i) => i.done).length;

  async function addItem() {
    if (!newText.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/tasks/${taskId}/checklist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText.trim() }),
    });
    setSaving(false);
    if (res.ok) {
      setNewText("");
      setAdding(false);
      router.refresh();
    }
  }

  async function toggle(id: string, done: boolean) {
    await fetch(`/api/checklist/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !done }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/checklist/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Checklist
          {items.length > 0 && (
            <span className="ml-2 font-normal text-slate-400">
              {done}/{items.length}
            </span>
          )}
        </h2>
        <button
          onClick={() => {
            setAdding(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Añadir
        </button>
      </div>

      {items.length > 0 && (
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-300"
            style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }}
          />
        </div>
      )}

      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id} className="group flex items-center gap-2">
            <button
              onClick={() => toggle(item.id, item.done)}
              className="shrink-0 text-slate-400 transition hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400"
            >
              {item.done ? (
                <CheckSquare className="h-4 w-4 text-green-500" />
              ) : (
                <Square className="h-4 w-4" />
              )}
            </button>
            <span
              className={`flex-1 text-sm ${
                item.done
                  ? "text-slate-400 line-through dark:text-slate-500"
                  : "text-slate-700 dark:text-slate-300"
              }`}
            >
              {item.text}
            </span>
            <button
              onClick={() => remove(item.id)}
              className="shrink-0 text-slate-300 opacity-0 transition hover:text-red-500 group-hover:opacity-100 dark:text-slate-600 dark:hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>

      {adding && (
        <div className="mt-3 flex items-center gap-2">
          <input
            ref={inputRef}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addItem();
              if (e.key === "Escape") { setAdding(false); setNewText(""); }
            }}
            placeholder="Nueva tarea…"
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:ring-blue-900/30"
          />
          <button
            onClick={addItem}
            disabled={saving || !newText.trim()}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "…" : "Añadir"}
          </button>
          <button
            onClick={() => { setAdding(false); setNewText(""); }}
            className="rounded-lg px-2 py-1.5 text-xs text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            Cancelar
          </button>
        </div>
      )}

      {items.length === 0 && !adding && (
        <p className="text-sm text-slate-400 dark:text-slate-500">Sin elementos. Añade el primero.</p>
      )}
    </section>
  );
}

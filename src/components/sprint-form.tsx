"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-blue-900/30";
const labelClass = "mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400";

export function SprintForm() {
  const router = useRouter();
  const [v, setV] = useState({ name: "", goal: "", startDate: "", endDate: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/sprints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: v.name,
        goal: v.goal || null,
        startDate: v.startDate || null,
        endDate: v.endDate || null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setV({ name: "", goal: "", startDate: "", endDate: "" });
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "No se pudo crear el sprint");
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Nuevo sprint</h2>
      <div>
        <label className={labelClass}>Nombre</label>
        <input
          required
          value={v.name}
          onChange={(e) => setV({ ...v, name: e.target.value })}
          placeholder="Ej: Sprint 12 — Mejoras CRM"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Objetivo (opcional)</label>
        <textarea
          value={v.goal}
          onChange={(e) => setV({ ...v, goal: e.target.value })}
          rows={2}
          placeholder="Qué se quiere conseguir en este sprint"
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Inicio</label>
          <input
            type="date"
            value={v.startDate}
            onChange={(e) => setV({ ...v, startDate: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Fin</label>
          <input
            type="date"
            value={v.endDate}
            onChange={(e) => setV({ ...v, endDate: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
      >
        <Plus className="h-4 w-4" />
        {saving ? "Creando…" : "Crear sprint"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Link2 } from "lucide-react";
import { IDEA_CATEGORIES } from "@/lib/constants";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-blue-900/30";
const labelClass = "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300";

type IdeaFormValues = {
  id?: string;
  title: string;
  body: string;
  category: string;
  links: string[];
};

const empty: IdeaFormValues = {
  title: "",
  body: "",
  category: "",
  links: [],
};

export function IdeaForm({
  mode,
  idea,
}: {
  mode: "create" | "edit";
  idea?: IdeaFormValues;
}) {
  const router = useRouter();
  const [v, setV] = useState<IdeaFormValues>(idea ?? empty);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function setField<K extends keyof IdeaFormValues>(key: K, value: IdeaFormValues[K]) {
    setV((prev) => ({ ...prev, [key]: value }));
  }

  function addLink() {
    setV((prev) => ({ ...prev, links: [...prev.links, ""] }));
  }

  function updateLink(i: number, val: string) {
    setV((prev) => {
      const links = [...prev.links];
      links[i] = val;
      return { ...prev, links };
    });
  }

  function removeLink(i: number) {
    setV((prev) => ({ ...prev, links: prev.links.filter((_, j) => j !== i) }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title: v.title,
      body: v.body || null,
      category: v.category || null,
      links: v.links.map((l) => l.trim()).filter(Boolean),
    };

    const res = await fetch(
      mode === "create" ? "/api/ideas" : `/api/ideas/${idea!.id}`,
      {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const id = mode === "create" ? data.id : idea!.id;
      router.push(`/ideas/${id}`);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo guardar");
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div>
        <label className={labelClass}>Título *</label>
        <input
          required
          autoFocus
          value={v.title}
          onChange={(e) => setField("title", e.target.value)}
          className={inputClass}
          placeholder="Describe la idea brevemente"
        />
      </div>

      <div>
        <label className={labelClass}>Descripción</label>
        <textarea
          value={v.body}
          onChange={(e) => setField("body", e.target.value)}
          rows={5}
          className={inputClass}
          placeholder="Explica la idea, el problema que resuelve, cómo funcionaría…"
        />
      </div>

      <div>
        <label className={labelClass}>Categoría</label>
        <select
          value={v.category}
          onChange={(e) => setField("category", e.target.value)}
          className={inputClass}
        >
          <option value="">Sin categoría</option>
          {Object.entries(IDEA_CATEGORIES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Referencias y enlaces</label>
        <div className="space-y-2">
          {v.links.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <Link2 className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                type="text"
                value={link}
                onChange={(e) => updateLink(i, e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:border-slate-600 dark:hover:bg-red-900/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addLink}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
          >
            <Plus className="h-3.5 w-3.5" />
            Añadir enlace
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Guardando…" : mode === "create" ? "Crear idea" : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

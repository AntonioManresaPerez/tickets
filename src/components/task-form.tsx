"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check } from "lucide-react";
import {
  PRIORITY,
  PRIORITY_ORDER,
  DUE_BUCKET,
  DUE_BUCKET_ORDER,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

type UserOpt = { id: string; name: string };

export type TaskFormValues = {
  id?: number;
  title: string;
  description: string;
  priority: string;
  assigneeId: string;
  hours: number;
  dueBucket: string;
  labels: string[];
};

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

const empty: TaskFormValues = {
  title: "",
  description: "",
  priority: "MEDIUM",
  assigneeId: "",
  hours: 0,
  dueBucket: "NONE",
  labels: [],
};

export function TaskForm({
  mode,
  users,
  availableLabels,
  canManageLabels,
  task,
}: {
  mode: "create" | "edit";
  users: UserOpt[];
  availableLabels: string[];
  canManageLabels: boolean;
  task?: TaskFormValues;
}) {
  const router = useRouter();
  const [v, setV] = useState<TaskFormValues>(task ?? empty);
  const [labels, setLabels] = useState<string[]>(availableLabels);
  const [newLabel, setNewLabel] = useState("");
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) {
    setV((prev) => ({ ...prev, [key]: value }));
  }

  function toggleLabel(name: string) {
    setV((prev) => ({
      ...prev,
      labels: prev.labels.includes(name)
        ? prev.labels.filter((l) => l !== name)
        : [...prev.labels, name],
    }));
  }

  function selectLabel(name: string) {
    setV((prev) =>
      prev.labels.includes(name) ? prev : { ...prev, labels: [...prev.labels, name] },
    );
  }

  async function addLabel() {
    const name = newLabel.trim().toLowerCase();
    if (!name) return;
    const res = await fetch("/api/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const label = await res.json();
      setLabels((prev) =>
        prev.includes(label.name) ? prev : [...prev, label.name].sort(),
      );
      selectLabel(label.name);
      setNewLabel("");
      setShowLabelModal(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title: v.title,
      description: v.description || null,
      priority: v.priority,
      assigneeId: v.assigneeId || null,
      hours: Number(v.hours) || 0,
      dueBucket: v.dueBucket,
      labels: v.labels,
    };

    const res = await fetch(
      mode === "create" ? "/api/tasks" : `/api/tasks/${task!.id}`,
      {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const id = mode === "create" ? data.id : task!.id;
      router.push(`/tasks/${id}`);
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
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label className={labelClass}>Título</label>
        <input
          required
          autoFocus
          value={v.title}
          onChange={(e) => set("title", e.target.value)}
          className={inputClass}
          placeholder="Describe la tarea brevemente"
        />
      </div>

      <div>
        <label className={labelClass}>Descripción</label>
        <textarea
          value={v.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          className={inputClass}
          placeholder="Detalles, contexto, pasos para reproducir…"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Prioridad</label>
          <select
            value={v.priority}
            onChange={(e) => set("priority", e.target.value)}
            className={inputClass}
          >
            {PRIORITY_ORDER.map((p) => (
              <option key={p} value={p}>
                {PRIORITY[p].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Asignado a</label>
          <select
            value={v.assigneeId}
            onChange={(e) => set("assigneeId", e.target.value)}
            className={inputClass}
          >
            <option value="">Sin asignar</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Horas estimadas</label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={v.hours}
            onChange={(e) => set("hours", Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      {/* Vencimiento por casillas */}
      <div>
        <label className={labelClass}>Vencimiento</label>
        <div className="flex flex-wrap gap-2">
          {DUE_BUCKET_ORDER.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => set("dueBucket", b)}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-medium transition",
                v.dueBucket === b
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
              )}
            >
              {DUE_BUCKET[b].label}
            </button>
          ))}
        </div>
      </div>

      {/* Etiquetas */}
      <div>
        <label className={labelClass}>Etiquetas (qué se va a tocar)</label>
        <div className="flex flex-wrap items-center gap-2">
          {labels.length === 0 && (
            <span className="text-sm text-slate-400">No hay etiquetas todavía.</span>
          )}
          {labels.map((name) => {
            const selected = v.labels.includes(name);
            return (
              <button
                key={name}
                type="button"
                onClick={() => toggleLabel(name)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium transition",
                  selected
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                    : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                {selected && <Check className="h-3.5 w-3.5" />}
                {name}
              </button>
            );
          })}
          {canManageLabels && (
            <button
              type="button"
              onClick={() => {
                setNewLabel("");
                setShowLabelModal(true);
              }}
              title="Nueva etiqueta"
              aria-label="Nueva etiqueta"
              className="inline-flex items-center justify-center rounded-full border border-dashed border-slate-300 p-1.5 text-slate-400 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Guardando…" : mode === "create" ? "Crear tarea" : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          Cancelar
        </button>
      </div>

      {mode === "create" && (
        <p className="text-xs text-slate-400">
          La tarea se creará en estado <span className="font-medium">Pendiente</span>.
          El estado se cambia luego desde el detalle.
        </p>
      )}

      {showLabelModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setShowLabelModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-slate-900">Nueva etiqueta</h3>
            <p className="mt-0.5 text-sm text-slate-500">¿Qué parte se va a tocar?</p>
            <input
              autoFocus
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLabel();
                }
              }}
              placeholder="Ej: testing, infra…"
              className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLabelModal(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={addLabel}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

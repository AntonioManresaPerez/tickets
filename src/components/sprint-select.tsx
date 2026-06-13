"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SprintOpt = { id: string; name: string };

export function SprintSelect({
  taskId,
  sprintId,
  sprints,
}: {
  taskId: number;
  sprintId: string | null;
  sprints: SprintOpt[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(sprintId ?? "");
  const [saving, setSaving] = useState(false);

  async function change(next: string) {
    const before = value;
    setValue(next);
    setSaving(true);
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sprintId: next || null }),
    });
    setSaving(false);
    if (res.ok) router.refresh();
    else setValue(before);
  }

  if (sprints.length === 0) {
    return (
      <p className="text-sm text-slate-400 dark:text-slate-500">
        No hay sprints en esta sección todavía.
      </p>
    );
  }

  return (
    <select
      value={value}
      disabled={saving}
      onChange={(e) => change(e.target.value)}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
    >
      <option value="">Sin sprint</option>
      {sprints.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}

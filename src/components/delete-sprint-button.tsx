"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteSprintButton({ sprintId }: { sprintId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function remove() {
    if (!confirm("¿Eliminar este sprint? Las tareas quedarán sin sprint, no se borran.")) return;
    setSaving(true);
    const res = await fetch(`/api/sprints/${sprintId}`, { method: "DELETE" });
    setSaving(false);
    if (res.ok) {
      router.push("/sprints");
      router.refresh();
    } else {
      alert("No se pudo eliminar el sprint");
    }
  }

  return (
    <button
      onClick={remove}
      disabled={saving}
      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-900/20"
    >
      <Trash2 className="h-4 w-4" />
      Eliminar
    </button>
  );
}

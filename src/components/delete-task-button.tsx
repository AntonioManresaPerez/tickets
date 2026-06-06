"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export function DeleteTaskButton({ taskId }: { taskId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function del() {
    if (!confirm("¿Eliminar esta tarea? Esta acción no se puede deshacer.")) return;
    setBusy(true);
    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/tasks");
      router.refresh();
    } else {
      setBusy(false);
      alert("No se pudo eliminar la tarea.");
    }
  }

  return (
    <button
      onClick={del}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
    >
      <Trash2 className="h-4 w-4" />
      Eliminar
    </button>
  );
}

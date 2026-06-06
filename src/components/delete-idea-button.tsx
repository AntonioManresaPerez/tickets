"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteIdeaButton({ ideaId }: { ideaId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("¿Eliminar esta idea? Esta acción no se puede deshacer.")) return;
    setLoading(true);
    const res = await fetch(`/api/ideas/${ideaId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/ideas");
      router.refresh();
    } else {
      setLoading(false);
      alert("No se pudo eliminar la idea");
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
    >
      <Trash2 className="h-3 w-3" />
      {loading ? "Eliminando…" : "Eliminar"}
    </button>
  );
}

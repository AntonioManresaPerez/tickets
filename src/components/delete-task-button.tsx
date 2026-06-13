"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";

export function DeleteTaskButton({ taskId }: { taskId: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);

  async function del() {
    const ok = await confirm({
      title: "Eliminar tarea",
      message: "Esta acción no se puede deshacer.",
    });
    if (!ok) return;
    setBusy(true);
    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (res.ok) {
      toast({ type: "success", message: "Tarea eliminada" });
      router.push("/tasks");
      router.refresh();
    } else {
      setBusy(false);
      toast({ type: "error", message: "No se pudo eliminar la tarea" });
    }
  }

  return (
    <button
      onClick={del}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-900/20"
    >
      <Trash2 className="h-4 w-4" />
      Eliminar
    </button>
  );
}

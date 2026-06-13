"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm-dialog";

export function DeleteCommentButton({ commentId }: { commentId: string }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!(await confirm({ title: "Eliminar comentario", message: "Se borrará el comentario." }))) return;
    setLoading(true);
    await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="ml-auto text-slate-300 opacity-0 transition hover:text-red-500 group-hover:opacity-100 disabled:opacity-50 dark:text-slate-600 dark:hover:text-red-400"
      title="Eliminar comentario"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

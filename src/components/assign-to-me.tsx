"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserCheck } from "lucide-react";

export function AssignToMe({
  taskId,
  myId,
  assigneeName,
  isMine,
}: {
  taskId: number;
  myId: string;
  assigneeName: string | null;
  isMine: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function assign() {
    setSaving(true);
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigneeId: myId }),
    });
    setSaving(false);
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
          {assigneeName ? assigneeName.charAt(0).toUpperCase() : "—"}
        </div>
        <div>
          <p className="text-xs text-slate-400">Asignada a</p>
          <p className="font-medium text-slate-900">{assigneeName ?? "Sin asignar"}</p>
        </div>
      </div>

      {isMine ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-center text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
          Está asignada a ti
        </p>
      ) : (
        <button
          onClick={assign}
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
        >
          <UserCheck className="h-4 w-4" />
          {saving ? "Asignando…" : "Asignármela a mí"}
        </button>
      )}
    </div>
  );
}

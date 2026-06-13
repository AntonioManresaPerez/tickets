"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, X } from "lucide-react";
import { Avatar } from "@/components/avatar";

type U = { id: string; name: string };

export function CollaboratorsManager({
  taskId,
  collaborators,
  sectionUsers,
}: {
  taskId: number;
  collaborators: U[];
  sectionUsers: U[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);

  const collabIds = new Set(collaborators.map((c) => c.id));
  const available = sectionUsers.filter((u) => !collabIds.has(u.id));

  async function toggle(userId: string) {
    setSaving(true);
    const res = await fetch(`/api/tasks/${taskId}/collaborators`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setSaving(false);
    setAdding(false);
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-3">
      {collaborators.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500">Ninguno</p>
      ) : (
        <ul className="space-y-2">
          {collaborators.map((c) => (
            <li key={c.id} className="group flex items-center gap-2">
              <Avatar name={c.name} size="xs" />
              <span className="flex-1 truncate text-sm text-slate-700 dark:text-slate-300">{c.name}</span>
              <button
                onClick={() => toggle(c.id)}
                disabled={saving}
                title="Quitar"
                className="rounded-md p-1 text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 dark:hover:bg-rose-900/20"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <select
          autoFocus
          defaultValue=""
          disabled={saving}
          onChange={(e) => e.target.value && toggle(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
        >
          <option value="" disabled>
            Elegir persona…
          </option>
          {available.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      ) : (
        available.length > 0 && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Añadir colaborador
          </button>
        )
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IDEA_STATUS, IDEA_STATUS_ORDER, type IdeaStatusKey } from "@/lib/constants";

export function IdeaStatusSelect({
  ideaId,
  status,
}: {
  ideaId: string;
  status: IdeaStatusKey;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSaving(true);
    await fetch(`/api/ideas/${ideaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: e.target.value }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={saving}
      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
    >
      {IDEA_STATUS_ORDER.map((s) => (
        <option key={s} value={s}>
          {IDEA_STATUS[s].label}
        </option>
      ))}
    </select>
  );
}

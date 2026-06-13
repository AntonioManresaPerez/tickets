"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SPRINT_STATUS, SPRINT_STATUS_ORDER, type SprintStatusKey } from "@/lib/constants";

export function SprintStatusSelect({
  sprintId,
  status,
}: {
  sprintId: string;
  status: SprintStatusKey;
}) {
  const router = useRouter();
  const [value, setValue] = useState<SprintStatusKey>(status);
  const [saving, setSaving] = useState(false);

  async function change(next: SprintStatusKey) {
    const before = value;
    setValue(next);
    setSaving(true);
    const res = await fetch(`/api/sprints/${sprintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
    if (res.ok) router.refresh();
    else setValue(before);
  }

  return (
    <select
      value={value}
      disabled={saving}
      onChange={(e) => change(e.target.value as SprintStatusKey)}
      className="rounded-full border-0 px-2.5 py-1 text-xs font-medium ring-1 ring-inset focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-slate-700"
    >
      {SPRINT_STATUS_ORDER.map((s) => (
        <option key={s} value={s}>
          {SPRINT_STATUS[s].label}
        </option>
      ))}
    </select>
  );
}

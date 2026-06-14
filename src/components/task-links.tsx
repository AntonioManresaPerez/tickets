"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Plus, X } from "lucide-react";

export function TaskLinks({ taskId, links: initial }: { taskId: number; links: string[] }) {
  const router = useRouter();
  const [links, setLinks] = useState<string[]>(initial);
  const [value, setValue] = useState("");
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save(next: string[]) {
    setBusy(true);
    setLinks(next);
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ links: next }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  function add() {
    let url = value.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    save([...links, url]);
    setValue("");
    setAdding(false);
  }

  return (
    <div className="space-y-2">
      {links.length === 0 && !adding && (
        <p className="text-sm text-slate-400 dark:text-slate-500">Sin enlaces.</p>
      )}

      {links.map((link, i) => (
        <div key={i} className="group flex items-center gap-2">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm text-blue-600 transition hover:bg-blue-50 hover:underline dark:border-slate-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
          >
            <Link2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{link}</span>
          </a>
          <button
            onClick={() => save(links.filter((_, j) => j !== i))}
            disabled={busy}
            aria-label="Quitar enlace"
            className="shrink-0 rounded-md p-1 text-slate-300 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      {adding ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
              if (e.key === "Escape") setAdding(false);
            }}
            placeholder="https://…"
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          />
          <button
            onClick={add}
            disabled={busy || !value.trim()}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            Añadir
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
        >
          <Plus className="h-3.5 w-3.5" />
          Añadir enlace
        </button>
      )}
    </div>
  );
}

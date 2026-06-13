"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { IDEA_STATUS, IDEA_STATUS_ORDER, IDEA_CATEGORIES } from "@/lib/constants";

type FilterState = { q: string; status: string; category: string; sort: string };

const selectClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:focus:ring-blue-900/30";

export function IdeaFilters({ initial }: { initial: Partial<FilterState> }) {
  const router = useRouter();
  const [f, setF] = useState<FilterState>({
    q: initial.q ?? "",
    status: initial.status ?? "",
    category: initial.category ?? "",
    sort: initial.sort ?? "recent",
  });
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  function apply(next: FilterState) {
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.status) params.set("status", next.status);
    if (next.category) params.set("category", next.category);
    if (next.sort && next.sort !== "recent") params.set("sort", next.sort);
    const qs = params.toString();
    router.replace(qs ? `/ideas?${qs}` : "/ideas");
  }

  function update(patch: Partial<FilterState>, debounced = false) {
    const next = { ...f, ...patch };
    setF(next);
    if (debounced) {
      if (debounce.current) clearTimeout(debounce.current);
      debounce.current = setTimeout(() => apply(next), 350);
    } else {
      apply(next);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center dark:border-slate-700 dark:bg-slate-800">
      <div className="relative w-full sm:min-w-56 sm:flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={f.q}
          onChange={(e) => update({ q: e.target.value }, true)}
          placeholder="Buscar ideas…"
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:placeholder-slate-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:contents">
        <select value={f.status} onChange={(e) => update({ status: e.target.value })} className={selectClass}>
          <option value="">Todos los estados</option>
          {IDEA_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {IDEA_STATUS[s].label}
            </option>
          ))}
        </select>

        <select value={f.category} onChange={(e) => update({ category: e.target.value })} className={selectClass}>
          <option value="">Todas las categorías</option>
          {Object.entries(IDEA_CATEGORIES).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <select value={f.sort} onChange={(e) => update({ sort: e.target.value })} className={selectClass}>
          <option value="recent">Más recientes</option>
          <option value="votes">Más votadas</option>
        </select>
      </div>
    </div>
  );
}

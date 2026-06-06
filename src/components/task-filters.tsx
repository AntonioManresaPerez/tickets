"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { STATUS, STATUS_ORDER, PRIORITY, PRIORITY_ORDER } from "@/lib/constants";

type UserOpt = { id: string; name: string };

type FilterState = {
  q: string;
  status: string;
  priority: string;
  assigneeId: string;
  from: string;
  to: string;
  showDone: boolean;
};

const selectClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export function TaskFilters({
  users,
  initial,
}: {
  users: UserOpt[];
  initial: Partial<FilterState>;
}) {
  const router = useRouter();
  const [f, setF] = useState<FilterState>({
    q: initial.q ?? "",
    status: initial.status ?? "",
    priority: initial.priority ?? "",
    assigneeId: initial.assigneeId ?? "",
    from: initial.from ?? "",
    to: initial.to ?? "",
    showDone: initial.showDone ?? false,
  });
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  function apply(next: FilterState) {
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.status) params.set("status", next.status);
    if (next.priority) params.set("priority", next.priority);
    if (next.assigneeId) params.set("assigneeId", next.assigneeId);
    if (next.from) params.set("from", next.from);
    if (next.to) params.set("to", next.to);
    if (next.showDone) params.set("showDone", "1");
    const qs = params.toString();
    router.replace(qs ? `/tasks?${qs}` : "/tasks");
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
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={f.q}
            onChange={(e) => update({ q: e.target.value }, true)}
            placeholder="Buscar tareas…"
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <select
          value={f.status}
          onChange={(e) => update({ status: e.target.value })}
          className={selectClass}
        >
          <option value="">Todos los estados</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS[s].label}
            </option>
          ))}
        </select>

        <select
          value={f.priority}
          onChange={(e) => update({ priority: e.target.value })}
          className={selectClass}
        >
          <option value="">Todas las prioridades</option>
          {PRIORITY_ORDER.map((p) => (
            <option key={p} value={p}>
              {PRIORITY[p].label}
            </option>
          ))}
        </select>

        <select
          value={f.assigneeId}
          onChange={(e) => update({ assigneeId: e.target.value })}
          className={selectClass}
        >
          <option value="">Todos los usuarios</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={f.showDone}
            onChange={(e) => update({ showDone: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Mostrar finalizadas
        </label>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Desde</span>
          <input
            type="date"
            value={f.from}
            onChange={(e) => update({ from: e.target.value })}
            className={selectClass}
          />
          <span>hasta</span>
          <input
            type="date"
            value={f.to}
            onChange={(e) => update({ to: e.target.value })}
            className={selectClass}
          />
        </div>
      </div>
    </div>
  );
}

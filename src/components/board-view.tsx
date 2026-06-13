"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GripVertical } from "lucide-react";
import { STATUS, BOARD_COLUMNS, PRIORITY, type StatusKey, type PriorityKey } from "@/lib/constants";
import { Avatar } from "@/components/avatar";
import { cn } from "@/lib/utils";

export type BoardTask = {
  id: number;
  title: string;
  status: StatusKey;
  priority: PriorityKey;
  assigneeName: string | null;
};

export function BoardView({ tasks: initial }: { tasks: BoardTask[] }) {
  const router = useRouter();
  const [tasks, setTasks] = useState<BoardTask[]>(initial);
  const [dragId, setDragId] = useState<number | null>(null);
  const [overCol, setOverCol] = useState<StatusKey | null>(null);

  async function moveTo(id: number, status: StatusKey) {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.status === status) return;
    const before = tasks;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) router.refresh();
    else setTasks(before);
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {BOARD_COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col);
        const meta = STATUS[col];
        return (
          <div
            key={col}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(col);
            }}
            onDragLeave={() => setOverCol((c) => (c === col ? null : c))}
            onDrop={() => {
              if (dragId != null) moveTo(dragId, col);
              setDragId(null);
              setOverCol(null);
            }}
            className={cn(
              "flex w-[17rem] shrink-0 flex-col rounded-2xl border bg-slate-50/60 p-2.5 transition dark:bg-slate-800/40",
              overCol === col
                ? "border-blue-400 bg-blue-50/60 dark:border-blue-600 dark:bg-blue-900/20"
                : "border-slate-200 dark:border-slate-700",
            )}
          >
            <div className="mb-2 flex items-center gap-2 px-1">
              <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {meta.label}
              </span>
              <span className="ml-auto rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                {colTasks.length}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2">
              {colTasks.length === 0 && (
                <p className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-400 dark:border-slate-700">
                  Suelta aquí
                </p>
              )}
              {colTasks.map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={() => setDragId(t.id)}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverCol(null);
                  }}
                  className={cn(
                    "group rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition dark:border-slate-700 dark:bg-slate-800",
                    dragId === t.id ? "opacity-50" : "hover:shadow-md",
                  )}
                >
                  <div className="flex items-start gap-1.5">
                    <GripVertical className="mt-0.5 hidden h-4 w-4 shrink-0 cursor-grab text-slate-300 group-hover:text-slate-400 lg:block" />
                    <Link
                      href={`/tasks/${t.id}`}
                      className="min-w-0 flex-1 text-sm font-medium text-slate-900 hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400"
                    >
                      {t.title}
                    </Link>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset", PRIORITY[t.priority].badge)}>
                      {PRIORITY[t.priority].label}
                    </span>
                    <span className="text-[10px] text-slate-400">#{t.id}</span>
                    {t.assigneeName && <Avatar name={t.assigneeName} size="xs" className="ml-auto" />}
                  </div>

                  {/* Selector de estado para móvil (sin drag) */}
                  <select
                    value={t.status}
                    onChange={(e) => moveTo(t.id, e.target.value as StatusKey)}
                    className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600 outline-none lg:hidden dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  >
                    {BOARD_COLUMNS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS[s].label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

import Link from "next/link";
import { ListTree, ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { requireSection } from "@/lib/section";
import { prisma } from "@/lib/prisma";
import { StatusBadge, PriorityBadge } from "@/components/badges";
import { Avatar } from "@/components/avatar";
import { cn } from "@/lib/utils";
import type { StatusKey, PriorityKey } from "@/lib/constants";

type SP = Record<string, string | string[] | undefined>;

type Row = {
  id: number;
  title: string;
  status: StatusKey;
  priority: PriorityKey;
  assigneeName: string | null;
};
type Group = { parentId: number; parentTitle: string; items: Row[] };

export default async function SubtasksPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  await requireUser();
  const section = await requireSection();
  const sp = await searchParams;
  const hideDone = (Array.isArray(sp.hideDone) ? sp.hideDone[0] : sp.hideDone) === "1";

  const subtasks = await prisma.task.findMany({
    where: { section, parentId: { not: null } },
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      assignee: { select: { name: true } },
      parent: { select: { id: true, title: true } },
    },
    orderBy: [{ parentId: "asc" }, { createdAt: "asc" }],
  });

  // Agrupar por tarea padre (los totales se calculan sobre todas, incluidas las hechas).
  const map = new Map<number, Group>();
  for (const s of subtasks) {
    if (!s.parent) continue;
    let g = map.get(s.parent.id);
    if (!g) {
      g = { parentId: s.parent.id, parentTitle: s.parent.title, items: [] };
      map.set(s.parent.id, g);
    }
    g.items.push({
      id: s.id,
      title: s.title,
      status: s.status as StatusKey,
      priority: s.priority as PriorityKey,
      assigneeName: s.assignee?.name ?? null,
    });
  }
  const groups = [...map.values()];
  const total = subtasks.length;
  const done = subtasks.filter((s) => s.status === "DONE").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            <ListTree className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            Subtareas
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {total === 0
              ? "Sin subtareas en esta sección"
              : `${done}/${total} completadas · ${groups.length} ${groups.length === 1 ? "tarea" : "tareas"} con subtareas`}
          </p>
        </div>
        {total > 0 && (
          <Link
            href={hideDone ? "/subtasks" : "/subtasks?hideDone=1"}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {hideDone ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {hideDone ? "Mostrar completadas" : "Ocultar completadas"}
          </Link>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-800">
          <ListTree className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
            Todavía no hay subtareas
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-400 dark:text-slate-500">
            Las subtareas se crean dentro de una tarea, en su apartado “Subtareas”. Aquí verás
            todas agrupadas por la tarea a la que pertenecen.
          </p>
          <Link
            href="/tasks"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Ir a tareas
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => {
            const gDone = g.items.filter((i) => i.status === "DONE").length;
            const pct = Math.round((gDone / g.items.length) * 100);
            const visible = hideDone ? g.items.filter((i) => i.status !== "DONE") : g.items;
            return (
              <section
                key={g.parentId}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
              >
                {/* Cabecera: tarea padre + progreso */}
                <div className="border-b border-slate-100 px-5 py-3.5 dark:border-slate-700">
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      href={`/tasks/${g.parentId}`}
                      className="group flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-900 hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400"
                    >
                      <span className="shrink-0 text-xs font-medium text-slate-400">#{g.parentId}</span>
                      <span className="truncate">{g.parentTitle}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:text-blue-500" />
                    </Link>
                    <span className="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {gDone}/{g.items.length}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        pct === 100 ? "bg-emerald-500" : "bg-blue-500",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Subtareas */}
                {visible.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-slate-400 dark:text-slate-500">
                    Todas las subtareas están completadas.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {visible.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={`/tasks/${s.id}`}
                          className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        >
                          <span className="shrink-0 text-xs text-slate-400">#{s.id}</span>
                          <span
                            className={cn(
                              "min-w-0 flex-1 truncate text-sm",
                              s.status === "DONE"
                                ? "text-slate-400 line-through dark:text-slate-500"
                                : "font-medium text-slate-800 dark:text-slate-200",
                            )}
                          >
                            {s.title}
                          </span>
                          <span className="hidden sm:block">
                            <PriorityBadge priority={s.priority} />
                          </span>
                          <span className="hidden items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 md:flex">
                            {s.assigneeName && <Avatar name={s.assigneeName} size="xs" />}
                            {s.assigneeName ?? "Sin asignar"}
                          </span>
                          <StatusBadge status={s.status} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

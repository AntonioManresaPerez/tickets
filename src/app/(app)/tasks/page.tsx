import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildTaskWhere } from "@/lib/task-query";
import { TaskFilters } from "@/components/task-filters";
import { StatusBadge, PriorityBadge, LabelTag } from "@/components/badges";
import { timeAgo } from "@/lib/utils";
import type { StatusKey, PriorityKey } from "@/lib/constants";

type SP = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  await requireUser();
  const sp = await searchParams;

  const filters = {
    q: str(sp.q),
    status: str(sp.status),
    priority: str(sp.priority),
    assigneeId: str(sp.assigneeId),
    from: str(sp.from),
    to: str(sp.to),
    showDone: str(sp.showDone) === "1",
  };

  const where = buildTaskWhere(filters);

  const [tasks, users] = await Promise.all([
    prisma.task.findMany({
      where,
      include: { assignee: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tareas</h1>
          <p className="mt-1 text-slate-500">
            {tasks.length} {tasks.length === 1 ? "tarea encontrada" : "tareas encontradas"}
          </p>
        </div>
        <Link
          href="/tasks/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nueva Tarea
        </Link>
      </div>

      <TaskFilters users={users} initial={filters} />

      {/* Mobile: card list */}
      <div className="space-y-3 lg:hidden">
        {tasks.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-400 shadow-sm">
            No se encontraron tareas con esos filtros.
          </p>
        ) : (
          tasks.map((t) => (
            <Link
              key={t.id}
              href={`/tasks/${t.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-slate-900">{t.title}</span>
                <StatusBadge status={t.status as StatusKey} />
              </div>
              {t.description && (
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">{t.description}</p>
              )}
              {t.labels.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {t.labels.map((l) => <LabelTag key={l}>{l}</LabelTag>)}
                </div>
              )}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={t.priority as PriorityKey} />
                  <span className="text-xs text-slate-500">
                    {t.assignee?.name ?? "Sin asignar"}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  #{t.id} · {timeAgo(t.createdAt)}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
        <div className="grid grid-cols-[3.5rem_1fr_11rem_8rem_11rem_7rem] gap-3 border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <span>#</span>
          <span>Título</span>
          <span>Estado</span>
          <span>Prioridad</span>
          <span>Asignado a</span>
          <span className="text-right">Creada</span>
        </div>

        {tasks.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-slate-400">
            No se encontraron tareas con esos filtros.
          </p>
        ) : (
          tasks.map((t) => (
            <Link
              key={t.id}
              href={`/tasks/${t.id}`}
              className="grid grid-cols-[3.5rem_1fr_11rem_8rem_11rem_7rem] items-center gap-3 border-b border-slate-50 px-5 py-3.5 text-sm transition last:border-0 hover:bg-slate-50"
            >
              <span className="text-slate-400">{t.id}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-slate-900">{t.title}</span>
                  {t.labels.map((l) => (
                    <LabelTag key={l}>{l}</LabelTag>
                  ))}
                </div>
                {t.description && (
                  <p className="mt-0.5 truncate text-xs text-slate-400">{t.description}</p>
                )}
              </div>
              <span>
                <StatusBadge status={t.status as StatusKey} />
              </span>
              <span>
                <PriorityBadge priority={t.priority as PriorityKey} />
              </span>
              <span className="truncate text-slate-600">
                {t.assignee?.name ?? "Sin asignar"}
              </span>
              <span className="text-right text-xs text-slate-400">
                {timeAgo(t.createdAt)}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

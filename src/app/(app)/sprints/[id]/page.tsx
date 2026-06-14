import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, CalendarRange, Target } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { canAccessSection } from "@/lib/section";
import { prisma } from "@/lib/prisma";
import { StatusBadge, PriorityBadge } from "@/components/badges";
import { SprintStatusSelect } from "@/components/sprint-status-select";
import { DeleteSprintButton } from "@/components/delete-sprint-button";
import { Avatar } from "@/components/avatar";
import { timeAgo } from "@/lib/utils";
import { STATUS, BOARD_COLUMNS, type StatusKey, type PriorityKey, type SprintStatusKey } from "@/lib/constants";

export default async function SprintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const sprint = await prisma.sprint.findUnique({
    where: { id },
    include: {
      tasks: {
        include: { assignee: { select: { name: true } } },
        orderBy: [{ status: "asc" }, { priority: "desc" }],
      },
    },
  });

  if (!sprint) notFound();
  if (!(await canAccessSection(sprint.section))) notFound();

  const total = sprint.tasks.length;
  const done = sprint.tasks.filter((t) => t.status === "DONE").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // Métricas: reparto por estado, horas y carga por persona.
  const byStatus = BOARD_COLUMNS.map((s) => ({
    key: s,
    count: sprint.tasks.filter((t) => t.status === s).length,
  })).filter((s) => s.count > 0);

  const hoursTotal = sprint.tasks.reduce((sum, t) => sum + t.hours, 0);
  const hoursDone = sprint.tasks
    .filter((t) => t.status === "DONE")
    .reduce((sum, t) => sum + t.hours, 0);

  const byAssignee = Object.values(
    sprint.tasks.reduce<Record<string, { name: string; total: number; done: number }>>(
      (acc, t) => {
        const name = t.assignee?.name ?? "Sin asignar";
        acc[name] ??= { name, total: 0, done: 0 };
        acc[name].total++;
        if (t.status === "DONE") acc[name].done++;
        return acc;
      },
      {},
    ),
  ).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      <Link
        href="/sprints"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Sprints
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {sprint.name}
              </h1>
              <SprintStatusSelect sprintId={sprint.id} status={sprint.status as SprintStatusKey} />
            </div>
            {sprint.goal && (
              <p className="mt-2 flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                {sprint.goal}
              </p>
            )}
            {(sprint.startDate || sprint.endDate) && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                <CalendarRange className="h-3.5 w-3.5" />
                {sprint.startDate ? format(sprint.startDate, "d MMM", { locale: es }) : "—"}
                {" → "}
                {sprint.endDate ? format(sprint.endDate, "d MMM yyyy", { locale: es }) : "—"}
              </p>
            )}
          </div>
          <DeleteSprintButton sprintId={sprint.id} />
        </div>

        <div className="mt-5 flex items-center gap-3">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {done}/{total} ({pct}%)
          </span>
        </div>
      </div>

      {total > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Reparto por estado */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Por estado</h3>
            <div className="flex h-2.5 overflow-hidden rounded-full">
              {byStatus.map((s) => (
                <div
                  key={s.key}
                  className={STATUS[s.key].dot}
                  style={{ width: `${(s.count / total) * 100}%` }}
                  title={`${STATUS[s.key].label}: ${s.count}`}
                />
              ))}
            </div>
            <ul className="mt-3 space-y-1.5">
              {byStatus.map((s) => (
                <li key={s.key} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <span className={`h-2 w-2 rounded-full ${STATUS[s.key].dot}`} />
                    {STATUS[s.key].label}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{s.count}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Horas */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Horas estimadas</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{hoursTotal}h</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {hoursDone}h completadas ·{" "}
              {hoursTotal > 0 ? Math.round((hoursDone / hoursTotal) * 100) : 0}%
            </p>
          </div>

          {/* Carga por persona */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Por persona</h3>
            <ul className="space-y-2">
              {byAssignee.map((a) => (
                <li key={a.name} className="flex items-center gap-2 text-sm">
                  {a.name !== "Sin asignar" ? (
                    <Avatar name={a.name} size="xs" />
                  ) : (
                    <span className="h-6 w-6 shrink-0 rounded-full bg-slate-100 dark:bg-slate-700" />
                  )}
                  <span className="flex-1 truncate text-slate-600 dark:text-slate-300">{a.name}</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {a.done}/{a.total}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-200">
          Tareas del sprint
        </h2>
        {total === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800">
            Aún no hay tareas en este sprint. Asígnalo desde el detalle de cada tarea.
          </p>
        ) : (
          <div className="space-y-2">
            {sprint.tasks.map((t) => (
              <Link
                key={t.id}
                href={`/tasks/${t.id}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/50"
              >
                <span className="text-xs text-slate-400">#{t.id}</span>
                <span className="min-w-0 flex-1 truncate font-medium text-slate-900 dark:text-slate-100">
                  {t.title}
                </span>
                <PriorityBadge priority={t.priority as PriorityKey} />
                <StatusBadge status={t.status as StatusKey} />
                <span className="hidden w-28 truncate text-right text-xs text-slate-400 sm:block">
                  {t.assignee?.name ?? "Sin asignar"}
                </span>
                <span className="hidden text-xs text-slate-400 lg:block">{timeAgo(t.createdAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

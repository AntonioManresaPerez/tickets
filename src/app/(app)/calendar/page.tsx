import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge, PriorityBadge } from "@/components/badges";
import { DUE_BUCKET } from "@/lib/constants";
import type { StatusKey, PriorityKey } from "@/lib/constants";

type Row = {
  id: number;
  title: string;
  status: StatusKey;
  priority: PriorityKey;
  assignee: { name: string } | null;
};

function Group({ title, tasks }: { title: string; tasks: Row[] }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {title} ({tasks.length})
      </h2>
      {tasks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white p-5 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800">
          Nada por aquí.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {tasks.map((t) => (
            <Link
              key={t.id}
              href={`/tasks/${t.id}`}
              className="flex items-center justify-between gap-3 border-b border-slate-50 px-5 py-3.5 text-sm transition last:border-0 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-700/50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900 dark:text-slate-100">{t.title}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{t.assignee?.name ?? "Sin asignar"}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <PriorityBadge priority={t.priority} />
                <StatusBadge status={t.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default async function CalendarPage() {
  await requireUser();
  const tasks = await prisma.task.findMany({
    where: { dueBucket: { in: ["TODAY", "WEEK"] }, status: { not: "DONE" } },
    include: { assignee: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status as StatusKey,
    priority: t.priority as PriorityKey,
    assignee: t.assignee,
  }));
  const today = rows.filter((_, i) => tasks[i].dueBucket === "TODAY");
  const week = rows.filter((_, i) => tasks[i].dueBucket === "WEEK");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Calendario</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Tareas pendientes por vencimiento</p>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
          <CalendarDays className="h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-400">
            No hay tareas marcadas para hoy o esta semana. Asígnalo al crear o editar una tarea.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Group title={DUE_BUCKET.TODAY.label} tasks={today} />
          <Group title={DUE_BUCKET.WEEK.label} tasks={week} />
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { Plus, Download } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { requireSection, sectionUsers } from "@/lib/section";
import { prisma } from "@/lib/prisma";
import { buildTaskWhere } from "@/lib/task-query";
import { TaskFilters } from "@/components/task-filters";
import { TaskList, type TaskRow } from "@/components/task-list";
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
  const section = await requireSection();
  const sp = await searchParams;

  const filters = {
    q: str(sp.q),
    status: str(sp.status),
    priority: str(sp.priority),
    assigneeId: str(sp.assigneeId),
    from: str(sp.from),
    to: str(sp.to),
    showDone: str(sp.showDone) === "1",
    section,
  };

  const where = buildTaskWhere(filters);

  // URL de exportación con los mismos filtros activos.
  const exportParams = new URLSearchParams();
  if (filters.q) exportParams.set("q", filters.q);
  if (filters.status) exportParams.set("status", filters.status);
  if (filters.priority) exportParams.set("priority", filters.priority);
  if (filters.assigneeId) exportParams.set("assigneeId", filters.assigneeId);
  if (filters.from) exportParams.set("from", filters.from);
  if (filters.to) exportParams.set("to", filters.to);
  if (filters.showDone) exportParams.set("showDone", "1");
  const exportQs = exportParams.toString();
  const exportHref = exportQs ? `/api/tasks/export?${exportQs}` : "/api/tasks/export";

  const [tasks, users, sprints] = await Promise.all([
    prisma.task.findMany({
      where,
      include: { assignee: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    sectionUsers(section),
    prisma.sprint.findMany({
      where: { section },
      select: { id: true, name: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const rows: TaskRow[] = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status as StatusKey,
    priority: t.priority as PriorityKey,
    labels: t.labels,
    assigneeName: t.assignee?.name ?? null,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    dueBucket: t.dueBucket,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Tareas</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {tasks.length} {tasks.length === 1 ? "tarea encontrada" : "tareas encontradas"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={exportHref}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">CSV</span>
          </a>
          <Link
            href="/tasks/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nueva Tarea
          </Link>
        </div>
      </div>

      <TaskFilters users={users} initial={filters} />

      <TaskList tasks={rows} users={users} sprints={sprints} />
    </div>
  );
}

import Link from "next/link";
import { ListTodo, Loader2, AlertCircle, CheckCircle2, Plus, Rocket, CalendarX } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { requireSection } from "@/lib/section";
import { prisma } from "@/lib/prisma";
import { TaskCard } from "@/components/task-card";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  href,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-700"
    >
      <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-lg", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </Link>
  );
}

export default async function DashboardPage() {
  const session = await requireUser();
  const section = await requireSection();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [pending, inProgress, inReview, done, overdue, myActive, recent, activeSprint] =
    await Promise.all([
      prisma.task.count({ where: { section, status: "PENDING" } }),
      prisma.task.count({ where: { section, status: "IN_PROGRESS" } }),
      prisma.task.count({ where: { section, status: { in: ["USER_REVIEW", "ADMIN_REVIEW"] } } }),
      prisma.task.count({ where: { section, status: "DONE" } }),
      prisma.task.count({
        where: { section, status: { not: "DONE" }, dueDate: { lt: startOfToday } },
      }),
      prisma.task.findMany({
        where: {
          section,
          status: { not: "DONE" },
          OR: [{ assigneeId: session.sub }, { collaborators: { some: { id: session.sub } } }],
        },
        include: { assignee: { select: { name: true } } },
        orderBy: { updatedAt: "desc" },
        take: 6,
      }),
      prisma.task.findMany({
        where: { section },
        include: { assignee: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.sprint.findFirst({
        where: { section, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { tasks: true } },
          tasks: { select: { status: true } },
        },
      }),
    ]);

  const firstName = session.name.split(" ")[0];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Hola, {firstName} 👋
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Aquí tienes un resumen de las tareas</p>
        </div>
        <Link
          href="/tasks/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nueva Tarea
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pendientes" value={pending} icon={ListTodo} color="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" href="/tasks?status=PENDING" />
        <StatCard label="En progreso" value={inProgress} icon={Loader2} color="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300" href="/tasks?status=IN_PROGRESS" />
        <StatCard label="En revisión" value={inReview} icon={AlertCircle} color="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300" href="/tasks?status=USER_REVIEW" />
        <StatCard label="Finalizadas" value={done} icon={CheckCircle2} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300" href="/tasks?status=DONE&showDone=1" />
      </div>

      {/* Sprint activo + vencidas */}
      {(activeSprint || overdue > 0) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {activeSprint && (() => {
            const total = activeSprint._count.tasks;
            const sprintDone = activeSprint.tasks.filter((t) => t.status === "DONE").length;
            const pct = total > 0 ? Math.round((sprintDone / total) * 100) : 0;
            return (
              <Link
                href={`/sprints/${activeSprint.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-700"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <Rocket className="h-4 w-4" />
                  Sprint activo
                </div>
                <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{activeSprint.name}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{sprintDone}/{total}</span>
                </div>
              </Link>
            );
          })()}
          {overdue > 0 && (
            <Link
              href="/tasks"
              className="flex items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm transition hover:shadow-md dark:border-red-900 dark:bg-red-900/20"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
                <CalendarX className="h-5 w-5" />
              </div>
              <div>
                <p className="text-3xl font-bold text-red-700 dark:text-red-300">{overdue}</p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {overdue === 1 ? "tarea vencida" : "tareas vencidas"}
                </p>
              </div>
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Mis tareas activas</h2>
            <Link href="/tasks" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {myActive.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800">
                No tienes tareas activas (asignadas o como colaborador).
              </p>
            ) : (
              myActive.map((t) => <TaskCard key={t.id} task={t} />)
            )}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Tareas recientes</h2>
            <Link href="/tasks" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {recent.map((t) => (
              <TaskCard key={t.id} task={t} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

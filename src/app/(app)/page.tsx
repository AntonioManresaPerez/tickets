import Link from "next/link";
import { ListTodo, Loader2, AlertCircle, CheckCircle2, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TaskCard } from "@/components/task-card";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-lg", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await requireUser();

  const [pending, inProgress, inReview, done, myActive, recent] = await Promise.all([
    prisma.task.count({ where: { status: "PENDING" } }),
    prisma.task.count({ where: { status: "IN_PROGRESS" } }),
    prisma.task.count({ where: { status: { in: ["USER_REVIEW", "ADMIN_REVIEW"] } } }),
    prisma.task.count({ where: { status: "DONE" } }),
    prisma.task.findMany({
      where: { assigneeId: session.sub, status: { not: "DONE" } },
      include: { assignee: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.task.findMany({
      include: { assignee: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const firstName = session.name.split(" ")[0];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Hola, {firstName} 👋
          </h1>
          <p className="mt-1 text-slate-500">Aquí tienes un resumen de las tareas</p>
        </div>
        <Link
          href="/tasks/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nueva Tarea
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pendientes" value={pending} icon={ListTodo} color="bg-slate-100 text-slate-600" />
        <StatCard label="En progreso" value={inProgress} icon={Loader2} color="bg-blue-100 text-blue-600" />
        <StatCard label="En revisión" value={inReview} icon={AlertCircle} color="bg-amber-100 text-amber-600" />
        <StatCard label="Finalizadas" value={done} icon={CheckCircle2} color="bg-emerald-100 text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Mis tareas activas</h2>
            <Link href="/tasks" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {myActive.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
                No tienes tareas activas asignadas.
              </p>
            ) : (
              myActive.map((t) => <TaskCard key={t.id} task={t} />)
            )}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Tareas recientes</h2>
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

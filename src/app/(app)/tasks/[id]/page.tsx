import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Pencil, Calendar, CalendarClock, Clock, User, Flag } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PriorityBadge, LabelTag } from "@/components/badges";
import { StatusWorkflow } from "@/components/status-workflow";
import { CommentForm } from "@/components/comment-form";
import { DeleteTaskButton } from "@/components/delete-task-button";
import { AssignToMe } from "@/components/assign-to-me";
import { Checklist } from "@/components/checklist";
import { InlineDescription } from "@/components/inline-description";
import { DeleteCommentButton } from "@/components/delete-comment-button";
import { TaskScheduler } from "@/components/task-scheduler";
import { Avatar } from "@/components/avatar";
import { timeAgo } from "@/lib/utils";
import {
  type PriorityKey,
  type StatusKey,
} from "@/lib/constants";

const ACTION_LABELS: Record<string, string> = {
  CREATED: "creó la tarea",
  STATUS_CHANGED: "cambió el estado",
  UPDATED: "actualizó la tarea",
  COMMENTED: "comentó",
  ASSIGNED: "asignó la tarea",
};

function Meta({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span className="font-medium text-slate-900 dark:text-slate-100">{children}</span>
    </div>
  );
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUser();
  const { id } = await params;
  const taskId = Number(id);
  if (Number.isNaN(taskId)) notFound();

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignee: { select: { name: true } },
      createdBy: { select: { name: true } },
      comments: {
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
      activities: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 30,
      },
      checklistItems: {
        orderBy: { order: "asc" },
      },
    },
  });
  if (!task) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/tasks"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a tareas
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-400">#{task.id}</span>
            {task.labels.map((l) => (
              <LabelTag key={l}>{l}</LabelTag>
            ))}
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {task.title}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/tasks/${task.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Link>
          {session.role === "ADMIN" && <DeleteTaskButton taskId={task.id} />}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Estado
            </h2>
            <StatusWorkflow taskId={task.id} current={task.status as StatusKey} />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Descripción
            </h2>
            <InlineDescription taskId={task.id} description={task.description ?? null} />
          </section>

          <Checklist
            taskId={task.id}
            items={task.checklistItems.map((i) => ({
              id: i.id,
              text: i.text,
              done: i.done,
            }))}
          />

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Comentarios ({task.comments.length})
            </h2>
            <div className="mb-4 space-y-4">
              {task.comments.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500">Aún no hay comentarios.</p>
              ) : (
                task.comments.map((c) => (
                  <div key={c.id} className="group flex gap-3">
                    <Avatar name={c.author.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {c.author.name}
                        </span>
                        <span className="text-xs text-slate-400">{timeAgo(c.createdAt)}</span>
                        {(session.role === "ADMIN" || c.author.id === session.sub) && (
                          <DeleteCommentButton commentId={c.id} />
                        )}
                      </div>
                      <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                        {c.body}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <CommentForm taskId={task.id} />
          </section>
        </div>

        {/* Barra lateral */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Asignación
            </h2>
            <AssignToMe
              taskId={task.id}
              myId={session.sub}
              assigneeName={task.assignee?.name ?? null}
              isMine={task.assigneeId === session.sub}
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              <CalendarClock className="h-4 w-4" />
              Planificación
            </h2>
            <TaskScheduler
              taskId={task.id}
              dueDate={task.dueDate ? task.dueDate.toISOString() : null}
              dueBucket={task.dueBucket}
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Detalles
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              <Meta icon={Flag} label="Prioridad">
                <PriorityBadge priority={task.priority as PriorityKey} />
              </Meta>
              <Meta icon={User} label="Creada por">
                <span className="flex items-center gap-2">
                  <Avatar name={task.createdBy.name} size="xs" />
                  {task.createdBy.name}
                </span>
              </Meta>
              <Meta icon={Clock} label="Horas est.">
                {task.hours}h
              </Meta>
              <Meta icon={Calendar} label="Creada">
                {format(task.createdAt, "d 'de' MMM yyyy", { locale: es })}
              </Meta>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Actividad
            </h2>
            <ul className="space-y-3">
              {task.activities.map((a) => (
                <li key={a.id} className="text-sm">
                  <span className="font-medium text-slate-900 dark:text-slate-100">{a.user.name}</span>{" "}
                  <span className="text-slate-500 dark:text-slate-400">
                    {ACTION_LABELS[a.action] ?? a.action}
                  </span>
                  {a.detail && <span className="text-slate-500 dark:text-slate-400"> ({a.detail})</span>}
                  <div className="text-xs text-slate-400">{timeAgo(a.createdAt)}</div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

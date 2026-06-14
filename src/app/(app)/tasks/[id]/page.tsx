import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Pencil, Calendar, CalendarClock, Clock, User, Flag, Play, Users, Rocket, Link2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { canAccessSection, sectionUsers } from "@/lib/section";
import { prisma } from "@/lib/prisma";
import { PriorityBadge, LabelTag } from "@/components/badges";
import { CollaboratorsManager } from "@/components/collaborators-manager";
import { SprintSelect } from "@/components/sprint-select";
import { StatusWorkflow } from "@/components/status-workflow";
import { CommentForm } from "@/components/comment-form";
import { DeleteTaskButton } from "@/components/delete-task-button";
import { AssignToMe } from "@/components/assign-to-me";
import { Checklist } from "@/components/checklist";
import { Subtasks } from "@/components/subtasks";
import { TaskLinks } from "@/components/task-links";
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
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="font-medium text-slate-900 dark:text-slate-100">{children}</span>
    </div>
  );
}

const cardClass =
  "rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800";
const titleClass =
  "mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500";
const subTitleClass =
  "mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500";

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
      collaborators: { select: { id: true, name: true }, orderBy: { name: "asc" } },
      parent: { select: { id: true, title: true } },
      subtasks: { select: { id: true, title: true, status: true }, orderBy: { createdAt: "asc" } },
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
  if (!(await canAccessSection(task.section))) notFound();

  const [members, sprints] = await Promise.all([
    sectionUsers(task.section),
    prisma.sprint.findMany({
      where: { section: task.section },
      select: { id: true, name: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-4">
      <Link
        href="/tasks"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a tareas
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-400">#{task.id}</span>
            {task.parent && (
              <Link
                href={`/tasks/${task.parent.id}`}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600"
              >
                ↳ subtarea de #{task.parent.id}
              </Link>
            )}
            {task.labels.map((l) => (
              <LabelTag key={l}>{l}</LabelTag>
            ))}
          </div>
          <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {task.title}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/tasks/${task.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Editar</span>
          </Link>
          {session.role === "ADMIN" && <DeleteTaskButton taskId={task.id} />}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-4 lg:col-span-2">
          <section className={cardClass}>
            <h2 className={titleClass}>Estado</h2>
            <StatusWorkflow
              taskId={task.id}
              current={task.status as StatusKey}
              prevStatus={task.prevStatus as StatusKey | null}
            />
          </section>

          <section className={cardClass}>
            <h2 className={titleClass}>Descripción</h2>
            <InlineDescription taskId={task.id} description={task.description ?? null} />
          </section>

          <section className={cardClass}>
            <h2 className={titleClass}>
              <Link2 className="h-3.5 w-3.5" />
              Enlaces
            </h2>
            <TaskLinks taskId={task.id} links={task.links} />
          </section>

          <Subtasks
            parentId={task.id}
            subtasks={task.subtasks.map((s) => ({
              id: s.id,
              title: s.title,
              status: s.status as StatusKey,
            }))}
          />

          <Checklist
            taskId={task.id}
            items={task.checklistItems.map((i) => ({
              id: i.id,
              text: i.text,
              done: i.done,
            }))}
          />

          <section className={cardClass}>
            <h2 className={titleClass}>Comentarios ({task.comments.length})</h2>
            <div className="mb-3 space-y-3">
              {task.comments.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500">Aún no hay comentarios.</p>
              ) : (
                task.comments.map((c) => (
                  <div key={c.id} className="group flex gap-2.5">
                    <Avatar name={c.author.name} size="xs" />
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
            <CommentForm taskId={task.id} users={members} />
          </section>
        </div>

        {/* Barra lateral */}
        <div className="space-y-4">
          {/* Personas: asignación + colaboradores */}
          <section className={cardClass}>
            <h2 className={titleClass}>
              <User className="h-3.5 w-3.5" />
              Personas
            </h2>
            <AssignToMe
              taskId={task.id}
              myId={session.sub}
              assigneeName={task.assignee?.name ?? null}
              isMine={task.assigneeId === session.sub}
            />
            <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-700">
              <p className={subTitleClass}>
                <Users className="h-3.5 w-3.5" />
                Colaboradores
              </p>
              <CollaboratorsManager
                taskId={task.id}
                collaborators={task.collaborators}
                sectionUsers={members}
              />
            </div>
          </section>

          {/* Organización: sprint + planificación */}
          <section className={cardClass}>
            <div>
              <p className={subTitleClass}>
                <Rocket className="h-3.5 w-3.5" />
                Sprint
              </p>
              <SprintSelect taskId={task.id} sprintId={task.sprintId} sprints={sprints} />
            </div>
            <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-700">
              <p className={subTitleClass}>
                <CalendarClock className="h-3.5 w-3.5" />
                Planificación
              </p>
              <TaskScheduler
                taskId={task.id}
                dueDate={task.dueDate ? task.dueDate.toISOString() : null}
                dueBucket={task.dueBucket}
              />
            </div>
          </section>

          <section className={cardClass}>
            <h2 className={titleClass}>Detalles</h2>
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
              {task.startedAt && (
                <Meta icon={Play} label="Iniciada">
                  {format(task.startedAt, "d MMM yyyy, HH:mm", { locale: es })}
                </Meta>
              )}
              <Meta icon={Calendar} label="Creada">
                {format(task.createdAt, "d 'de' MMM yyyy", { locale: es })}
              </Meta>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className={titleClass}>Actividad</h2>
            <ul className="space-y-2">
              {task.activities.slice(0, 8).map((a) => (
                <li key={a.id} className="text-xs leading-snug">
                  <span className="font-medium text-slate-900 dark:text-slate-100">{a.user.name}</span>{" "}
                  <span className="text-slate-500 dark:text-slate-400">
                    {ACTION_LABELS[a.action] ?? a.action}
                  </span>
                  {a.detail && <span className="text-slate-500 dark:text-slate-400"> ({a.detail})</span>}
                  <span className="text-slate-400"> · {timeAgo(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TaskForm } from "@/components/task-form";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUser();
  const { id } = await params;
  const taskId = Number(id);
  if (Number.isNaN(taskId)) notFound();

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) notFound();

  const [users, labels] = await Promise.all([
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.label.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
  ]);

  const values = {
    id: task.id,
    title: task.title,
    description: task.description ?? "",
    priority: task.priority,
    assigneeId: task.assigneeId ?? "",
    hours: task.hours,
    dueBucket: task.dueBucket,
    labels: task.labels,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Editar tarea #{task.id}
      </h1>
      <TaskForm
        mode="edit"
        users={users}
        availableLabels={labels.map((l) => l.name)}
        canManageLabels={session.role === "ADMIN"}
        task={values}
      />
    </div>
  );
}

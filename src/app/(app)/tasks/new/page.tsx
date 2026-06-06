import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TaskForm } from "@/components/task-form";

export default async function NewTaskPage() {
  const session = await requireUser();
  const [users, labels] = await Promise.all([
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.label.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Nueva tarea</h1>
        <p className="mt-1 text-slate-500">Crea un nuevo ticket para el equipo</p>
      </div>
      <TaskForm
        mode="create"
        users={users}
        availableLabels={labels.map((l) => l.name)}
        canManageLabels={session.role === "ADMIN"}
      />
    </div>
  );
}

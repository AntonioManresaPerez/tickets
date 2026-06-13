import { requireUser } from "@/lib/auth";
import { requireSection } from "@/lib/section";
import { prisma } from "@/lib/prisma";
import { CalendarView } from "@/components/calendar-view";
import type { StatusKey } from "@/lib/constants";

export default async function CalendarPage() {
  await requireUser();
  const section = await requireSection();
  const tasks = await prisma.task.findMany({
    where: {
      section,
      OR: [
        { dueDate: { not: null } },
        { dueBucket: { in: ["TODAY", "WEEK"] } },
      ],
      status: { not: "DONE" },
    },
    select: {
      id: true,
      title: true,
      status: true,
      dueDate: true,
      dueBucket: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const data = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status as StatusKey,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    dueBucket: t.dueBucket,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Calendario
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Tareas con fecha de vencimiento asignada
        </p>
      </div>

      <CalendarView tasks={data} />
    </div>
  );
}

import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { requireSection } from "@/lib/section";
import { prisma } from "@/lib/prisma";
import { BoardView, type BoardTask } from "@/components/board-view";
import type { StatusKey, PriorityKey } from "@/lib/constants";

export default async function BoardPage() {
  await requireUser();
  const section = await requireSection();

  const tasks = await prisma.task.findMany({
    where: { section },
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      assignee: { select: { name: true } },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  const data: BoardTask[] = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status as StatusKey,
    priority: t.priority as PriorityKey,
    assigneeName: t.assignee?.name ?? null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Tablero</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Arrastra las tarjetas para cambiar de estado
          </p>
        </div>
        <Link
          href="/tasks/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nueva Tarea
        </Link>
      </div>

      <BoardView tasks={data} />
    </div>
  );
}

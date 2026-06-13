import { Prisma, TaskStatus, Priority, Section } from "@prisma/client";

export type TaskFilters = {
  q?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  from?: string;
  to?: string;
  showDone?: boolean;
  section?: Section;
};

/** Construye el filtro Prisma a partir de los parámetros de búsqueda. */
export function buildTaskWhere(f: TaskFilters): Prisma.TaskWhereInput {
  const where: Prisma.TaskWhereInput = {};

  if (f.section) where.section = f.section;

  if (f.q) {
    where.OR = [
      { title: { contains: f.q, mode: "insensitive" } },
      { description: { contains: f.q, mode: "insensitive" } },
    ];
  }

  if (f.status) {
    where.status = f.status as TaskStatus;
  } else if (!f.showDone) {
    // Por defecto ocultamos las finalizadas salvo que se pidan explícitamente.
    where.status = { not: TaskStatus.DONE };
  }

  if (f.priority) where.priority = f.priority as Priority;
  if (f.assigneeId) where.assigneeId = f.assigneeId;

  if (f.from || f.to) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (f.from) createdAt.gte = new Date(f.from);
    if (f.to) {
      const end = new Date(f.to);
      end.setHours(23, 59, 59, 999);
      createdAt.lte = end;
    }
    where.createdAt = createdAt;
  }

  return where;
}

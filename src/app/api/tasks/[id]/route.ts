import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logActivity, notify } from "@/lib/activity";
import { STATUS } from "@/lib/constants";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "PAUSED", "USER_REVIEW", "ADMIN_REVIEW", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assigneeId: z.string().nullable().optional(),
  sprintId: z.string().nullable().optional(),
  hours: z.number().min(0).optional(),
  dueBucket: z.enum(["NONE", "TODAY", "WEEK"]).optional(),
  dueDate: z.string().nullable().optional(),
  labels: z.array(z.string()).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const taskId = Number(id);
  if (Number.isNaN(taskId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const existing = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existing) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }
  const d = parsed.data;

  await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(d.title !== undefined && { title: d.title }),
      ...(d.description !== undefined && { description: d.description }),
      ...(d.status !== undefined && { status: d.status }),
      // La primera vez que pasa a "En progreso" guardamos cuándo se inició.
      ...(d.status === "IN_PROGRESS" && !existing.startedAt && { startedAt: new Date() }),
      ...(d.priority !== undefined && { priority: d.priority }),
      ...(d.hours !== undefined && { hours: d.hours }),
      ...(d.dueBucket !== undefined && { dueBucket: d.dueBucket }),
      ...(d.dueDate !== undefined && { dueDate: d.dueDate ? new Date(d.dueDate) : null }),
      ...(d.labels !== undefined && { labels: d.labels }),
      ...(d.assigneeId !== undefined && { assigneeId: d.assigneeId || null }),
      ...(d.sprintId !== undefined && { sprintId: d.sprintId || null }),
    },
  });

  if (d.status && d.status !== existing.status) {
    await logActivity({
      taskId,
      userId: session.sub,
      action: "STATUS_CHANGED",
      detail: `${STATUS[existing.status].label} → ${STATUS[d.status].label}`,
    });
  } else {
    await logActivity({ taskId, userId: session.sub, action: "UPDATED" });
  }

  if (
    d.assigneeId !== undefined &&
    d.assigneeId &&
    d.assigneeId !== existing.assigneeId &&
    d.assigneeId !== session.sub
  ) {
    await notify(d.assigneeId, `Se te ha asignado la tarea #${taskId}`, `/tasks/${taskId}`);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Solo el administrador puede borrar tareas" },
      { status: 403 },
    );
  }

  const { id } = await params;
  const taskId = Number(id);
  if (Number.isNaN(taskId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  await prisma.task.delete({ where: { id: taskId } });
  return NextResponse.json({ ok: true });
}

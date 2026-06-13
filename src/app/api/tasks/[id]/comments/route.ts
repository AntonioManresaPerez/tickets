import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canAccessSection } from "@/lib/section";
import { logActivity, notify } from "@/lib/activity";

const schema = z.object({ body: z.string().min(1, "El comentario no puede estar vacío") });

export async function POST(
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

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, title: true, section: true, createdById: true, assigneeId: true },
  });
  if (!task) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  if (!(await canAccessSection(task.section))) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  await prisma.comment.create({
    data: { taskId, authorId: session.sub, body: parsed.data.body },
  });
  await logActivity({ taskId, userId: session.sub, action: "COMMENTED" });

  // Avisar a las personas implicadas (creador y asignado), salvo al propio autor.
  const recipients = new Set<string>();
  if (task.createdById) recipients.add(task.createdById);
  if (task.assigneeId) recipients.add(task.assigneeId);
  recipients.delete(session.sub);
  for (const userId of recipients) {
    await notify(
      userId,
      `${session.name} comentó en la tarea #${taskId}`,
      `/tasks/${taskId}`,
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

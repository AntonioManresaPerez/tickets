import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canAccessSection } from "@/lib/section";
import { notify } from "@/lib/activity";

const schema = z.object({ userId: z.string().min(1) });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const taskId = Number(id);
  if (Number.isNaN(taskId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, title: true, section: true, collaborators: { select: { id: true } } },
  });
  if (!task) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  if (!(await canAccessSection(task.section))) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  const already = task.collaborators.some((c) => c.id === parsed.data.userId);

  await prisma.task.update({
    where: { id: taskId },
    data: {
      collaborators: already
        ? { disconnect: { id: parsed.data.userId } }
        : { connect: { id: parsed.data.userId } },
    },
  });

  if (!already && parsed.data.userId !== session.sub) {
    await notify(
      parsed.data.userId,
      `Te han añadido como colaborador en la tarea #${taskId}: ${task.title}`,
      `/tasks/${taskId}`,
    );
  }

  return NextResponse.json({ ok: true, added: !already });
}

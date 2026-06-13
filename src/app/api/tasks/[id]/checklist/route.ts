import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canAccessSection } from "@/lib/section";

const schema = z.object({ text: z.string().min(1, "El texto no puede estar vacío") });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const taskId = Number(id);
  if (Number.isNaN(taskId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const task = await prisma.task.findUnique({ where: { id: taskId }, select: { id: true, section: true } });
  if (!task) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  if (!(await canAccessSection(task.section))) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const last = await prisma.checklistItem.findFirst({
    where: { taskId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const item = await prisma.checklistItem.create({
    data: { taskId, text: parsed.data.text, order: (last?.order ?? -1) + 1 },
  });

  return NextResponse.json(item, { status: 201 });
}

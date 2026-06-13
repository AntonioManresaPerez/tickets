import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canAccessSection } from "@/lib/section";

const patchSchema = z.object({
  done: z.boolean().optional(),
  text: z.string().min(1).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const item = await prisma.checklistItem.findUnique({
    where: { id },
    include: { task: { select: { section: true } } },
  });
  if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (!(await canAccessSection(item.task.section))) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const updated = await prisma.checklistItem.update({
    where: { id },
    data: {
      ...(parsed.data.done !== undefined && { done: parsed.data.done }),
      ...(parsed.data.text !== undefined && { text: parsed.data.text.trim() }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const item = await prisma.checklistItem.findUnique({
    where: { id },
    include: { task: { select: { section: true } } },
  });
  if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (!(await canAccessSection(item.task.section))) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  await prisma.checklistItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

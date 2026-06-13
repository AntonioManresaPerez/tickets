import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canAccessSection } from "@/lib/section";

const schema = z.object({
  name: z.string().min(1).max(120).optional(),
  goal: z.string().nullable().optional(),
  status: z.enum(["PLANNED", "ACTIVE", "COMPLETED"]).optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireUser();
  const { id } = await params;

  const sprint = await prisma.sprint.findUnique({ where: { id } });
  if (!sprint) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (!(await canAccessSection(sprint.section))) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const d = schema.safeParse(body);
  if (!d.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const updated = await prisma.sprint.update({
    where: { id },
    data: {
      ...(d.data.name !== undefined && { name: d.data.name }),
      ...(d.data.goal !== undefined && { goal: d.data.goal }),
      ...(d.data.status !== undefined && { status: d.data.status }),
      ...(d.data.startDate !== undefined && {
        startDate: d.data.startDate ? new Date(d.data.startDate) : null,
      }),
      ...(d.data.endDate !== undefined && {
        endDate: d.data.endDate ? new Date(d.data.endDate) : null,
      }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireUser();
  const { id } = await params;

  const sprint = await prisma.sprint.findUnique({ where: { id } });
  if (!sprint) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (!(await canAccessSection(sprint.section))) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  // Las tareas no se borran: quedan sin sprint (onDelete: SetNull).
  await prisma.sprint.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

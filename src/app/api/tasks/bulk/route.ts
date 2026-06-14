import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getActiveSection } from "@/lib/section";

const schema = z.object({
  ids: z.array(z.number().int()).min(1),
  action: z.enum(["status", "priority", "assignee", "sprint", "delete"]),
  value: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  await requireUser();
  const section = await getActiveSection();
  if (!section) return NextResponse.json({ error: "Sin sección activa" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const { ids, action, value } = parsed.data;

  // El filtro por sección garantiza que solo se tocan tareas de la sección activa.
  const where = { id: { in: ids }, section };

  if (action === "delete") {
    const r = await prisma.task.deleteMany({ where });
    return NextResponse.json({ ok: true, count: r.count });
  }

  let data: Record<string, unknown>;
  if (action === "status") data = { status: value };
  else if (action === "priority") data = { priority: value };
  else if (action === "assignee") data = { assigneeId: value || null };
  else data = { sprintId: value || null };

  const r = await prisma.task.updateMany({ where, data });
  return NextResponse.json({ ok: true, count: r.count });
}

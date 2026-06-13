import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getActiveSection } from "@/lib/section";

export async function GET() {
  await requireUser();
  const section = await getActiveSection();
  if (!section) return NextResponse.json([]);
  const sprints = await prisma.sprint.findMany({
    where: { section },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { tasks: true } } },
  });
  return NextResponse.json(sprints);
}

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(120),
  goal: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  await requireUser();
  const section = await getActiveSection();
  if (!section) return NextResponse.json({ error: "Sin sección activa" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const d = schema.safeParse(body);
  if (!d.success) {
    return NextResponse.json(
      { error: d.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }

  const sprint = await prisma.sprint.create({
    data: {
      name: d.data.name,
      goal: d.data.goal || null,
      section,
      startDate: d.data.startDate ? new Date(d.data.startDate) : null,
      endDate: d.data.endDate ? new Date(d.data.endDate) : null,
    },
  });
  return NextResponse.json(sprint, { status: 201 });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logActivity, notify } from "@/lib/activity";

const createSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  description: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assigneeId: z.string().optional().nullable(),
  hours: z.number().min(0).optional(),
  dueBucket: z.enum(["NONE", "TODAY", "WEEK"]).optional(),
  labels: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }
  const d = parsed.data;

  const task = await prisma.task.create({
    data: {
      title: d.title,
      description: d.description || null,
      status: "PENDING", // toda tarea nueva nace como Pendiente
      priority: d.priority ?? "MEDIUM",
      hours: d.hours ?? 0,
      dueBucket: d.dueBucket ?? "NONE",
      labels: d.labels ?? [],
      assigneeId: d.assigneeId || null,
      createdById: session.sub,
    },
  });

  await logActivity({ taskId: task.id, userId: session.sub, action: "CREATED" });

  if (task.assigneeId && task.assigneeId !== session.sub) {
    await notify(
      task.assigneeId,
      `Se te ha asignado la tarea #${task.id}: ${task.title}`,
      `/tasks/${task.id}`,
    );
  }

  return NextResponse.json({ id: task.id }, { status: 201 });
}

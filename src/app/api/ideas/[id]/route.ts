import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireUser();
  const { id } = await params;
  const idea = await prisma.idea.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { votes: true } },
      comments: {
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!idea) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json(idea);
}

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  links: z.array(z.string()).optional(),
  status: z.enum(["OPEN", "PLANNED", "DOING", "DONE", "REJECTED"]).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUser();
  const { id } = await params;

  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  if (idea.authorId !== session.sub && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const d = patchSchema.safeParse(body);
  if (!d.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  if (d.data.status !== undefined && session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Solo los administradores pueden cambiar el estado" },
      { status: 403 },
    );
  }

  const updated = await prisma.idea.update({
    where: { id },
    data: {
      ...(d.data.title !== undefined && { title: d.data.title }),
      ...(d.data.body !== undefined && { body: d.data.body }),
      ...(d.data.category !== undefined && { category: d.data.category }),
      ...(d.data.links !== undefined && { links: d.data.links.filter(Boolean) }),
      ...(d.data.status !== undefined && { status: d.data.status }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUser();
  const { id } = await params;

  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  if (idea.authorId !== session.sub && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  await prisma.idea.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

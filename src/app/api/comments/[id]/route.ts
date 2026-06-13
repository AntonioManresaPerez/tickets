import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canAccessSection } from "@/lib/section";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const comment = await prisma.comment.findUnique({
    where: { id },
    include: { task: { select: { section: true } } },
  });
  if (!comment) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (!(await canAccessSection(comment.task.section))) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  const canDelete = session.role === "ADMIN" || comment.authorId === session.sub;
  if (!canDelete) {
    return NextResponse.json({ error: "Sin permiso para borrar este comentario" }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

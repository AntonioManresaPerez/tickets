import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { canAccessSection } from "@/lib/section";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUser();
  const { id } = await params;

  const comment = await prisma.ideaComment.findUnique({
    where: { id },
    include: { idea: { select: { section: true } } },
  });
  if (!comment) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (!(await canAccessSection(comment.idea.section))) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  if (comment.authorId !== session.sub && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  await prisma.ideaComment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

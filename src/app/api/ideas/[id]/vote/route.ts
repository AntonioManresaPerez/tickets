import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { canAccessSection } from "@/lib/section";
import { notify } from "@/lib/activity";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUser();
  const { id } = await params;

  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  if (!(await canAccessSection(idea.section))) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  const existing = await prisma.ideaVote.findUnique({
    where: { userId_ideaId: { userId: session.sub, ideaId: id } },
  });

  if (existing) {
    await prisma.ideaVote.delete({
      where: { userId_ideaId: { userId: session.sub, ideaId: id } },
    });
    return NextResponse.json({ voted: false });
  }

  await prisma.ideaVote.create({
    data: { userId: session.sub, ideaId: id },
  });
  if (idea.authorId !== session.sub) {
    await notify(idea.authorId, `${session.name} votó tu idea "${idea.title}"`, `/ideas/${id}`);
  }
  return NextResponse.json({ voted: true });
}

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUser();
  const { id } = await params;

  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

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
  return NextResponse.json({ voted: true });
}

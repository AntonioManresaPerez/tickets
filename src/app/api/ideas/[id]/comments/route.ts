import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { canAccessSection, sectionUsers } from "@/lib/section";
import { notify, notifyMany, mentionedUserIds } from "@/lib/activity";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  body: z.string().min(1).max(2000),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUser();
  const { id } = await params;

  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  if (!(await canAccessSection(idea.section))) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const d = schema.safeParse(body);
  if (!d.success) return NextResponse.json({ error: "Texto requerido" }, { status: 400 });

  const comment = await prisma.ideaComment.create({
    data: { body: d.data.body, ideaId: id, authorId: session.sub },
    include: { author: { select: { id: true, name: true } } },
  });

  // Avisar al autor de la idea (si no es quien comenta).
  if (idea.authorId !== session.sub) {
    await notify(
      idea.authorId,
      `${session.name} comentó en tu idea "${idea.title}"`,
      `/ideas/${id}`,
    );
  }
  // Avisar a los mencionados con @ (salvo autor de la idea ya avisado y el propio).
  const mentioned = mentionedUserIds(d.data.body, await sectionUsers(idea.section))
    .filter((uid) => uid !== session.sub && uid !== idea.authorId);
  await notifyMany(mentioned, `${session.name} te mencionó en una idea`, `/ideas/${id}`);

  return NextResponse.json(comment, { status: 201 });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { getActiveSection } from "@/lib/section";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireUser();
  const section = await getActiveSection();
  if (!section) return NextResponse.json([]);
  const ideas = await prisma.idea.findMany({
    where: { section },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { votes: true, comments: true } },
      votes: { where: { userId: session.sub }, select: { userId: true } },
    },
  });
  return NextResponse.json(ideas);
}

const schema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  links: z.array(z.string()).optional().default([]),
});

export async function POST(req: Request) {
  const session = await requireUser();
  const section = await getActiveSection();
  if (!section) return NextResponse.json({ error: "Sin sección activa" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const d = schema.safeParse(body);
  if (!d.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const idea = await prisma.idea.create({
    data: {
      title: d.data.title,
      body: d.data.body || null,
      category: d.data.category || null,
      section,
      links: d.data.links.filter(Boolean),
      authorId: session.sub,
    },
  });
  return NextResponse.json(idea, { status: 201 });
}

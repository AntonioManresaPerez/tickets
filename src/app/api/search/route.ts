import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getActiveSection } from "@/lib/section";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  await requireUser();
  const section = await getActiveSection();
  const empty = { tasks: [], ideas: [], sprints: [] };
  if (!section) return NextResponse.json(empty);

  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json(empty);

  const [tasks, ideas, sprints] = await Promise.all([
    prisma.task.findMany({
      where: {
        section,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { labels: { has: q.toLowerCase() } },
        ],
      },
      select: { id: true, title: true, status: true },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.idea.findMany({
      where: {
        section,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { body: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, status: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.sprint.findMany({
      where: { section, name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, status: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  return NextResponse.json({ tasks, ideas, sprints });
}

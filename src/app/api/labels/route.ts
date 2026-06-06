import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const labels = await prisma.label.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(labels);
}

const schema = z.object({ name: z.string().min(1).max(30) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Solo el administrador puede crear etiquetas" },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
  }

  const name = parsed.data.name.trim().toLowerCase();
  const existing = await prisma.label.findUnique({ where: { name } });
  if (existing) return NextResponse.json(existing);

  const label = await prisma.label.create({ data: { name } });
  return NextResponse.json(label, { status: 201 });
}

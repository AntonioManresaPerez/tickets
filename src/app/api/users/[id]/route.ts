import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().min(3).optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  sections: z.array(z.enum(["ESCALAS_MEDICAS", "PROGRAMACION"])).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Solo el administrador puede editar usuarios" },
      { status: 403 },
    );
  }

  const { id } = await params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }
  const d = parsed.data;

  // Evita quedarse sin ningún administrador.
  if (d.role === "USER" && target.role === "ADMIN") {
    const admins = await prisma.user.count({ where: { role: "ADMIN" } });
    if (admins <= 1) {
      return NextResponse.json(
        { error: "Debe quedar al menos un administrador" },
        { status: 400 },
      );
    }
  }

  // Comprueba que el email no esté en uso por otro usuario.
  if (d.email) {
    const email = d.email.trim().toLowerCase();
    const other = await prisma.user.findUnique({ where: { email } });
    if (other && other.id !== id) {
      return NextResponse.json({ error: "Ese email ya está en uso" }, { status: 409 });
    }
  }

  await prisma.user.update({
    where: { id },
    data: {
      ...(d.name !== undefined && { name: d.name }),
      ...(d.email !== undefined && { email: d.email.trim().toLowerCase() }),
      ...(d.role !== undefined && { role: d.role }),
      ...(d.password !== undefined && { password: await hashPassword(d.password) }),
      ...(d.sections !== undefined && { sections: d.sections }),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede borrar usuarios" }, { status: 403 });
  }

  const { id } = await params;

  if (id === session.sub) {
    return NextResponse.json({ error: "No puedes eliminar tu propia cuenta" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  if (target.role === "ADMIN") {
    const admins = await prisma.user.count({ where: { role: "ADMIN" } });
    if (admins <= 1) {
      return NextResponse.json({ error: "Debe quedar al menos un administrador" }, { status: 400 });
    }
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUser();
  const { id } = await params;

  // Solo marca como leída si la notificación es del propio usuario.
  await prisma.notification.updateMany({
    where: { id, userId: session.sub },
    data: { read: true },
  });
  return NextResponse.json({ ok: true });
}

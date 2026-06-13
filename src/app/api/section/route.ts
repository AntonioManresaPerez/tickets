import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { setActiveSection } from "@/lib/section";

const schema = z.object({
  section: z.enum(["ESCALAS_MEDICAS", "PROGRAMACION"]),
});

export async function POST(req: Request) {
  await requireUser();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Sección inválida" }, { status: 400 });
  }

  const ok = await setActiveSection(parsed.data.section);
  if (!ok) {
    return NextResponse.json({ error: "Sin acceso a esa sección" }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}

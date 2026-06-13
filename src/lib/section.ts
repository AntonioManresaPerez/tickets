import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Section } from "@prisma/client";
import { prisma } from "./prisma";
import { getSession } from "./auth";
import { SECTION_ORDER } from "./constants";

const SECTION_COOKIE = "active_section";
const MAX_AGE = 60 * 60 * 24 * 365; // 1 año

/** Secciones a las que el usuario actual tiene acceso. Los admins acceden a todas. */
export async function getAllowedSections(): Promise<Section[]> {
  const session = await getSession();
  if (!session) return [];
  if (session.role === "ADMIN") return [...SECTION_ORDER] as Section[];
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { sections: true },
  });
  return user?.sections ?? [];
}

/** Sección activa según la cookie, validada contra las permitidas. */
export async function getActiveSection(allowed?: Section[]): Promise<Section | null> {
  const list = allowed ?? (await getAllowedSections());
  if (list.length === 0) return null;
  const store = await cookies();
  const val = store.get(SECTION_COOKIE)?.value as Section | undefined;
  if (val && list.includes(val)) return val;
  return list[0];
}

export async function getSectionContext(): Promise<{
  allowed: Section[];
  active: Section | null;
}> {
  const allowed = await getAllowedSections();
  const active = await getActiveSection(allowed);
  return { allowed, active };
}

/** Para páginas que requieren una sección activa. Redirige si no hay acceso. */
export async function requireSection(): Promise<Section> {
  const active = await getActiveSection();
  if (!active) redirect("/sin-acceso");
  return active;
}

/** Comprueba que el usuario puede ver la sección dada (si no, lanza notFound vía caller). */
export async function canAccessSection(section: Section): Promise<boolean> {
  const allowed = await getAllowedSections();
  return allowed.includes(section);
}

/** Cambia la sección activa (valida que esté permitida). */
export async function setActiveSection(section: Section): Promise<boolean> {
  const allowed = await getAllowedSections();
  if (!allowed.includes(section)) return false;
  const store = await cookies();
  store.set(SECTION_COOKIE, section, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return true;
}

/** Usuarios con acceso a una sección (para asignaciones y colaboradores). */
export async function sectionUsers(section: Section) {
  return prisma.user.findMany({
    where: { OR: [{ sections: { has: section } }, { role: "ADMIN" }] },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

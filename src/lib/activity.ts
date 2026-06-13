import { prisma } from "./prisma";

/** Registra una entrada en el log de auditoría. */
export async function logActivity(opts: {
  taskId?: number;
  userId: string;
  action: string;
  detail?: string;
}) {
  await prisma.activity.create({
    data: {
      taskId: opts.taskId,
      userId: opts.userId,
      action: opts.action,
      detail: opts.detail,
    },
  });
}

/** Crea una notificación in-app para un usuario. */
export async function notify(userId: string, message: string, link?: string) {
  await prisma.notification.create({
    data: { userId, message, link },
  });
}

/** Crea notificaciones para varios usuarios a la vez (ignora ids vacíos/duplicados). */
export async function notifyMany(userIds: Iterable<string>, message: string, link?: string) {
  const unique = [...new Set([...userIds].filter(Boolean))];
  if (unique.length === 0) return;
  await prisma.notification.createMany({
    data: unique.map((userId) => ({ userId, message, link })),
  });
}

/**
 * Detecta menciones "@Nombre" en un texto y devuelve los ids de los usuarios
 * mencionados (de entre los pasados). Coincide por nombre completo o nombre de pila.
 */
export function mentionedUserIds(
  text: string,
  users: { id: string; name: string }[],
): string[] {
  if (!text.includes("@")) return [];
  const lower = text.toLowerCase();
  const ids: string[] = [];
  for (const u of users) {
    const full = u.name.toLowerCase();
    const first = full.split(/\s+/)[0];
    if (lower.includes("@" + full) || lower.includes("@" + first)) ids.push(u.id);
  }
  return ids;
}

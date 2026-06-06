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

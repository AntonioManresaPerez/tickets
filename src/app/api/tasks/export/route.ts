import { requireUser } from "@/lib/auth";
import { getActiveSection } from "@/lib/section";
import { prisma } from "@/lib/prisma";
import { buildTaskWhere } from "@/lib/task-query";
import { STATUS, PRIORITY, type StatusKey, type PriorityKey } from "@/lib/constants";

/** Escapa un campo para CSV (comillas, comas y saltos de línea). */
function csv(value: string | number | null | undefined): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: Request) {
  await requireUser();
  const section = await getActiveSection();
  if (!section) return new Response("Sin sección activa", { status: 403 });

  const sp = new URL(req.url).searchParams;
  const where = buildTaskWhere({
    q: sp.get("q") ?? undefined,
    status: sp.get("status") ?? undefined,
    priority: sp.get("priority") ?? undefined,
    assigneeId: sp.get("assigneeId") ?? undefined,
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
    showDone: sp.get("showDone") === "1",
    section,
  });

  const tasks = await prisma.task.findMany({
    where,
    include: { assignee: { select: { name: true } }, sprint: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const header = [
    "ID",
    "Título",
    "Estado",
    "Prioridad",
    "Asignado",
    "Sprint",
    "Etiquetas",
    "Horas",
    "Fecha límite",
    "Creada",
  ];

  const rows = tasks.map((t) =>
    [
      t.id,
      t.title,
      STATUS[t.status as StatusKey].label,
      PRIORITY[t.priority as PriorityKey].label,
      t.assignee?.name ?? "Sin asignar",
      t.sprint?.name ?? "",
      t.labels.join(" "),
      t.hours,
      t.dueDate ? t.dueDate.toISOString().slice(0, 10) : "",
      t.createdAt.toISOString().slice(0, 10),
    ]
      .map(csv)
      .join(","),
  );

  // BOM para que Excel reconozca UTF-8.
  const body = "﻿" + [header.join(","), ...rows].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tareas-${section.toLowerCase()}-${date}.csv"`,
    },
  });
}

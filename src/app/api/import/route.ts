import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { getActiveSection } from "@/lib/section";
import { prisma } from "@/lib/prisma";

// Normaliza enums a mayúsculas (la IA puede devolverlos en minúscula).
const upper = (v: unknown) => (typeof v === "string" ? v.toUpperCase() : v);
const priority = z.preprocess(upper, z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]));
const dueBucket = z.preprocess(upper, z.enum(["NONE", "TODAY", "WEEK"]));

const subtaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().nullish(),
  priority: priority.optional(),
  hours: z.number().min(0).optional(),
  labels: z.array(z.string()).optional(),
  dueBucket: dueBucket.optional(),
  dueDate: z.string().nullish(),
  links: z.array(z.string()).optional(),
});

const taskSchema = subtaskSchema.extend({
  subtasks: z.array(subtaskSchema).optional(),
});

const ideaSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().nullish(),
  category: z.string().nullish(),
  links: z.array(z.string()).optional(),
});

const importSchema = z.object({
  tasks: z.array(taskSchema).optional().default([]),
  ideas: z.array(ideaSchema).optional().default([]),
});

// Acepta también un array suelto (se interpreta como lista de tareas).
const root = z.preprocess(
  (v) => (Array.isArray(v) ? { tasks: v } : v),
  importSchema,
);

function cleanLinks(links?: string[]): string[] {
  if (!links) return [];
  return links
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => (/^https?:\/\//i.test(l) ? l : `https://${l}`));
}

function cleanLabels(labels?: string[]): string[] {
  if (!labels) return [];
  return labels.map((l) => l.trim()).filter(Boolean);
}

function parseDate(s?: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function POST(req: Request) {
  const session = await requireUser();
  const section = await getActiveSection();
  if (!section) {
    return NextResponse.json({ error: "Sin sección activa" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (body == null) {
    return NextResponse.json({ error: "El JSON no es válido." }, { status: 400 });
  }

  const parsed = root.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path?.join(".");
    return NextResponse.json(
      {
        error: `Formato incorrecto${path ? ` en "${path}"` : ""}: ${issue?.message ?? "datos inválidos"}`,
      },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const subtaskCount = data.tasks.reduce((n, t) => n + (t.subtasks?.length ?? 0), 0);
  const totalItems = data.tasks.length + subtaskCount + data.ideas.length;
  if (totalItems === 0) {
    return NextResponse.json(
      { error: "El JSON no contiene ninguna tarea ni idea." },
      { status: 400 },
    );
  }
  if (totalItems > 500) {
    return NextResponse.json(
      { error: `Demasiados elementos (${totalItems}). Máximo 500 por importación.` },
      { status: 400 },
    );
  }

  // Etiquetas únicas para añadirlas al catálogo y que aparezcan en los filtros.
  const labelSet = new Set<string>();
  for (const t of data.tasks) {
    cleanLabels(t.labels).forEach((l) => labelSet.add(l));
    (t.subtasks ?? []).forEach((s) => cleanLabels(s.labels).forEach((l) => labelSet.add(l)));
  }

  const createdTaskIds: number[] = [];

  await prisma.$transaction(
    async (tx) => {
      if (labelSet.size > 0) {
        await tx.label.createMany({
          data: [...labelSet].map((name) => ({ name })),
          skipDuplicates: true,
        });
      }

      for (const t of data.tasks) {
        const parent = await tx.task.create({
          data: {
            title: t.title,
            description: t.description || null,
            status: "PENDING",
            priority: t.priority ?? "MEDIUM",
            section,
            hours: t.hours ?? 0,
            labels: cleanLabels(t.labels),
            links: cleanLinks(t.links),
            dueBucket: t.dueBucket ?? "NONE",
            dueDate: parseDate(t.dueDate),
            createdById: session.sub,
          },
        });
        createdTaskIds.push(parent.id);

        if (t.subtasks && t.subtasks.length > 0) {
          await tx.task.createMany({
            data: t.subtasks.map((s) => ({
              title: s.title,
              description: s.description || null,
              status: "PENDING" as const,
              priority: s.priority ?? "MEDIUM",
              section,
              hours: s.hours ?? 0,
              labels: cleanLabels(s.labels),
              links: cleanLinks(s.links),
              dueBucket: s.dueBucket ?? "NONE",
              dueDate: parseDate(s.dueDate),
              parentId: parent.id,
              createdById: session.sub,
            })),
          });
        }
      }

      if (data.ideas.length > 0) {
        await tx.idea.createMany({
          data: data.ideas.map((i) => ({
            title: i.title,
            body: i.body || null,
            category: i.category || null,
            section,
            links: cleanLinks(i.links),
            authorId: session.sub,
          })),
        });
      }
    },
    { timeout: 20000, maxWait: 10000 },
  );

  // Registro de actividad de las tareas principales (best-effort).
  if (createdTaskIds.length > 0) {
    await prisma.activity.createMany({
      data: createdTaskIds.map((id) => ({
        action: "CREATED",
        detail: "Importada",
        taskId: id,
        userId: session.sub,
      })),
    });
  }

  return NextResponse.json({
    ok: true,
    created: {
      tasks: data.tasks.length,
      subtasks: subtaskCount,
      ideas: data.ideas.length,
    },
  });
}

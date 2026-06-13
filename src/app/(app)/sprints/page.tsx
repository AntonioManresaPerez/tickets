import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Rocket, CalendarRange } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { requireSection } from "@/lib/section";
import { prisma } from "@/lib/prisma";
import { SprintForm } from "@/components/sprint-form";
import { SPRINT_STATUS, type SprintStatusKey } from "@/lib/constants";

export default async function SprintsPage() {
  await requireUser();
  const section = await requireSection();

  const sprints = await prisma.sprint.findMany({
    where: { section },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { tasks: true } },
      tasks: { select: { status: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Sprints</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Agrupa tareas en entregas con objetivo y fechas
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {sprints.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-700">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Rocket className="h-6 w-6 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="font-medium text-slate-700 dark:text-slate-300">No hay sprints todavía</p>
              <p className="mt-1 text-sm text-slate-400">Crea el primero con el formulario.</p>
            </div>
          ) : (
            sprints.map((s) => {
              const total = s._count.tasks;
              const done = s.tasks.filter((t) => t.status === "DONE").length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const st = SPRINT_STATUS[s.status as SprintStatusKey];
              return (
                <Link
                  key={s.id}
                  href={`/sprints/${s.id}`}
                  className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-700"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{s.name}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${st.badge}`}>
                      {st.label}
                    </span>
                  </div>
                  {s.goal && (
                    <p className="mt-1 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">{s.goal}</p>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {done}/{total}
                    </span>
                  </div>
                  {(s.startDate || s.endDate) && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                      <CalendarRange className="h-3.5 w-3.5" />
                      {s.startDate ? format(s.startDate, "d MMM", { locale: es }) : "—"}
                      {" → "}
                      {s.endDate ? format(s.endDate, "d MMM yyyy", { locale: es }) : "—"}
                    </p>
                  )}
                </Link>
              );
            })
          )}
        </div>

        <div>
          <SprintForm />
        </div>
      </div>
    </div>
  );
}

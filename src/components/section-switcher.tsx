"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check, Stethoscope, Code2 } from "lucide-react";
import { SECTION_META, type SectionKey } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS: Record<SectionKey, React.ComponentType<{ className?: string }>> = {
  ESCALAS_MEDICAS: Stethoscope,
  PROGRAMACION: Code2,
};

export function SectionSwitcher({
  allowed,
  active,
  collapsed,
}: {
  allowed: SectionKey[];
  active: SectionKey | null;
  collapsed: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  if (!active || allowed.length === 0) return null;

  const meta = SECTION_META[active];
  const ActiveIcon = ICONS[active];
  const single = allowed.length === 1;

  async function pick(section: SectionKey) {
    setOpen(false);
    if (section === active) return;
    setSaving(true);
    await fetch("/api/section", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section }),
    });
    // Recarga completa con los datos de la nueva sección. Si estamos dentro de
    // una tarea/idea/sprint concretos (que no existen en la otra sección),
    // volvemos a su listado para evitar un "no encontrado".
    const path = window.location.pathname;
    const detail = /^\/(tasks|ideas|sprints)\/.+/.exec(path);
    window.location.assign(detail ? `/${detail[1]}` : path);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => !single && setOpen((v) => !v)}
        disabled={single || saving}
        title={meta.label}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-2 text-left transition",
          !single && "hover:bg-slate-800",
          collapsed ? "lg:justify-center lg:px-0" : "",
        )}
      >
        <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", meta.accent)}>
          <ActiveIcon className="h-4 w-4 text-white" />
        </span>
        <span className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}>
          <span className="block text-[10px] uppercase tracking-wide text-slate-500">Sección</span>
          <span className="block truncate text-sm font-semibold text-white">{meta.label}</span>
        </span>
        {!single && (
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400", collapsed && "lg:hidden")} />
        )}
      </button>

      {open && !single && (
        <div className="absolute left-0 right-0 top-full z-[60] mt-1 overflow-hidden rounded-lg border border-slate-700 bg-slate-800 shadow-xl">
          {allowed.map((s) => {
            const m = SECTION_META[s];
            const Icon = ICONS[s];
            return (
              <button
                key={s}
                onClick={() => pick(s)}
                className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-700"
              >
                <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", m.accent)}>
                  <Icon className="h-3.5 w-3.5 text-white" />
                </span>
                <span className="flex-1 truncate">{m.label}</span>
                {s === active && <Check className="h-4 w-4 text-blue-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

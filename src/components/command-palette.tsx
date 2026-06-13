"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ListChecks, Lightbulb, Rocket, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Result = { id: string | number; label: string; href: string };
type Group = { key: string; title: string; icon: React.ComponentType<{ className?: string }>; items: Result[] };

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const flat = groups.flatMap((g) => g.items);

  // Atajo de teclado + evento para abrir desde un botón.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      setQ("");
      setGroups([]);
      setActive(0);
    }
  }, [open]);

  const runSearch = useCallback(async (term: string) => {
    if (term.trim().length < 2) {
      setGroups([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
    setLoading(false);
    if (!res.ok) return;
    const data = await res.json();
    const next: Group[] = [
      {
        key: "tasks",
        title: "Tareas",
        icon: ListChecks,
        items: (data.tasks ?? []).map((t: { id: number; title: string }) => ({
          id: t.id,
          label: `#${t.id} · ${t.title}`,
          href: `/tasks/${t.id}`,
        })),
      },
      {
        key: "ideas",
        title: "Ideas",
        icon: Lightbulb,
        items: (data.ideas ?? []).map((i: { id: string; title: string }) => ({
          id: i.id,
          label: i.title,
          href: `/ideas/${i.id}`,
        })),
      },
      {
        key: "sprints",
        title: "Sprints",
        icon: Rocket,
        items: (data.sprints ?? []).map((s: { id: string; name: string }) => ({
          id: s.id,
          label: s.name,
          href: `/sprints/${s.id}`,
        })),
      },
    ].filter((g) => g.items.length > 0);
    setGroups(next);
    setActive(0);
  }, []);

  function onChange(value: string) {
    setQ(value);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => runSearch(value), 250);
  }

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && flat[active]) {
      e.preventDefault();
      go(flat[active].href);
    }
  }

  if (!open) return null;

  let runningIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center bg-slate-900/40 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 dark:border-slate-700">
          {loading ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-400" />
          ) : (
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
          )}
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Buscar tareas, ideas y sprints…"
            className="w-full bg-transparent py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
          />
          <kbd className="hidden shrink-0 rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-400 sm:inline dark:border-slate-600">
            ESC
          </kbd>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-2">
          {flat.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
              {q.trim().length < 2 ? "Escribe para buscar…" : "Sin resultados"}
            </p>
          ) : (
            groups.map((g) => {
              const Icon = g.icon;
              return (
                <div key={g.key} className="mb-1">
                  <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {g.title}
                  </p>
                  {g.items.map((item) => {
                    runningIndex++;
                    const idx = runningIndex;
                    return (
                      <button
                        key={`${g.key}-${item.id}`}
                        onClick={() => go(item.href)}
                        onMouseEnter={() => setActive(idx)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition",
                          idx === active
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : "text-slate-700 dark:text-slate-300",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  FileJson,
  ClipboardCopy,
  Check,
  ListChecks,
  ListTree,
  Lightbulb,
  AlertTriangle,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const EXAMPLE = `{
  "tasks": [
    {
      "title": "Configurar autenticación",
      "description": "Login con JWT y control de roles",
      "priority": "HIGH",
      "hours": 8,
      "labels": ["backend", "seguridad"],
      "dueBucket": "WEEK",
      "links": ["https://docs.ejemplo.com"],
      "subtasks": [
        { "title": "Modelo de usuario", "priority": "MEDIUM" },
        { "title": "Middleware de sesión", "priority": "HIGH", "hours": 3 }
      ]
    }
  ],
  "ideas": [
    {
      "title": "Modo sin conexión",
      "body": "Poder trabajar y sincronizar después",
      "category": "feature"
    }
  ]
}`;

const PROMPT = `Genérame tareas (con subtareas) e ideas para mi gestor de proyectos.
Devuélvelo EXCLUSIVAMENTE como un único JSON con este formato, sin texto ni explicaciones alrededor:

${EXAMPLE}

Reglas:
- "priority": uno de LOW, MEDIUM, HIGH, URGENT (por defecto MEDIUM).
- "dueBucket": uno de NONE, TODAY, WEEK (por defecto NONE).
- "dueDate": fecha opcional con formato AAAA-MM-DD.
- "labels" y "links": listas de texto, opcionales.
- "subtasks": lista opcional dentro de cada tarea (no se anidan más niveles).
- No incluyas responsables ni estados: las tareas se crean como "Pendiente" y se asignan a mano.

Contexto del proyecto para el que quiero las tareas e ideas:
<<DESCRIBE AQUÍ TU PROYECTO O NECESIDAD>>`;

type Parsed = {
  ok: boolean;
  error?: string;
  tasks: { title: string; subs: number }[];
  ideas: { title: string }[];
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : null;
}
function titleOf(v: unknown): string | null {
  const r = asRecord(v);
  if (r && typeof r.title === "string" && r.title.trim()) return r.title.trim();
  return null;
}

function analyze(text: string): Parsed {
  if (!text.trim()) return { ok: false, tasks: [], ideas: [] };
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, tasks: [], ideas: [], error: "El texto no es un JSON válido." };
  }
  if (Array.isArray(data)) data = { tasks: data };
  const r = asRecord(data);
  if (!r) {
    return { ok: false, tasks: [], ideas: [], error: 'El JSON debe ser un objeto con "tasks" y/o "ideas".' };
  }
  const rawTasks = Array.isArray(r.tasks) ? r.tasks : [];
  const rawIdeas = Array.isArray(r.ideas) ? r.ideas : [];

  const tasks = rawTasks
    .map((t): { title: string; subs: number } | null => {
      const title = titleOf(t);
      if (!title) return null;
      const tr = asRecord(t);
      const subs = tr && Array.isArray(tr.subtasks) ? tr.subtasks.filter((s) => titleOf(s)).length : 0;
      return { title, subs };
    })
    .filter((x): x is { title: string; subs: number } => x !== null);

  const ideas = rawIdeas
    .map((i) => titleOf(i))
    .filter((t): t is string => t !== null)
    .map((title) => ({ title }));

  if (tasks.length === 0 && ideas.length === 0) {
    return { ok: false, tasks: [], ideas: [], error: "No se han encontrado tareas ni ideas con título." };
  }
  return { ok: true, tasks, ideas };
}

export function Importer({ sectionLabel }: { sectionLabel: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [showFormat, setShowFormat] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [result, setResult] = useState<{ tasks: number; subtasks: number; ideas: number } | null>(null);

  const parsed = useMemo(() => analyze(text), [text]);
  const subTotal = parsed.tasks.reduce((n, t) => n + t.subs, 0);

  async function copy(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
    } catch {
      toast({ type: "error", message: "No se pudo copiar" });
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result ?? ""));
    reader.readAsText(file);
    e.target.value = "";
  }

  async function doImport() {
    setBusy(true);
    setResult(null);
    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: text,
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setResult(json.created);
      setText("");
      toast({
        type: "success",
        message: `Importado: ${json.created.tasks} tareas, ${json.created.subtasks} subtareas, ${json.created.ideas} ideas`,
      });
      router.refresh();
    } else {
      toast({ type: "error", message: json.error ?? "No se pudo importar" });
    }
  }

  const copyBtn = (key: string, value: string, label: string) => (
    <button
      onClick={() => copy(key, value)}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
    >
      {copied === key ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
      {copied === key ? "Copiado" : label}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Formato + plantilla para la IA */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <button
          onClick={() => setShowFormat((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-5 py-4 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Formato y plantilla para la IA
          </span>
          <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", showFormat && "rotate-180")} />
        </button>
        {showFormat && (
          <div className="space-y-4 border-t border-slate-100 px-5 py-4 dark:border-slate-700">
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Pega esto a la IA
                </p>
                {copyBtn("prompt", PROMPT, "Copiar plantilla")}
              </div>
              <pre className="max-h-56 overflow-auto rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 dark:bg-slate-900 dark:text-slate-300">
{PROMPT}
              </pre>
            </div>
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Ejemplo de JSON válido
                </p>
                {copyBtn("example", EXAMPLE, "Copiar ejemplo")}
              </div>
              <pre className="max-h-56 overflow-auto rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 dark:bg-slate-900 dark:text-slate-300">
{EXAMPLE}
              </pre>
            </div>
          </div>
        )}
      </section>

      {/* Entrada de JSON */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Pega o sube el JSON</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <FileJson className="h-3.5 w-3.5" />
            Subir archivo .json
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} className="hidden" />
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          placeholder='{ "tasks": [ ... ], "ideas": [ ... ] }'
          className="h-56 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-mono text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />

        {/* Estado del análisis */}
        {parsed.error && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {parsed.error}
          </p>
        )}
      </section>

      {/* Vista previa */}
      {parsed.ok && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Vista previa</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <ListChecks className="h-3 w-3" /> {parsed.tasks.length} tareas
            </span>
            {subTotal > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                <ListTree className="h-3 w-3" /> {subTotal} subtareas
              </span>
            )}
            {parsed.ideas.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                <Lightbulb className="h-3 w-3" /> {parsed.ideas.length} ideas
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {parsed.tasks.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Tareas</p>
                <ul className="space-y-1">
                  {parsed.tasks.map((t, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <ListChecks className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{t.title}</span>
                      {t.subs > 0 && (
                        <span className="shrink-0 rounded-full bg-slate-100 px-1.5 text-[11px] text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                          ↳ {t.subs}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {parsed.ideas.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Ideas</p>
                <ul className="space-y-1">
                  {parsed.ideas.map((idea, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Lightbulb className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                      <span className="truncate">{idea.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-700">
            <button
              onClick={doImport}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
            >
              <Upload className="h-4 w-4" />
              {busy ? "Importando…" : `Importar a ${sectionLabel}`}
            </button>
            <p className="text-xs text-slate-400">Se crean como “Pendiente” y sin responsable.</p>
          </div>
        </section>
      )}

      {/* Resultado */}
      {result && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-900/20">
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            <Check className="h-4 w-4" />
            Importación completada
          </p>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
            {result.tasks} tareas, {result.subtasks} subtareas y {result.ideas} ideas creadas en {sectionLabel}.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/tasks"
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100 dark:bg-slate-800 dark:text-emerald-300"
            >
              Ver tareas
            </Link>
            {result.subtasks > 0 && (
              <Link
                href="/subtasks"
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100 dark:bg-slate-800 dark:text-emerald-300"
              >
                Ver subtareas
              </Link>
            )}
            {result.ideas > 0 && (
              <Link
                href="/ideas"
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100 dark:bg-slate-800 dark:text-emerald-300"
              >
                Ver ideas
              </Link>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { SECTION_META, SECTION_ORDER, type SectionKey } from "@/lib/constants";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-blue-900/30";

export function UserForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [sections, setSections] = useState<SectionKey[]>(["PROGRAMACION"]);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);

  function toggleSection(s: SectionKey) {
    setSections((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setOk(false);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, sections }),
    });
    setSaving(false);
    if (res.ok) {
      setName("");
      setEmail("");
      setPassword("");
      setRole("USER");
      setSections(["PROGRAMACION"]);
      setOk(true);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo crear el usuario");
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Crear usuario</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre"
        required
        className={inputClass}
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className={inputClass}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña (mín. 6 caracteres)"
        required
        className={inputClass}
      />
      <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
        <option value="USER">Usuario</option>
        <option value="ADMIN">Administrador</option>
      </select>

      <div>
        <p className="mb-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
          Secciones con acceso
        </p>
        <div className="flex flex-col gap-2">
          {SECTION_ORDER.map((s) => {
            const checked = sections.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSection(s)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition",
                  checked
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
                    : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300",
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border",
                    checked ? "border-blue-500 bg-blue-500 text-white" : "border-slate-300 dark:border-slate-500",
                  )}
                >
                  {checked && "✓"}
                </span>
                {SECTION_META[s].label}
              </button>
            );
          })}
        </div>
        {role === "ADMIN" && (
          <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
            Los administradores acceden a todas las secciones igualmente.
          </p>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800">
          {error}
        </p>
      )}
      {ok && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800">
          Usuario creado correctamente.
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
      >
        <UserPlus className="h-4 w-4" />
        {saving ? "Creando…" : "Crear usuario"}
      </button>
    </form>
  );
}

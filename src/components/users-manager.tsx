"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

type U = { id: string; name: string; email: string; role: string; created: string };

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={
        role === "ADMIN"
          ? "rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200"
          : "rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200"
      }
    >
      {role === "ADMIN" ? "Administrador" : "Usuario"}
    </span>
  );
}

export function UsersManager({ users }: { users: U[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "USER", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startEdit(u: U) {
    setEditing(u.id);
    setForm({ name: u.name, email: u.email, role: u.role, password: "" });
    setError(null);
  }

  async function save(id: string) {
    setSaving(true);
    setError(null);
    const payload: Record<string, string> = {
      name: form.name,
      email: form.email,
      role: form.role,
    };
    if (form.password) payload.password = form.password;

    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(null);
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "No se pudo guardar");
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-[1fr_1.4fr_8rem_7rem_5rem] gap-3 border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <span>Nombre</span>
        <span>Email</span>
        <span>Rol</span>
        <span className="text-right">Alta</span>
        <span></span>
      </div>

      {users.map((u) => (
        <div key={u.id} className="border-b border-slate-50 last:border-0">
          <div className="grid grid-cols-[1fr_1.4fr_8rem_7rem_5rem] items-center gap-3 px-5 py-3.5 text-sm">
            <span className="font-medium text-slate-900">{u.name}</span>
            <span className="truncate text-slate-600">{u.email}</span>
            <span>
              <RoleBadge role={u.role} />
            </span>
            <span className="text-right text-xs text-slate-400">{u.created}</span>
            <span className="text-right">
              <button
                onClick={() => (editing === u.id ? setEditing(null) : startEdit(u))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </button>
            </span>
          </div>

          {editing === u.id && (
            <div className="space-y-3 bg-slate-50 px-5 py-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Nombre</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Rol</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className={inputClass}
                  >
                    <option value="USER">Usuario</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Nueva contraseña (opcional)
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Dejar en blanco para no cambiar"
                    className={inputClass}
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200">
                  {error}
                </p>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => save(u.id)}
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? "Guardando…" : "Guardar"}
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

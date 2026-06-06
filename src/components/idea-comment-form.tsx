"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function IdeaCommentForm({ ideaId }: { ideaId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/ideas/${ideaId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: body.trim() }),
    });
    setSaving(false);
    if (res.ok) {
      setBody("");
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "No se pudo enviar");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="Añade un comentario, comparte un enlace relevante o amplía la idea…"
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-blue-900/30"
      />
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={saving || !body.trim()}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
      >
        {saving ? "Enviando…" : "Comentar"}
      </button>
    </form>
  );
}

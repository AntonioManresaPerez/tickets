"use client";

import { useRef, useState } from "react";
import { Avatar } from "@/components/avatar";
import { cn } from "@/lib/utils";

type U = { id: string; name: string };

type Props = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
> & {
  value: string;
  onChange: (value: string) => void;
  users: U[];
};

/** Devuelve la consulta de mención activa (texto tras "@") o null. */
function mentionQuery(text: string, cursor: number): string | null {
  const before = text.slice(0, cursor);
  const m = /(?:^|\s)@([\p{L}]*)$/u.exec(before);
  return m ? m[1] : null;
}

export function MentionTextarea({ value, onChange, users, className, ...rest }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [active, setActive] = useState(0);

  const matches =
    query !== null
      ? users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
      : [];

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    onChange(text);
    const cursor = e.target.selectionStart ?? text.length;
    setQuery(mentionQuery(text, cursor));
    setActive(0);
  }

  function insert(u: U) {
    const el = ref.current;
    const cursor = el?.selectionStart ?? value.length;
    const before = value.slice(0, cursor).replace(/@([\p{L}]*)$/u, `@${u.name} `);
    const after = value.slice(cursor);
    onChange(before + after);
    setQuery(null);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(before.length, before.length);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (query === null || matches.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      insert(matches[active]);
    } else if (e.key === "Escape") {
      setQuery(null);
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setQuery(null), 120)}
        className={className}
        {...rest}
      />
      {query !== null && matches.length > 0 && (
        <div className="absolute left-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
          {matches.map((u, i) => (
            <button
              type="button"
              key={u.id}
              onMouseDown={(e) => {
                e.preventDefault();
                insert(u);
              }}
              onMouseEnter={() => setActive(i)}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition",
                i === active
                  ? "bg-blue-50 dark:bg-blue-900/30"
                  : "hover:bg-slate-50 dark:hover:bg-slate-700/50",
              )}
            >
              <Avatar name={u.name} size="xs" />
              <span className="truncate text-slate-700 dark:text-slate-300">{u.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

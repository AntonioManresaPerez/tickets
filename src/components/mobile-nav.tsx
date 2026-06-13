"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ListChecks, Columns3, Lightbulb, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionPayload } from "@/lib/auth";

type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean };

const LEFT: Item[] = [
  { href: "/", label: "Inicio", icon: LayoutGrid, exact: true },
  { href: "/tasks", label: "Tareas", icon: ListChecks },
];
const RIGHT: Item[] = [
  { href: "/board", label: "Tablero", icon: Columns3 },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
];

function NavLink({ item, pathname }: { item: Item; pathname: string }) {
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition",
        active ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500",
      )}
    >
      <Icon className="h-5 w-5" />
      {item.label}
    </Link>
  );
}

export function MobileNav({ session }: { session: SessionPayload }) {
  const pathname = usePathname();
  // No mostrar en /tasks/new para no tapar el formulario con el FAB redundante
  void session;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-800/95 lg:hidden">
      <div className="relative mx-auto flex max-w-md items-stretch">
        {LEFT.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}

        {/* Hueco central para el FAB */}
        <div className="flex w-16 shrink-0 items-start justify-center">
          <Link
            href="/tasks/new"
            aria-label="Nueva tarea"
            className="-mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition active:scale-95"
          >
            <Plus className="h-6 w-6" />
          </Link>
        </div>

        {RIGHT.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </div>
      {/* Safe-area para iPhone */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

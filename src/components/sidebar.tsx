"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  ListChecks,
  CalendarDays,
  Plus,
  Users,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SessionPayload } from "@/lib/auth";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutGrid, exact: true },
  { href: "/tasks", label: "Tareas", icon: ListChecks },
  { href: "/calendar", label: "Calendario", icon: CalendarDays },
  { href: "/tasks/new", label: "Nueva Tarea", icon: Plus, exact: true },
  { href: "/users", label: "Usuarios", icon: Users, adminOnly: true },
];

export function Sidebar({ session }: { session: SessionPayload }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const items = NAV.filter((i) => !i.adminOnly || session.role === "ADMIN");

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-md lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "flex shrink-0 flex-col bg-slate-900 text-slate-300",
          "fixed inset-y-0 left-0 z-50 w-64 transition-all duration-300 lg:static",
          collapsed ? "lg:w-16" : "lg:w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center border-b border-slate-800 py-4 transition-all duration-300",
            collapsed ? "lg:flex-col lg:gap-2 lg:px-0" : "gap-3 px-3",
          )}
        >
          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Logo */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <LayoutGrid className="h-5 w-5" />
          </div>

          {/* Title */}
          <div className={cn("flex-1 overflow-hidden", collapsed ? "lg:hidden" : "")}>
            <p className="whitespace-nowrap text-sm font-semibold text-white">Tickets</p>
            <p className="whitespace-nowrap text-xs text-slate-400">Gestión de tareas</p>
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-800 hover:text-white lg:flex"
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-2 py-3">
          {items.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  collapsed ? "lg:justify-center lg:px-0" : "gap-3",
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className={cn(collapsed && "lg:hidden")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 px-2 py-3">
          <div className={cn("mb-1 px-3", collapsed && "lg:hidden")}>
            <p className="truncate text-sm font-medium text-white">{session.name}</p>
            <p className="text-xs text-slate-400">
              {session.role === "ADMIN" ? "Administrador" : "Usuario"}
            </p>
          </div>
          <button
            onClick={logout}
            title={collapsed ? "Cerrar sesión" : undefined}
            className={cn(
              "flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white",
              collapsed ? "lg:justify-center lg:px-0" : "gap-3",
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={cn(collapsed && "lg:hidden")}>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}

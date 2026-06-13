"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
};

type ConfirmContextValue = {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm debe usarse dentro de ConfirmProvider");
  return ctx.confirm;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((o: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setOpts(o);
    });
  }, []);

  function close(value: boolean) {
    resolver.current?.(value);
    resolver.current = null;
    setOpts(null);
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {opts && (
        <div
          className="fixed inset-0 z-[95] flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => close(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-3">
              {opts.danger !== false && (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                </span>
              )}
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  {opts.title ?? "¿Confirmar?"}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{opts.message}</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => close(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={() => close(true)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition",
                  opts.danger === false
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-red-600 hover:bg-red-700",
                )}
              >
                {opts.confirmLabel ?? "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

import { Lock } from "lucide-react";

export default function NoAccessPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
          <Lock className="h-6 w-6 text-slate-400 dark:text-slate-500" />
        </div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Sin acceso a ninguna sección
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Tu cuenta todavía no tiene ninguna sección asignada. Pide a un administrador
          que te dé acceso a <span className="font-medium">Escalas médicas</span> o{" "}
          <span className="font-medium">Programación</span>.
        </p>
      </div>
    </div>
  );
}

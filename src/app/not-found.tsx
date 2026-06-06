import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-900">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <FileQuestion className="h-8 w-8 text-slate-400" />
          </div>
        </div>
        <h1 className="text-7xl font-bold text-slate-900 dark:text-slate-100">404</h1>
        <p className="mt-2 text-lg font-semibold text-slate-700 dark:text-slate-300">
          Página no encontrada
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          La página que buscas no existe o ha sido movida.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

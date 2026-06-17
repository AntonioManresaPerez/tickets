import { Upload } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { requireSection } from "@/lib/section";
import { SECTION_META } from "@/lib/constants";
import { Importer } from "@/components/importer";

export default async function ImportPage() {
  await requireUser();
  const section = await requireSection();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          <Upload className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          Importar
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Pega un JSON (generado con una IA) para crear tareas, subtareas e ideas de golpe en{" "}
          <span className="font-medium text-slate-700 dark:text-slate-300">{SECTION_META[section].label}</span>.
        </p>
      </div>

      <Importer sectionLabel={SECTION_META[section].label} />
    </div>
  );
}

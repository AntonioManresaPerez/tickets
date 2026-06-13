import { requireUser } from "@/lib/auth";
import { requireSection } from "@/lib/section";
import { IdeaForm } from "@/components/idea-form";

export default async function NewIdeaPage() {
  await requireUser();
  await requireSection();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Nueva idea
      </h1>
      <IdeaForm mode="create" />
    </div>
  );
}

import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { IdeaForm } from "@/components/idea-form";

export default async function EditIdeaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUser();
  const { id } = await params;

  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea) notFound();

  if (idea.authorId !== session.sub && session.role !== "ADMIN") {
    notFound();
  }

  const values = {
    id: idea.id,
    title: idea.title,
    body: idea.body ?? "",
    category: idea.category ?? "",
    links: idea.links,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Editar idea
      </h1>
      <IdeaForm mode="edit" idea={values} />
    </div>
  );
}

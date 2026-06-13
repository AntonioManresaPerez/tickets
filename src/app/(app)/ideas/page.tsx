import Link from "next/link";
import { Plus, MessageSquare, ThumbsUp, Link2, Lightbulb } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { requireSection } from "@/lib/section";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/utils";
import { IDEA_STATUS, IDEA_CATEGORIES, type IdeaStatusKey } from "@/lib/constants";

export default async function IdeasPage() {
  const session = await requireUser();
  const section = await requireSection();

  const ideas = await prisma.idea.findMany({
    where: { section },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { votes: true, comments: true } },
      votes: { where: { userId: session.sub }, select: { userId: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Ideas
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Propuestas, mejoras y planteamientos del equipo
          </p>
        </div>
        <Link
          href="/ideas/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nueva idea
        </Link>
      </div>

      {ideas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-700">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Lightbulb className="h-6 w-6 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="font-medium text-slate-700 dark:text-slate-300">No hay ideas todavía</p>
          <p className="mt-1 text-sm text-slate-400">Sé el primero en proponer algo al equipo.</p>
          <Link
            href="/ideas/new"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Crear la primera idea →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea) => {
            const hasVoted = idea.votes.length > 0;
            const status = IDEA_STATUS[idea.status as IdeaStatusKey];
            return (
              <Link
                key={idea.id}
                href={`/ideas/${idea.id}`}
                className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-700"
              >
                {/* Vote pill */}
                <div
                  className={`flex min-w-[3rem] flex-col items-center gap-0.5 rounded-xl border px-2 py-2 ${
                    hasVoted
                      ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400"
                  }`}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span className="text-sm font-bold">{idea._count.votes}</span>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      {idea.title}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${status.badge}`}
                    >
                      {status.label}
                    </span>
                    {idea.category && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:ring-slate-600">
                        {IDEA_CATEGORIES[idea.category] ?? idea.category}
                      </span>
                    )}
                  </div>
                  {idea.body && (
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                      {idea.body}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                    <span>{idea.author.name}</span>
                    <span>·</span>
                    <span>{timeAgo(idea.createdAt)}</span>
                    {idea._count.comments > 0 && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {idea._count.comments}
                        </span>
                      </>
                    )}
                    {idea.links.length > 0 && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Link2 className="h-3 w-3" />
                          {idea.links.length} enlace{idea.links.length !== 1 ? "s" : ""}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

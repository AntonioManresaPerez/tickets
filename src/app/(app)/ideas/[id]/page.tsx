import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Link2, Pencil, MessageSquare } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { canAccessSection, sectionUsers } from "@/lib/section";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/utils";
import { IDEA_STATUS, IDEA_CATEGORIES, type IdeaStatusKey } from "@/lib/constants";
import { IdeaVoteButton } from "@/components/idea-vote-button";
import { IdeaCommentForm } from "@/components/idea-comment-form";
import { DeleteIdeaCommentButton } from "@/components/delete-idea-comment-button";
import { IdeaStatusSelect } from "@/components/idea-status-select";
import { DeleteIdeaButton } from "@/components/delete-idea-button";

export default async function IdeaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUser();
  const { id } = await params;

  const idea = await prisma.idea.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { votes: true } },
      votes: { where: { userId: session.sub }, select: { userId: true } },
      comments: {
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!idea) notFound();
  if (!(await canAccessSection(idea.section))) notFound();

  const members = await sectionUsers(idea.section);

  const isOwner = idea.authorId === session.sub;
  const isAdmin = session.role === "ADMIN";
  const canEdit = isOwner || isAdmin;
  const hasVoted = idea.votes.length > 0;
  const status = IDEA_STATUS[idea.status as IdeaStatusKey];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/ideas"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Ideas
      </Link>

      {/* Main card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-start gap-5">
          <IdeaVoteButton
            ideaId={idea.id}
            initialVotes={idea._count.votes}
            initialVoted={hasVoted}
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {idea.title}
              </h1>
              {isAdmin ? (
                <IdeaStatusSelect ideaId={idea.id} status={idea.status as IdeaStatusKey} />
              ) : (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${status.badge}`}
                >
                  {status.label}
                </span>
              )}
              {idea.category && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:ring-slate-600">
                  {IDEA_CATEGORIES[idea.category] ?? idea.category}
                </span>
              )}
            </div>

            <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
              Propuesta por{" "}
              <span className="font-medium text-slate-600 dark:text-slate-400">
                {idea.author.name}
              </span>{" "}
              · {timeAgo(idea.createdAt)}
            </p>

            {idea.body && (
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {idea.body}
              </p>
            )}

            {idea.links.length > 0 && (
              <div className="mt-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Referencias
                </p>
                {idea.links.map((link, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm text-blue-600 transition hover:bg-blue-50 hover:underline dark:border-slate-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  >
                    <Link2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{link}</span>
                  </a>
                ))}
              </div>
            )}

            {canEdit && (
              <div className="mt-5 flex gap-2">
                <Link
                  href={`/ideas/${idea.id}/edit`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  <Pencil className="h-3 w-3" />
                  Editar
                </Link>
                <DeleteIdeaButton ideaId={idea.id} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-200">
          <MessageSquare className="h-4 w-4" />
          Comentarios ({idea.comments.length})
        </h2>

        {idea.comments.length > 0 && (
          <div className="space-y-2">
            {idea.comments.map((c) => (
              <div
                key={c.id}
                className="group flex gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {c.author.name}
                    </span>
                    <span>·</span>
                    <span>{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                    {c.body}
                  </p>
                </div>
                {(isAdmin || c.author.id === session.sub) && (
                  <DeleteIdeaCommentButton commentId={c.id} />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <IdeaCommentForm ideaId={idea.id} users={members} />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function IdeaVoteButton({
  ideaId,
  initialVotes,
  initialVoted,
}: {
  ideaId: string;
  initialVotes: number;
  initialVoted: boolean;
}) {
  const router = useRouter();
  const [voted, setVoted] = useState(initialVoted);
  const [votes, setVotes] = useState(initialVotes);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    const newVoted = !voted;
    setVoted(newVoted);
    setVotes((v) => v + (newVoted ? 1 : -1));
    await fetch(`/api/ideas/${ideaId}/vote`, { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={voted ? "Quitar voto" : "Votar por esta idea"}
      className={cn(
        "flex min-w-[3.5rem] flex-col items-center gap-1 rounded-xl border px-3 py-3 text-sm font-bold transition disabled:opacity-60",
        voted
          ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-blue-900/20",
      )}
    >
      <ThumbsUp className="h-4 w-4" />
      <span>{votes}</span>
    </button>
  );
}

import Link from "next/link";
import { User, Clock } from "lucide-react";
import { StatusBadge, PriorityBadge, DueBadge } from "./badges";
import { timeAgo } from "@/lib/utils";
import type { StatusKey, PriorityKey, DueBucketKey } from "@/lib/constants";

export type TaskCardData = {
  id: number;
  title: string;
  description: string | null;
  status: StatusKey;
  priority: PriorityKey;
  hours: number;
  dueBucket: DueBucketKey;
  createdAt: Date | string;
  assignee: { name: string } | null;
};

export function TaskCard({ task }: { task: TaskCardData }) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold leading-snug text-slate-900 dark:text-slate-100">{task.title}</h3>
        <span className="shrink-0 text-xs font-medium text-slate-400 dark:text-slate-500">#{task.id}</span>
      </div>

      {task.description && (
        <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{task.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
        <DueBadge bucket={task.dueBucket} />
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:ring-slate-600">
          <Clock className="h-3 w-3" />
          {task.hours}h
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
        <span className="flex items-center gap-1">
          <User className="h-3.5 w-3.5" />
          {task.assignee?.name ?? "Sin asignar"}
        </span>
        <span>{timeAgo(task.createdAt)}</span>
      </div>
    </Link>
  );
}

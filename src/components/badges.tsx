import {
  STATUS,
  PRIORITY,
  DUE_BUCKET,
  type StatusKey,
  type PriorityKey,
  type DueBucketKey,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: StatusKey }) {
  const s = STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        s.badge,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: PriorityKey }) {
  const p = PRIORITY[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        p.badge,
      )}
    >
      <span aria-hidden>{p.icon}</span>
      {p.label}
    </span>
  );
}

export function DueBadge({ bucket }: { bucket: DueBucketKey }) {
  if (bucket === "NONE") return null;
  const d = DUE_BUCKET[bucket];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        d.badge,
      )}
    >
      {d.label}
    </span>
  );
}

export function LabelTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-800">
      {children}
    </span>
  );
}

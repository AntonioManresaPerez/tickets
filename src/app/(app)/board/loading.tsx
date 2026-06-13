export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-36 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-96 w-[17rem] shrink-0 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
          />
        ))}
      </div>
    </div>
  );
}

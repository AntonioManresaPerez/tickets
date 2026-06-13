export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-32 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}

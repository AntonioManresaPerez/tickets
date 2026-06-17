export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-40 w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
          />
        ))}
      </div>
    </div>
  );
}

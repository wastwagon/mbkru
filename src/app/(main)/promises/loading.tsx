/** Instant shell while `/promises` SSR + DB work runs — avoids blank wait and pairs with `maxDuration` on the page. */
export default function PromisesSegmentLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="mx-auto h-9 max-w-md rounded-lg bg-[var(--muted)]/80" />
        <div className="mx-auto mt-4 h-4 max-w-2xl rounded bg-[var(--muted)]/60" />
        <div className="mx-auto mt-3 h-4 max-w-xl rounded bg-[var(--muted)]/50" />
        <ul className="mt-10 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-white">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="px-4 py-4">
              <div className="h-5 w-48 rounded bg-[var(--muted)]/70" />
              <div className="mt-2 h-3 w-72 max-w-full rounded bg-[var(--muted)]/45" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

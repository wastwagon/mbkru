type Props = {
  /** ISO timestamp or Date */
  generatedAt: string | Date;
  label?: string;
  className?: string;
};

function formatFreshness(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Live-data indicator for dashboards and accountability surfaces. */
export function DataFreshnessBadge({ generatedAt, label = "Data refreshed", className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-500/25 ${className}`}
      role="status"
    >
      <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      {label} · {formatFreshness(generatedAt)}
    </span>
  );
}

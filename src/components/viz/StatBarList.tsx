import type { NamedCount } from "@/lib/viz/dashboard-viz";

type Props = {
  items: NamedCount[];
  /** Basis for bar width — defaults to max count. */
  maxCount?: number;
  /** Bar fill color class or use per-item color. */
  barClassName?: string;
  emptyMessage?: string;
  /** Use gold accent (e.g. regional ranking). */
  accent?: "primary" | "gold";
};

/**
 * Horizontal ranking bars — kind mix, region ranking, playbook counts.
 */
export function StatBarList({
  items,
  maxCount,
  barClassName,
  emptyMessage = "No data yet.",
  accent = "primary",
}: Props) {
  if (items.length === 0) {
    return <p className="mt-4 text-sm text-[var(--foreground-secondary)]">{emptyMessage}</p>;
  }

  const peak = maxCount ?? Math.max(1, ...items.map((i) => i.count));
  const fillClass =
    barClassName ??
    (accent === "gold" ? "bg-[var(--accent-gold)]/90" : "bg-[var(--primary)]/80");

  return (
    <ul className="mt-4 space-y-3" aria-label="Named counts">
      {items.map((item) => (
        <li key={item.key}>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-[var(--foreground)]">{item.label}</span>
            <span className="shrink-0 font-semibold tabular-nums text-[var(--primary)]">{item.count}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--section-light)]" aria-hidden>
            <div
              className={`h-full rounded-full ${item.color ? "" : fillClass}`}
              style={{
                width: `${Math.min(100, (item.count / peak) * 100)}%`,
                ...(item.color ? { background: item.color } : {}),
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

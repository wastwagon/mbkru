import {
  CITIZEN_REPORT_STATUS_COLORS,
  conicGradientFromCounts,
  type NamedCount,
} from "@/lib/viz/dashboard-viz";

type Props = {
  items: NamedCount[];
  /** Center label under the total. */
  centerCaption?: string;
  emptyMessage?: string;
  colorMap?: Record<string, string>;
};

/**
 * CSS conic-gradient donut with legend — workflow / status mix.
 */
export function StatusDonut({
  items,
  centerCaption = "Total",
  emptyMessage = "No data in window.",
  colorMap = CITIZEN_REPORT_STATUS_COLORS,
}: Props) {
  const total = items.reduce((s, i) => s + i.count, 0);
  if (total <= 0 || items.length === 0) {
    return <p className="mt-4 text-sm text-[var(--foreground-secondary)]">{emptyMessage}</p>;
  }

  const sorted = [...items].sort((a, b) => b.count - a.count);
  const gradient = conicGradientFromCounts(
    sorted.map((i) => ({
      count: i.count,
      color: i.color ?? colorMap[i.key] ?? "rgb(148 163 184)",
    })),
  );

  return (
    <div className="mt-6 flex flex-wrap items-start gap-8">
      <div
        className="relative mx-auto h-36 w-36 shrink-0 sm:mx-0"
        role="img"
        aria-label={`${centerCaption}: ${total}. ${sorted.map((i) => `${i.label} ${i.count}`).join(", ")}`}
      >
        <div
          className="absolute inset-0 rounded-full shadow-inner ring-1 ring-black/5"
          style={{ background: `conic-gradient(${gradient})` }}
          aria-hidden
        />
        <div
          className="absolute inset-[22%] flex flex-col items-center justify-center rounded-full bg-[var(--card)] ring-1 ring-[var(--border)]"
          aria-hidden
        >
          <span className="font-display text-2xl font-bold tabular-nums text-[var(--foreground)]">{total}</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--foreground-secondary)]">
            {centerCaption}
          </span>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-2 text-sm">
        {sorted.map((item) => {
          const color = item.color ?? colorMap[item.key] ?? "rgb(148 163 184)";
          return (
            <li key={item.key} className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2 text-[var(--foreground-secondary)]">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden />
                <span className="truncate">{item.label}</span>
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-[var(--foreground)]">{item.count}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

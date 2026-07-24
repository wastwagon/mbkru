import type { ReactNode } from "react";

export type SparklinePoint = {
  key: string;
  value: number;
  /** Optional short label for sr-only table / title. */
  label?: string;
};

type Props = {
  points: SparklinePoint[];
  /** Accessible chart name. */
  ariaLabel?: string;
  className?: string;
  /** Bar fill — CSS color or leave default primary gradient class. */
  barClassName?: string;
  emptyFallback?: ReactNode;
};

/**
 * Compact CSS sparkline (no chart library) — admin tiles, trend chips.
 */
export function Sparkline({
  points,
  ariaLabel = "Trend sparkline",
  className = "",
  barClassName = "bg-[var(--primary)]/80",
  emptyFallback = null,
}: Props) {
  if (points.length === 0) return emptyFallback;

  const max = Math.max(1, ...points.map((p) => p.value));
  const summary = points.map((p) => `${p.label ?? p.key}: ${p.value}`).join("; ");

  return (
    <div className={`min-w-0 ${className}`.trim()}>
      <div
        className="flex h-10 items-end gap-px sm:h-11"
        role="img"
        aria-label={`${ariaLabel}. ${summary}`}
      >
        {points.map((p) => {
          const h = Math.max(p.value > 0 ? 12 : 4, (p.value / max) * 100);
          return (
            <div
              key={p.key}
              className={`min-w-0 flex-1 rounded-t-[2px] ${barClassName}`}
              style={{ height: `${h}%` }}
              title={p.label ? `${p.label}: ${p.value}` : `${p.key}: ${p.value}`}
              aria-hidden
            />
          );
        })}
      </div>
      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col">Count</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={`t-${p.key}`}>
              <td>{p.label ?? p.key}</td>
              <td>{p.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

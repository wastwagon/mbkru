import { formatYearMonthLabel, type MonthCount } from "@/lib/viz/dashboard-viz";

type Props = {
  months: MonthCount[];
  emptyMessage?: string;
  ariaLabel?: string;
};

/**
 * Vertical month bars for submission / event trends.
 */
export function MonthTrendBars({
  months,
  emptyMessage = "No data in this window.",
  ariaLabel = "Monthly counts bar chart",
}: Props) {
  if (months.length === 0) {
    return <p className="mt-4 text-sm text-[var(--foreground-secondary)]">{emptyMessage}</p>;
  }

  const maxMonth = Math.max(1, ...months.map((m) => m.count));
  const summary = months
    .map((m) => `${formatYearMonthLabel(m.yearMonth)}: ${m.count}`)
    .join("; ");

  return (
    <div className="mt-6">
      <div
        className="flex items-end gap-1.5 sm:gap-2"
        role="img"
        aria-label={`${ariaLabel}. ${summary}`}
      >
        {months.map((m) => {
          const h = Math.max(4, (m.count / maxMonth) * 100);
          return (
            <div key={m.yearMonth} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <span className="text-[10px] font-semibold tabular-nums text-[var(--primary)] sm:text-xs" aria-hidden>
                {m.count}
              </span>
              <div className="flex h-28 w-full items-end sm:h-36" aria-hidden>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-[var(--primary-dark)] to-[var(--primary)]/85 transition-all"
                  style={{ height: `${h}%` }}
                  title={`${formatYearMonthLabel(m.yearMonth)}: ${m.count}`}
                />
              </div>
              <span
                className="max-w-full truncate text-[9px] font-medium text-[var(--foreground-secondary)] sm:text-[10px]"
                aria-hidden
              >
                {formatYearMonthLabel(m.yearMonth)}
              </span>
            </div>
          );
        })}
      </div>
      <table className="sr-only">
        <caption>Monthly counts</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Count</th>
          </tr>
        </thead>
        <tbody>
          {months.map((m) => (
            <tr key={`t-${m.yearMonth}`}>
              <td>{formatYearMonthLabel(m.yearMonth)}</td>
              <td>{m.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

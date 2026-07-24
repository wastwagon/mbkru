/**
 * Shared dashboard viz atoms (CSS-first — no chart library).
 * Used by public transparency and admin analytics for visual parity.
 */

export type NamedCount = {
  key: string;
  label: string;
  count: number;
  /** Optional legend / bar color (CSS color). */
  color?: string;
};

export type MonthCount = {
  yearMonth: string;
  count: number;
};

/** Default workflow status colors for citizen reports. */
export const CITIZEN_REPORT_STATUS_COLORS: Record<string, string> = {
  RECEIVED: "rgb(148 163 184)",
  UNDER_REVIEW: "rgb(14 165 233)",
  ESCALATED: "rgb(99 102 241)",
  REFERRED: "rgb(168 85 247)",
  RESOLVED: "rgb(16 185 129)",
  CLOSED: "rgb(100 116 139)",
  ARCHIVED: "rgb(148 163 184)",
  REJECTED: "rgb(244 63 94)",
};

export function formatYearMonthLabel(yearMonth: string): string {
  const [y, m] = yearMonth.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}

export function conicGradientFromCounts(
  entries: Array<{ count: number; color: string }>,
): string {
  const total = entries.reduce((s, e) => s + e.count, 0);
  if (total <= 0) return "transparent 0% 100%";
  let cursor = 0;
  const stops: string[] = [];
  for (const { count, color } of entries) {
    if (count <= 0) continue;
    const pct = (count / total) * 100;
    stops.push(`${color} ${cursor}% ${cursor + pct}%`);
    cursor += pct;
  }
  return stops.length > 0 ? stops.join(", ") : "transparent 0% 100%";
}

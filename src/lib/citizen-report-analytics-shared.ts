/** Pure helpers + types for citizen-report aggregates (no Prisma — safe for tests and client bundles). */

export const CITIZEN_REPORT_ANALYTICS_MAX_MONTHS = 36;

export type CitizenReportAnalytics = {
  generatedAt: string;
  windowMonths: number;
  windowSince: string;
  totals: {
    all: number;
    inWindow: number;
    /** All-time counts by report kind. */
    byKind: Record<string, number>;
    /** All-time counts by workflow status. */
    byStatus: Record<string, number>;
    /** Rolling window counts by kind (matches monthly chart window). */
    byKindInWindow: Record<string, number>;
    byStatusInWindow: Record<string, number>;
    withAttachments: number;
    slaOpenOverdue: number;
  };
  /** Ops playbook tag (`operationsPlaybookKey`); empty string = unset. */
  byPlaybookAll: Array<{ key: string; count: number }>;
  byPlaybookInWindow: Array<{ key: string; count: number }>;
  /** Public cause threads (no body text; counts only). */
  publicCauses: {
    withThread: number;
    threadLive: number;
    threadClosed: number;
  };
  byRegion: Array<{ regionId: string; regionSlug: string; regionName: string; count: number }>;
  byMonth: Array<{ yearMonth: string; count: number }>;
};

/** Parse `?months=` for analytics routes (1–36). */
export function parseCitizenReportAnalyticsMonthsParam(raw: string | null): number | undefined {
  if (raw === null || raw === "") return undefined;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return undefined;
  return Math.min(CITIZEN_REPORT_ANALYTICS_MAX_MONTHS, Math.max(1, n));
}

const CSV_EOL = "\r\n";

function csvEscape(cell: string): string {
  if (/[",\r\n]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`;
  return cell;
}

/** UTF-8 CSV for board / ops reporting — no PII columns. */
export function citizenReportAnalyticsToCsv(data: CitizenReportAnalytics): string {
  const lines: string[] = [];
  const row = (cells: string[]) => cells.map(csvEscape).join(",");

  lines.push(row(["section", "metric", "value"]));
  lines.push(row(["meta", "generatedAt", data.generatedAt]));
  lines.push(row(["meta", "windowMonths", String(data.windowMonths)]));
  lines.push(row(["meta", "windowSince", data.windowSince]));
  lines.push(row(["totals", "all", String(data.totals.all)]));
  lines.push(row(["totals", "inWindow", String(data.totals.inWindow)]));
  lines.push(row(["totals", "withAttachments", String(data.totals.withAttachments)]));
  lines.push(row(["totals", "slaOpenOverdue", String(data.totals.slaOpenOverdue)]));
  lines.push(row(["publicCauses", "withThread", String(data.publicCauses.withThread)]));
  lines.push(row(["publicCauses", "threadLive", String(data.publicCauses.threadLive)]));
  lines.push(row(["publicCauses", "threadClosed", String(data.publicCauses.threadClosed)]));
  lines.push(row([]));

  lines.push(row(["byKind", "kind", "count"]));
  for (const [k, n] of Object.entries(data.totals.byKind)) {
    lines.push(row(["byKind", k, String(n)]));
  }
  lines.push(row([]));
  lines.push(row(["byStatus", "status", "count"]));
  for (const [k, n] of Object.entries(data.totals.byStatus)) {
    lines.push(row(["byStatus", k, String(n)]));
  }
  lines.push(row([]));
  lines.push(row(["byKindInWindow", "kind", "count"]));
  for (const [k, n] of Object.entries(data.totals.byKindInWindow)) {
    lines.push(row(["byKindInWindow", k, String(n)]));
  }
  lines.push(row([]));
  lines.push(row(["byStatusInWindow", "status", "count"]));
  for (const [k, n] of Object.entries(data.totals.byStatusInWindow)) {
    lines.push(row(["byStatusInWindow", k, String(n)]));
  }
  lines.push(row([]));
  lines.push(row(["byPlaybookAll", "playbookKey", "count"]));
  for (const { key, count } of data.byPlaybookAll) {
    lines.push(row(["byPlaybookAll", key || "(unassigned)", String(count)]));
  }
  lines.push(row([]));
  lines.push(row(["byPlaybookInWindow", "playbookKey", "count"]));
  for (const { key, count } of data.byPlaybookInWindow) {
    lines.push(row(["byPlaybookInWindow", key || "(unassigned)", String(count)]));
  }
  lines.push(row([]));
  lines.push(row(["byRegion", "regionId", "regionSlug", "regionName", "count"]));
  for (const r of data.byRegion) {
    lines.push(row(["byRegion", r.regionId, r.regionSlug, r.regionName, String(r.count)]));
  }
  lines.push(row([]));
  lines.push(row(["byMonth", "yearMonth", "count"]));
  for (const m of data.byMonth) {
    lines.push(row(["byMonth", m.yearMonth, String(m.count)]));
  }

  return lines.join(CSV_EOL);
}

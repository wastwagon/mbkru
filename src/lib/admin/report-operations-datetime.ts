import type { CitizenReportStatus } from "@prisma/client";

/** Admin SLA field: `datetime-local` value is interpreted as UTC wall time (label inputs accordingly). */

export function formatUtcForDatetimeLocalInput(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

/** Parse value from `datetime-local` when the user edited UTC components. */
export function parseUtcDatetimeLocalInput(raw: string): Date | null {
  const t = raw.trim();
  if (!t) return null;
  const d = new Date(t.endsWith("Z") ? t : `${t}Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

const TERMINAL: CitizenReportStatus[] = ["CLOSED", "ARCHIVED"];

/** Server/admin triage: compares against request-time clock (not a cached static page). */
export function isCitizenReportSlaOverdue(
  slaDueAt: Date | null | undefined,
  status: CitizenReportStatus,
): boolean {
  if (slaDueAt == null) return false;
  if (TERMINAL.includes(status)) return false;
  return slaDueAt.getTime() < Date.now();
}

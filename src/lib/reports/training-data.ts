import type { Prisma } from "@prisma/client";

/** Prefixes used by `prisma/seed.mjs` demo and seed citizen reports — not real programme intake. */
export const TRAINING_CITIZEN_REPORT_TRACKING_PREFIXES = ["MBKRU-DEMO-", "MBKRU-SEED-"] as const;

const TESTING_PHASE_TITLE_RE = /testing\s+phase/i;

/**
 * Whether public surfaces (Report Card browse, transparency stats, homepage counts)
 * should hide training/demo/seed citizen reports.
 *
 * - Production: exclude by default (safe for mbkru.org).
 * - Local/staging: include unless `EXCLUDE_TRAINING_DATA_FROM_PUBLIC=1`.
 * - Override either way with `INCLUDE_TRAINING_DATA_ON_PUBLIC=1` (demo decks).
 */
export function excludeTrainingDataFromPublicSurfaces(): boolean {
  if (process.env.INCLUDE_TRAINING_DATA_ON_PUBLIC === "1") return false;
  if (process.env.EXCLUDE_TRAINING_DATA_FROM_PUBLIC === "1") return true;
  return process.env.NODE_ENV === "production";
}

export function isTrainingCitizenReportTrackingCode(trackingCode: string): boolean {
  const code = trackingCode.trim().toUpperCase();
  return TRAINING_CITIZEN_REPORT_TRACKING_PREFIXES.some((p) => code.startsWith(p));
}

export function isTrainingCitizenReportTitle(title: string): boolean {
  return TESTING_PHASE_TITLE_RE.test(title.trim());
}

export function isTrainingCitizenReport(row: { trackingCode: string; title: string }): boolean {
  return (
    isTrainingCitizenReportTrackingCode(row.trackingCode) ||
    isTrainingCitizenReportTitle(row.title)
  );
}

/** Match clause for training rows (demo prefix or Testing Phase title). */
export function trainingCitizenReportMatchWhere(): Prisma.CitizenReportWhereInput {
  return {
    OR: [
      ...TRAINING_CITIZEN_REPORT_TRACKING_PREFIXES.map((prefix) => ({
        trackingCode: { startsWith: prefix },
      })),
      { title: { contains: "Testing Phase", mode: "insensitive" as const } },
    ],
  };
}

/** Non-archived training rows in the database (admin launch-readiness counts). */
export function trainingCitizenReportsInDbWhere(): Prisma.CitizenReportWhereInput {
  return {
    status: { not: "ARCHIVED" },
    ...trainingCitizenReportMatchWhere(),
  };
}

/** Prisma filter merged into public citizen-report queries when exclusion is active. */
export function trainingDataExcludedFromPublicWhere(): Prisma.CitizenReportWhereInput {
  if (!excludeTrainingDataFromPublicSurfaces()) return {};
  return { NOT: trainingCitizenReportMatchWhere() };
}

export function mergeCitizenReportWhere(
  base: Prisma.CitizenReportWhereInput,
): Prisma.CitizenReportWhereInput {
  const training = trainingDataExcludedFromPublicWhere();
  if (Object.keys(training).length === 0) return base;
  return { AND: [base, training] };
}

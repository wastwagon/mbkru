/** `next/cache` tag strings for accountability data — safe to import from tests without Prisma. */

export const PROMISES_INDEX_TAG = "mbkru:promises-index";

export function promisesMemberTag(slug: string): string {
  return `mbkru:promises-member:${slug}`;
}

export const REPORT_CARD_INDEX_TAG = "mbkru:report-card-index";

export function reportCardYearTag(year: number): string {
  return `mbkru:report-card-year:${year}`;
}

export const MPS_ROSTER_TAG = "mbkru:mps-roster";

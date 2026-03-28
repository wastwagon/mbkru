/**
 * HTTP cache helpers for public accountability JSON (no server-only / Prisma).
 * @see src/lib/server/accountability-cache.ts for tagged data fetching.
 */
export const ACCOUNTABILITY_PUBLIC_S_MAXAGE_SEC = 300;

export function accountabilityPublicCacheControl(): string {
  const s = ACCOUNTABILITY_PUBLIC_S_MAXAGE_SEC;
  return `public, max-age=${s}, s-maxage=${s}, stale-while-revalidate=${s * 2}`;
}

export function accountabilityApiNotFoundCacheControl(): string {
  return "private, no-store";
}

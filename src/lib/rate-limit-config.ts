/**
 * Parse env for public form rate limits (matches previous inline behavior:
 * falsy / NaN / 0 → defaults, then clamp).
 */

export function parseRateLimitWindowMs(envValue: string | undefined): number {
  const parsed = Number(envValue);
  const raw = parsed === 0 || Number.isNaN(parsed) ? 60_000 : parsed;
  return Math.min(Math.max(raw, 5_000), 3_600_000);
}

export function parseRateLimitMax(envValue: string | undefined): number {
  const parsed = Number(envValue);
  const raw = parsed === 0 || Number.isNaN(parsed) ? 30 : parsed;
  return Math.min(Math.max(raw, 5), 1000);
}

/** Stricter defaults for `/api/geo/reverse` (Nominatim fair-use, abuse prevention). */
export function parseGeoReverseRateLimitWindowMs(envValue: string | undefined): number {
  const parsed = Number(envValue);
  const raw = parsed === 0 || Number.isNaN(parsed) ? 60_000 : parsed;
  return Math.min(Math.max(raw, 10_000), 3_600_000);
}

export function parseGeoReverseRateLimitMax(envValue: string | undefined): number {
  const parsed = Number(envValue);
  const raw = parsed === 0 || Number.isNaN(parsed) ? 20 : parsed;
  return Math.min(Math.max(raw, 5), 120);
}

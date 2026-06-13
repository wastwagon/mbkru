/** `unstable_cache` serialises Dates as strings — revive before SSR uses `.getTime()` / locale formatters. */
export function coerceCachedDate(value: Date | string | null | undefined): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value : null;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

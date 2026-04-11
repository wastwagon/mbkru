/**
 * Homepage embed for the promises browse dashboard (external or same-origin).
 * - Unset → use {@link DEFAULT_PROMISES_BROWSE_EMBED_URL}.
 * - Set to a valid `http(s)` URL → use that.
 * - Set to `off` → do not show the homepage section.
 */
const OFF = "off";

/** Programme-provided staging dashboard (sslip). Override in production via env. */
export const DEFAULT_PROMISES_BROWSE_EMBED_URL =
  "https://mwc0cssgo00sgk8kcgcw8gw8.31.97.57.75.sslip.io/promises/browse";

/** Resolved iframe `src`, or `null` when the section should be hidden. */
export function resolvePromisesBrowseEmbedUrlForHomepage(): string | null {
  const raw = process.env.NEXT_PUBLIC_PROMISES_BROWSE_EMBED_URL?.trim();
  if (raw?.toLowerCase() === OFF) return null;
  if (raw) {
    if (!/^https?:\/\//i.test(raw)) return null;
    return raw;
  }
  return DEFAULT_PROMISES_BROWSE_EMBED_URL;
}

/** Internal path only — rejects protocol-relative and non-root-relative URLs (open-redirect safe). */
export function safePostAuthRedirectPath(next: string | null | undefined, fallback = "/account"): string {
  if (next == null || typeof next !== "string") return fallback;
  const t = next.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return fallback;
  return t;
}

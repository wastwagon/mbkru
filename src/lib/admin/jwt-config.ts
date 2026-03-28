/** Shared JWT config for Next.js proxy and server routes. Do not import `next/headers` here. */

export function getSessionSecretKey(): Uint8Array | null {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) return null;
  return new TextEncoder().encode(s);
}

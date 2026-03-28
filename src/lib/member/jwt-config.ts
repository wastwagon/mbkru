/**
 * Member session signing — Edge-safe (no Node-only imports). Separate secret from admin.
 */

export function getMemberSessionSecretKey(): Uint8Array | null {
  const s = process.env.MEMBER_SESSION_SECRET;
  if (!s || s.length < 32) return null;
  return new TextEncoder().encode(s);
}

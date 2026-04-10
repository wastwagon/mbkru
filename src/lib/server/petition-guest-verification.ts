import "server-only";

/**
 * When true, guests (not signed-in members) receive an email link before their petition signature counts.
 * Requires RESEND_API_KEY, RESEND_FROM_EMAIL (or default), and NEXT_PUBLIC_SITE_URL (https).
 * Opt-in: set PETITION_VERIFY_GUEST_SIGNATURES=1 (or true).
 */
export function isPetitionGuestEmailVerificationEnabled(): boolean {
  const raw = process.env.PETITION_VERIFY_GUEST_SIGNATURES?.trim().toLowerCase();
  if (raw === "0" || raw === "false" || raw === "off") return false;
  if (raw !== "1" && raw !== "true" && raw !== "on") return false;

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  if (!site.startsWith("http")) return false;

  return Boolean(process.env.RESEND_API_KEY?.trim());
}

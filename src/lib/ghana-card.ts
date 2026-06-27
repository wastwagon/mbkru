import { createHmac } from "node:crypto";

/** Standard Ghana Card format: GHA-XXXXXXXXX-X (9 digits + check digit). */
const GHANA_CARD_RE = /^GHA-\d{9}-\d$/i;

export function normalizeGhanaCardNumber(raw: string): string | null {
  const trimmed = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (!trimmed) return null;

  const compact = trimmed.replace(/-/g, "");
  const match = compact.match(/^GHA(\d{9})(\d)$/);
  if (!match) return null;

  const normalized = `GHA-${match[1]}-${match[2]}`;
  if (!GHANA_CARD_RE.test(normalized)) return null;
  return normalized;
}

export function ghanaCardLastFour(normalized: string): string {
  const digits = normalized.replace(/\D/g, "");
  return digits.slice(-4);
}

export function hashGhanaCardNumber(normalized: string): string {
  const secret =
    process.env.GHANA_CARD_HASH_SECRET?.trim() || process.env.MEMBER_SESSION_SECRET?.trim();
  if (!secret || secret.length < 16) {
    throw new Error("Ghana Card hash secret not configured");
  }
  return createHmac("sha256", secret).update(normalized, "utf8").digest("hex");
}

export function maskGhanaCardNumber(normalized: string): string {
  const lastFour = ghanaCardLastFour(normalized);
  return `GHA-*******-${lastFour.slice(-1)} (${lastFour})`;
}

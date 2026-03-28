import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

/**
 * Optional 1h scoped token so anonymous reporters can upload attachments after `POST /api/reports`.
 * Set `REPORT_ATTACHMENT_HMAC_SECRET` (≥32 chars). Members can upload via session without this token.
 */
export function signReportAttachmentScope(reportId: string): string | null {
  const secret = process.env.REPORT_ATTACHMENT_HMAC_SECRET?.trim();
  if (!secret || secret.length < 32) return null;
  const exp = Date.now() + 60 * 60 * 1000;
  const msg = `${reportId}|${exp}`;
  const sig = createHmac("sha256", secret).update(msg).digest("base64url");
  return `${msg}.${sig}`;
}

export function verifyReportAttachmentScope(token: string, reportId: string): boolean {
  const secret = process.env.REPORT_ATTACHMENT_HMAC_SECRET?.trim();
  if (!secret || secret.length < 32) return false;

  const lastDot = token.lastIndexOf(".");
  if (lastDot < 0) return false;
  const msg = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const pipe = msg.indexOf("|");
  if (pipe < 0) return false;
  const rid = msg.slice(0, pipe);
  const exp = Number(msg.slice(pipe + 1));
  if (rid !== reportId || !Number.isFinite(exp) || Date.now() > exp) return false;

  const expectSig = createHmac("sha256", secret).update(msg).digest("base64url");
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expectSig, "utf8");
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

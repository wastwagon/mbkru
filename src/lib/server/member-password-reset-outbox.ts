import "server-only";

import { prisma } from "@/lib/db/prisma";
import { enqueueNotificationJob } from "@/lib/server/notification-outbox";

function siteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw && /^https?:\/\//i.test(raw)) {
    return raw.replace(/\/$/, "");
  }
  return "https://mbkruadvocates.org";
}

export async function enqueueMemberPasswordResetDelivery(memberId: string, resetUrl: string): Promise<void> {
  const m = await prisma.member.findUnique({
    where: { id: memberId },
    select: { email: true },
  });
  if (!m?.email) return;

  const subject = "[MBKRU] Reset your password";
  const text = [
    "You requested a password reset for your MBKRU member account.",
    "",
    "Reset your password (link expires in 1 hour):",
    resetUrl,
    "",
    "If you did not request this, you can ignore this email.",
    "",
    "— MBKRU",
  ].join("\n");

  await enqueueNotificationJob({
    channel: "EMAIL",
    kind: "MEMBER_TRANSACTIONAL_EMAIL",
    payload: {
      to: m.email,
      subject,
      text,
      tag: "member_password_reset",
    },
  });
}

export function buildPasswordResetUrl(token: string): string {
  const base = siteOrigin();
  return `${base}/reset-password?token=${encodeURIComponent(token)}`;
}

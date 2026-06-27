import { NextResponse } from "next/server";

import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { rememberPasswordResetJti } from "@/lib/member/password-reset-jti-redis";
import {
  createPasswordResetToken,
  PASSWORD_RESET_MAX_AGE_SEC,
  verifyPasswordResetToken,
} from "@/lib/member/password-reset-token";
import { prisma } from "@/lib/db/prisma";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import {
  buildPasswordResetUrl,
  enqueueMemberPasswordResetDelivery,
} from "@/lib/server/member-password-reset-outbox";
import { processNotificationOutboxBatch } from "@/lib/server/notification-outbox";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { memberLoginSchema } from "@/lib/validation/member-auth";

/** Request a password reset email. Always returns success to avoid email enumeration. */
export async function POST(request: Request) {
  const denied = guardMemberAuthApi();
  if (denied) return denied;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured (DATABASE_URL)" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "auth-forgot-password"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = memberLoginSchema.pick({ email: true }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: true });
    }

    const email = parsed.data.email.toLowerCase();
    const member = await prisma.member.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (member) {
      const token = await createPasswordResetToken(member.id, member.email);
      const verified = await verifyPasswordResetToken(token);
      if (verified) {
        await rememberPasswordResetJti(verified.jti, PASSWORD_RESET_MAX_AGE_SEC);
      }
      const resetUrl = buildPasswordResetUrl(token);
      await enqueueMemberPasswordResetDelivery(member.id, resetUrl);
      await processNotificationOutboxBatch(4);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: true });
  }
}

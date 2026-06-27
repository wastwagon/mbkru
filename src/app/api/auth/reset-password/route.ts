import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import {
  consumePasswordResetJti,
  isPasswordResetJtiActive,
} from "@/lib/member/password-reset-jti-redis";
import { verifyPasswordResetToken } from "@/lib/member/password-reset-token";
import { prisma } from "@/lib/db/prisma";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

const schema = z.object({
  token: z.string().min(10).max(4000),
  password: z.string().min(8).max(200),
});

export async function POST(request: Request) {
  const denied = guardMemberAuthApi();
  if (denied) return denied;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured (DATABASE_URL)" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "auth-reset-password"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const claims = await verifyPasswordResetToken(parsed.data.token);
    if (!claims) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    }

    if (!(await isPasswordResetJtiActive(claims.jti))) {
      return NextResponse.json({ error: "This reset link has already been used or expired." }, { status: 400 });
    }

    const member = await prisma.member.findUnique({
      where: { id: claims.memberId },
      select: { id: true, email: true },
    });
    if (!member || member.email.toLowerCase() !== claims.email.toLowerCase()) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    }

    const hash = await bcrypt.hash(parsed.data.password, 12);
    await prisma.member.update({
      where: { id: member.id },
      data: { password: hash },
    });

    await consumePasswordResetJti(claims.jti);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Password reset failed" }, { status: 500 });
  }
}

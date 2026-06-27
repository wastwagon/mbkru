import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import { prisma } from "@/lib/db/prisma";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

const schema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(8).max(200),
});

export async function POST(request: Request) {
  const denied = guardMemberAuthApi();
  if (denied) return denied;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured (DATABASE_URL)" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "auth-change-password"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const session = await getMemberSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (session.impersonatedByAdminId) {
    return NextResponse.json(
      { error: "End the support session before changing this member's password." },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const member = await prisma.member.findUnique({
      where: { id: session.memberId },
      select: { password: true },
    });
    if (!member) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const ok = await bcrypt.compare(parsed.data.currentPassword, member.password);
    if (!ok) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    const hash = await bcrypt.hash(parsed.data.newPassword, 12);
    await prisma.member.update({
      where: { id: session.memberId },
      data: { password: hash },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Password change failed" }, { status: 500 });
  }
}

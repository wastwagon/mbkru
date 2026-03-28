import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { createMemberSessionToken, memberCookieName } from "@/lib/member/session";
import { prisma } from "@/lib/db/prisma";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { memberLoginSchema } from "@/lib/validation/member-auth";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function POST(request: Request) {
  const denied = guardMemberAuthApi();
  if (denied) return denied;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured (DATABASE_URL)" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "auth-login"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = memberLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const member = await prisma.member.findUnique({ where: { email } });
    if (!member) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const ok = await bcrypt.compare(parsed.data.password, member.password);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = await createMemberSessionToken(member.id, member.email);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(memberCookieName(), token, COOKIE_OPTIONS);
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

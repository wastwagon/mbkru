import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { createMemberSessionToken, memberCookieName } from "@/lib/member/session";
import { prisma } from "@/lib/db/prisma";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { memberRegisterSchema } from "@/lib/validation/member-auth";

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

  if (!(await allowPublicFormRequest(request, "auth-register"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = memberRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { email, password, displayName, phone, regionId: rawRegionId } = parsed.data;
    const region =
      rawRegionId && rawRegionId.length > 0
        ? await prisma.region.findUnique({ where: { id: rawRegionId } })
        : null;
    if (rawRegionId && rawRegionId.length > 0 && !region) {
      return NextResponse.json({ error: "Invalid region" }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 12);
    const member = await prisma.member.create({
      data: {
        email: email.toLowerCase(),
        password: hash,
        displayName: displayName?.trim() || null,
        phone: phone?.trim() || null,
        regionId: region?.id ?? null,
      },
    });

    const token = await createMemberSessionToken(member.id, member.email);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(memberCookieName(), token, COOKIE_OPTIONS);
    return res;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}

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

    const { email, password, displayName, phone, regionId: rawRegionId, constituencyId: rawConstituencyId } =
      parsed.data;
    const region = await prisma.region.findUnique({ where: { id: rawRegionId } });
    if (!region) {
      return NextResponse.json({ error: "Invalid region" }, { status: 400 });
    }

    let constituencyId: string | null = null;
    const rawC = rawConstituencyId?.trim() ?? "";
    if (rawC.length > 0) {
      const c = await prisma.constituency.findFirst({
        where: { id: rawC, regionId: region.id },
        select: { id: true },
      });
      if (!c) {
        return NextResponse.json({ error: "Constituency does not match selected region" }, { status: 400 });
      }
      constituencyId = c.id;
    }

    const hash = await bcrypt.hash(password, 12);
    const member = await prisma.member.create({
      data: {
        email: email.toLowerCase(),
        password: hash,
        displayName: displayName?.trim() || null,
        phone: phone?.trim() || null,
        regionId: region.id,
        constituencyId,
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

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession, memberCookieName, revokeMemberSessionFromToken } from "@/lib/member/session";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { logServerError } from "@/lib/server/structured-log";
import { accountDeleteBodySchema } from "@/lib/validation/account-self-service";

const CLEAR_COOKIE = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 0,
};

export async function POST(request: Request) {
  const denied = guardMemberAuthApi();
  if (denied) return denied;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "account-delete"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const session = await getMemberSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = accountDeleteBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const confirm = parsed.data.confirmEmail.trim().toLowerCase();
  const sessionEmail = session.email.trim().toLowerCase();
  if (confirm !== sessionEmail) {
    return NextResponse.json({ error: "Email does not match your account" }, { status: 400 });
  }

  const petitionCount = await prisma.petition.count({
    where: { authorMemberId: session.memberId },
  });
  if (petitionCount > 0) {
    return NextResponse.json(
      {
        error:
          "This account created one or more petitions. Deleting it is blocked to preserve petition authorship. Contact support if you need your account removed.",
        code: "PETITIONS_AUTHORED",
        petitionCount,
      },
      { status: 409 },
    );
  }

  const token = (await cookies()).get(memberCookieName())?.value ?? "";

  try {
    await prisma.member.delete({ where: { id: session.memberId } });
  } catch (e) {
    logServerError("api/account/delete", e, { memberId: session.memberId });
    return NextResponse.json({ error: "Could not delete account. Try again or contact support." }, { status: 500 });
  }

  await revokeMemberSessionFromToken(token);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(memberCookieName(), "", CLEAR_COOKIE);
  return res;
}

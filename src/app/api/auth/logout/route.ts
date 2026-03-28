import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { memberCookieName, revokeMemberSessionFromToken } from "@/lib/member/session";

export async function POST() {
  const denied = guardMemberAuthApi();
  if (denied) return denied;

  const token = (await cookies()).get(memberCookieName())?.value ?? "";
  await revokeMemberSessionFromToken(token);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(memberCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}

import { NextResponse } from "next/server";

import { MEMBER_SESSION_COOKIE } from "@/lib/member/cookie-name";
import { getAdminSession } from "@/lib/admin/session";
import { memberCookieName, revokeMemberSessionFromToken } from "@/lib/member/session";
import { logAdminOperationalAudit } from "@/lib/server/admin-operational-audit";

function safeRedirectPath(raw: string | null, fallback: string): string {
  if (!raw) return fallback;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  return trimmed;
}

/** End admin member impersonation — clears member session cookie only. */
export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const url = new URL(request.url);
  const next = safeRedirectPath(url.searchParams.get("next"), "/admin/communities");
  const token = request.headers.get("cookie")?.match(
    new RegExp(`(?:^|;\\s*)${MEMBER_SESSION_COOKIE}=([^;]+)`),
  )?.[1];

  if (token) {
    try {
      await revokeMemberSessionFromToken(decodeURIComponent(token));
    } catch {
      await revokeMemberSessionFromToken(token);
    }
  }

  await logAdminOperationalAudit({
    adminId: session.adminId,
    action: "member_impersonation_ended",
    details: { next },
  });

  const res = NextResponse.redirect(new URL(next, request.url));
  res.cookies.set(memberCookieName(), "", { ...{ httpOnly: true, path: "/" }, maxAge: 0 });
  return res;
}

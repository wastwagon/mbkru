import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/session";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { createMemberSessionToken, memberCookieName } from "@/lib/member/session";
import { logAdminOperationalAudit } from "@/lib/server/admin-operational-audit";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

function safeRedirectPath(raw: string | null, fallback: string): string {
  if (!raw) return fallback;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  return trimmed;
}

type Props = { params: Promise<{ id: string }> };

/** Admin support login — sets a member session cookie (impersonation) and redirects. */
export async function GET(request: Request, { params }: Props) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { id: memberId } = await params;
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { id: true, email: true },
  });
  if (!member) {
    return NextResponse.redirect(new URL("/admin/members", request.url));
  }

  const url = new URL(request.url);
  const communityId = url.searchParams.get("communityId")?.trim();
  const next = safeRedirectPath(
    url.searchParams.get("next"),
    communityId ? `/admin/communities/${communityId}` : "/account",
  );

  const token = await createMemberSessionToken(member.id, member.email, {
    impersonatedByAdminId: session.adminId,
  });

  await logAdminOperationalAudit({
    adminId: session.adminId,
    action: "member_impersonation_started",
    details: { memberId: member.id, email: member.email, next },
  });

  const res = NextResponse.redirect(new URL(next, request.url));
  res.cookies.set(memberCookieName(), token, COOKIE_OPTIONS);
  return res;
}

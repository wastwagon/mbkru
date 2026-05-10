import { NextResponse } from "next/server";

import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { touchMemberRegionPresence } from "@/lib/server/region-presence";

/**
 * Lightweight heartbeat so "who's online" can bucket signed-in members by **home region** (registration).
 * No-op when the member has not set a region yet.
 */
export async function POST(request: Request) {
  const denied = guardMemberAuthApi();
  if (denied) return denied;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "member-presence"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const session = await getMemberSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const member = await prisma.member.findUnique({
    where: { id: session.memberId },
    select: { regionId: true },
  });
  if (!member?.regionId) {
    return NextResponse.json({ ok: true, recorded: false });
  }

  await touchMemberRegionPresence(member.regionId, session.memberId);
  return NextResponse.json({ ok: true, recorded: true });
}

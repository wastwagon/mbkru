import { NextResponse } from "next/server";

import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import { touchMemberCommunityPresence } from "@/lib/server/community-presence";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { touchMemberRegionPresence } from "@/lib/server/region-presence";
import { isCommunitySlug } from "@/lib/validation/communities";

/**
 * Heartbeat for **scoped** presence: always buckets by **home region** when set; optionally also
 * buckets by **community** when the member has active membership there (same 3-minute window as regions).
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

  let communitySlug: string | undefined;
  try {
    const ct = request.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      const j = (await request.json()) as { communitySlug?: string };
      if (typeof j.communitySlug === "string") {
        const s = j.communitySlug.trim().toLowerCase();
        communitySlug = s.length > 0 ? s : undefined;
      }
    }
  } catch {
    // ignore invalid JSON — region-only ping still allowed
  }

  const member = await prisma.member.findUnique({
    where: { id: session.memberId },
    select: { regionId: true },
  });

  let recordedRegion = false;
  if (member?.regionId) {
    await touchMemberRegionPresence(member.regionId, session.memberId);
    recordedRegion = true;
  }

  let recordedCommunity = false;
  if (communitySlug && isCommunitySlug(communitySlug)) {
    const community = await prisma.community.findFirst({
      where: { slug: communitySlug, status: "ACTIVE" },
      select: { id: true },
    });
    if (community) {
      const membership = await prisma.communityMembership.findUnique({
        where: {
          communityId_memberId: { communityId: community.id, memberId: session.memberId },
        },
        select: { state: true },
      });
      if (membership?.state === "ACTIVE") {
        await touchMemberCommunityPresence(community.id, session.memberId);
        recordedCommunity = true;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    recordedRegion,
    recordedCommunity,
  });
}

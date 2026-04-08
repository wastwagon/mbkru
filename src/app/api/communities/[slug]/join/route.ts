import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { findActiveCommunityBySlug } from "@/lib/server/communities-access";
import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { isCommunitySlug } from "@/lib/validation/communities";

type Props = { params: Promise<{ slug: string }> };

/** Join an active community (PUBLIC or MEMBERS_ONLY; OPEN → ACTIVE; APPROVAL_REQUIRED → PENDING_JOIN). */
export async function POST(request: Request, { params }: Props) {
  if (!platformFeatures.communities(getServerPlatformPhase())) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const authBlock = guardMemberAuthApi();
  if (authBlock) return authBlock;

  if (!(await allowPublicFormRequest(request, "communities-join"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { slug: raw } = await params;
  const slug = raw.trim().toLowerCase();
  if (!isCommunitySlug(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const community = await findActiveCommunityBySlug(slug);
  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  const session = await getMemberSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const existing = await prisma.communityMembership.findUnique({
    where: {
      communityId_memberId: { communityId: community.id, memberId: session.memberId },
    },
  });

  if (existing) {
    if (existing.state === "BANNED") {
      return NextResponse.json({ error: "You cannot join this community." }, { status: 403 });
    }
    if (existing.state === "SUSPENDED") {
      return NextResponse.json({ error: "Membership is suspended." }, { status: 403 });
    }
    return NextResponse.json({
      membership: { state: existing.state, role: existing.role },
    });
  }

  const state = community.joinPolicy === "OPEN" ? "ACTIVE" : "PENDING_JOIN";

  const membership = await prisma.communityMembership.create({
    data: {
      communityId: community.id,
      memberId: session.memberId,
      state,
      role: "MEMBER",
    },
    select: { state: true, role: true },
  });

  return NextResponse.json({ membership });
}

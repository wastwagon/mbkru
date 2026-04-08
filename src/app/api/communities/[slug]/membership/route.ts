import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { findActiveCommunityBySlug } from "@/lib/server/communities-access";
import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { isCommunitySlug } from "@/lib/validation/communities";

type Props = { params: Promise<{ slug: string }> };

/** Current user's membership row for this community (401 if not signed in). */
export async function GET(request: Request, { params }: Props) {
  if (!platformFeatures.communities(getServerPlatformPhase())) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const authBlock = guardMemberAuthApi();
  if (authBlock) return authBlock;

  if (!(await allowPublicFormRequest(request, "communities-membership-read"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { slug: raw } = await params;
  const slug = raw.trim().toLowerCase();
  if (!isCommunitySlug(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const session = await getMemberSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const community = await findActiveCommunityBySlug(slug);
  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  const membership = await prisma.communityMembership.findUnique({
    where: {
      communityId_memberId: { communityId: community.id, memberId: session.memberId },
    },
    select: { state: true, role: true },
  });

  return NextResponse.json({ membership: membership ?? null });
}

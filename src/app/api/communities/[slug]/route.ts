import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { accountabilityPublicCacheControl } from "@/lib/server/accountability-cache";
import { canReadCommunityFullDetail, findMembership } from "@/lib/server/communities-access";
import { getMemberSession } from "@/lib/member/session";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { isCommunitySlug } from "@/lib/validation/communities";

type Props = { params: Promise<{ slug: string }> };

/** Single active community. MEMBERS_ONLY returns full detail only for active members; others get a restricted payload. */
export async function GET(request: Request, { params }: Props) {
  if (!platformFeatures.communities(getServerPlatformPhase())) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "communities-read"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { slug: raw } = await params;
  const slug = raw.trim().toLowerCase();
  if (!isCommunitySlug(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const c = await prisma.community.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      region: { select: { name: true, slug: true } },
      _count: { select: { memberships: true, posts: true } },
    },
  });

  if (!c) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const session = await getMemberSession();
  const membership = session ? await findMembership(c.id, session.memberId) : null;

  const full = canReadCommunityFullDetail(c.visibility, membership);

  const base = {
    slug: c.slug,
    name: c.name,
    traditionalAreaName: c.traditionalAreaName,
    joinPolicy: c.joinPolicy,
    visibility: c.visibility,
    region: c.region ? { name: c.region.name, slug: c.region.slug } : null,
    memberCount: c._count.memberships,
    postCount: c._count.posts,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };

  if (!full) {
    return NextResponse.json(
      {
        community: {
          ...base,
          description: null,
          restricted: true,
          membershipState: membership?.state ?? null,
        },
      },
      { headers: { "Cache-Control": accountabilityPublicCacheControl() } },
    );
  }

  return NextResponse.json(
    {
      community: {
        ...base,
        description: c.description,
        restricted: false,
      },
    },
    { headers: { "Cache-Control": accountabilityPublicCacheControl() } },
  );
}

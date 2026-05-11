import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { presenceGuestAggregateCountsVisible } from "@/lib/env.server";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { getMemberSessionFromRequest } from "@/lib/member/session";
import { isCommunitiesBrowseEnabled } from "@/lib/reports/accountability-pages";
import {
  countOnlineInCommunity,
  listOnlineMemberIdsInCommunity,
} from "@/lib/server/community-presence";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { isCommunitySlug } from "@/lib/validation/communities";

type Props = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Props) {
  if (!platformFeatures.communities(getServerPlatformPhase())) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  if (!isCommunitiesBrowseEnabled()) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "communities-presence-read"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { slug: raw } = await params;
  const slug = raw.trim().toLowerCase();
  if (!isCommunitySlug(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const community = await prisma.community.findFirst({
    where: { slug, status: "ACTIVE" },
    select: { id: true, name: true, slug: true },
  });
  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  const viewer = await getMemberSessionFromRequest(request);
  const countsVisibleToThisViewer = viewer != null || presenceGuestAggregateCountsVisible();

  let onlineCount: number | null = null;
  if (countsVisibleToThisViewer) {
    onlineCount = await countOnlineInCommunity(community.id);
  }

  const peerDetailsVisible = viewer != null;
  let onlinePeers: { id: string; label: string }[] = [];
  if (peerDetailsVisible) {
    const peerIds = await listOnlineMemberIdsInCommunity(community.id, {
      excludeMemberId: viewer.memberId,
      limit: 12,
    });
    const peers =
      peerIds.length > 0
        ? await prisma.member.findMany({
            where: { id: { in: peerIds } },
            select: { id: true, displayName: true },
          })
        : [];
    const peerMap = new Map(peers.map((p) => [p.id, p.displayName]));
    onlinePeers = peerIds.map((id) => ({
      id,
      label: peerMap.get(id)?.trim() || "Member",
    }));
  }

  return NextResponse.json(
    {
      community: { id: community.id, name: community.name, slug: community.slug },
      onlineCount,
      onlineCountsVisible: countsVisibleToThisViewer,
      peerDetailsVisible,
      onlinePeers,
      presenceNote:
        "Online counts use recent activity (about 3 minutes) from signed-in members with active membership in this community.",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

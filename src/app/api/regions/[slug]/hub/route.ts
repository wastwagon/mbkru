import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { presenceGuestAggregateCountsVisible } from "@/lib/env.server";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { getMemberSessionFromRequest } from "@/lib/member/session";
import { isReportCardPublicEnabled } from "@/lib/reports/accountability-pages";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import {
  countOnlineInRegion,
  listOnlineMemberIdsInRegion,
} from "@/lib/server/region-presence";

const REGION_HUB_PREFIX = "mbkru-region-hub-";

type Props = { params: Promise<{ slug: string }> };

function hubSlugForRegion(regionSlug: string): string {
  return `${REGION_HUB_PREFIX}${regionSlug}`;
}

export async function GET(request: Request, { params }: Props) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "regions-hub-read"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { slug: raw } = await params;
  const slug = raw.trim().toLowerCase();
  if (!slug) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const region = await prisma.region.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  });
  if (!region) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const phase = getServerPlatformPhase();
  const communitiesOn = platformFeatures.communities(phase);
  const hubSlug = hubSlugForRegion(region.slug);
  let hubCommunitySlug: string | null = null;
  if (communitiesOn) {
    const hub = await prisma.community.findFirst({
      where: { slug: hubSlug, status: "ACTIVE" },
      select: { slug: true },
    });
    hubCommunitySlug = hub?.slug ?? null;
  }

  const voiceOn = isCitizensVoiceEnabled();
  const reportCardOn = isReportCardPublicEnabled();
  const reportCardVoiceHref =
    voiceOn || reportCardOn ? `/regions/${encodeURIComponent(region.slug)}#browse-voice` : null;

  const viewer = await getMemberSessionFromRequest(request);

  const countsVisibleToThisViewer = viewer != null || presenceGuestAggregateCountsVisible();
  let onlineCount: number | null = null;
  if (countsVisibleToThisViewer) {
    onlineCount = await countOnlineInRegion(region.id);
  }

  /** Names only for signed-in viewers. Guests may see aggregate counts when `MBKRU_REGION_PRESENCE_COUNTS_PUBLIC` allows. */
  const peerDetailsVisible = viewer != null;
  let onlinePeers: { id: string; label: string }[] = [];
  if (peerDetailsVisible) {
    const peerIds = await listOnlineMemberIdsInRegion(region.id, {
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
      region,
      hubCommunitySlug,
      regionalChatHref: hubCommunitySlug ? `/communities/${hubCommunitySlug}` : null,
      reportCardVoiceHref,
      onlineCount,
      onlineCountsVisible: countsVisibleToThisViewer,
      peerDetailsVisible,
      onlinePeers,
      presenceNote: "Online counts use recent activity (about 3 minutes) from signed-in members who set a home region.",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

import { CommunityPostKind, CommunityMembershipRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import {
  canReadCommunityPosts,
  findActiveCommunityBySlug,
  findMembership,
} from "@/lib/server/communities-access";
import { listCommunityPostsVisibleToViewer } from "@/lib/server/community-posts-public";
import { defaultCommunityPostPremoderation } from "@/lib/server/community-premoderate";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { communityPostCreateSchema, isCommunitySlug } from "@/lib/validation/communities";

type Props = { params: Promise<{ slug: string }> };

function mapPostRow(p: {
  id: string;
  kind: CommunityPostKind;
  body: string;
  moderationStatus: string;
  pinned: boolean;
  createdAt: Date;
  author: { id: string; displayName: string | null };
}) {
  return {
    id: p.id,
    kind: p.kind,
    body: p.body,
    moderationStatus: p.moderationStatus,
    pinned: p.pinned,
    createdAt: p.createdAt.toISOString(),
    author: {
      id: p.author.id,
      displayName: p.author.displayName,
    },
  };
}

function canPostAnnouncement(role: CommunityMembershipRole): boolean {
  return role === "MODERATOR" || role === "QUEEN_MOTHER_VERIFIED";
}

function moderationStatusForNewPost(
  role: CommunityMembershipRole,
  kind: CommunityPostKind,
): "PUBLISHED" | "PENDING" {
  if (kind === "ANNOUNCEMENT") return "PUBLISHED";
  if (!defaultCommunityPostPremoderation()) return "PUBLISHED";
  if (role === "MODERATOR" || role === "QUEEN_MOTHER_VERIFIED") return "PUBLISHED";
  return "PENDING";
}

export async function GET(request: Request, { params }: Props) {
  if (!platformFeatures.communities(getServerPlatformPhase())) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "communities-posts-read"))) {
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
  const viewerId = session?.memberId ?? null;
  const membership = session ? await findMembership(community.id, session.memberId) : null;

  if (!canReadCommunityPosts(community.visibility, membership)) {
    return NextResponse.json({ error: "Members only" }, { status: 403 });
  }

  const rows = await listCommunityPostsVisibleToViewer(community.id, viewerId);

  return NextResponse.json({
    posts: rows.map(mapPostRow),
  });
}

export async function POST(request: Request, { params }: Props) {
  if (!platformFeatures.communities(getServerPlatformPhase())) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const authBlock = guardMemberAuthApi();
  if (authBlock) return authBlock;

  if (!(await allowPublicFormRequest(request, "communities-posts-write"))) {
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
  });

  if (!membership || membership.state !== "ACTIVE") {
    return NextResponse.json({ error: "Active membership required" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = communityPostCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { kind, body } = parsed.data;

  if (kind === "ANNOUNCEMENT" && !canPostAnnouncement(membership.role)) {
    return NextResponse.json({ error: "Announcements are restricted" }, { status: 403 });
  }

  const moderationStatus = moderationStatusForNewPost(membership.role, kind);

  const created = await prisma.communityPost.create({
    data: {
      communityId: community.id,
      authorMemberId: session.memberId,
      kind,
      body,
      moderationStatus,
    },
    include: {
      author: { select: { id: true, displayName: true } },
    },
  });

  return NextResponse.json({ post: mapPostRow(created) }, { status: 201 });
}

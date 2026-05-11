import { CommunityPostKind, CommunityMembershipRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { canManageCommunityAffairs } from "@/lib/communities/community-affairs-roles";
import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import {
  canReadCommunityPosts,
  findActiveCommunityBySlug,
  findMembership,
} from "@/lib/server/communities-access";
import { findCommunityForumBySlug } from "@/lib/server/community-forums-public";
import { listCommunityPostsVisibleToViewer } from "@/lib/server/community-posts-public";
import {
  bumpThreadRootAfterReplyPublished,
  notifyThreadAuthorOfPublishedReply,
} from "@/lib/server/community-thread-reply-notify";
import { defaultCommunityPostPremoderation } from "@/lib/server/community-premoderate";
import { processNotificationOutboxBatch } from "@/lib/server/notification-outbox";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { toCommunityPostListApiJson } from "@/lib/community-post-api-json";
import { communityPostCreateSchema, isCommunitySlug } from "@/lib/validation/communities";

type Props = { params: Promise<{ slug: string }> };

const VALID_POST_KINDS = new Set<CommunityPostKind>(["GENERAL", "CONCERN", "ANNOUNCEMENT"]);

function canPostAnnouncement(role: CommunityMembershipRole): boolean {
  return canManageCommunityAffairs(role);
}

function moderationStatusForNewPost(
  role: CommunityMembershipRole,
  kind: CommunityPostKind,
): "PUBLISHED" | "PENDING" {
  if (kind === "ANNOUNCEMENT") return "PUBLISHED";
  if (!defaultCommunityPostPremoderation()) return "PUBLISHED";
  if (canManageCommunityAffairs(role)) return "PUBLISHED";
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

  const url = new URL(request.url);
  const forumSlug = url.searchParams.get("forumSlug")?.trim().toLowerCase() ?? "";
  let forumId: string | null | undefined;
  if (forumSlug) {
    const forum = await findCommunityForumBySlug(community.id, forumSlug);
    if (!forum) {
      return NextResponse.json({ error: "Forum not found" }, { status: 404 });
    }
    forumId = forum.id;
  }

  const kindRaw = url.searchParams.get("kind")?.trim() ?? "";
  let kinds: CommunityPostKind[] | undefined;
  if (kindRaw) {
    const parsed = kindRaw
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    for (const k of parsed) {
      if (!VALID_POST_KINDS.has(k as CommunityPostKind)) {
        return NextResponse.json({ error: "Invalid kind filter" }, { status: 400 });
      }
    }
    kinds = parsed as CommunityPostKind[];
  }

  const rows = await listCommunityPostsVisibleToViewer(community.id, viewerId, { forumId, kinds });

  return NextResponse.json({
    posts: rows.map(toCommunityPostListApiJson),
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

  const { kind, body, forumSlug: bodyForumSlug, parentPostId, title } = parsed.data;

  let communityForumId: string | null = null;
  let resolvedParentId: string | null = null;

  if (parentPostId) {
    const parent = await prisma.communityPost.findFirst({
      where: { id: parentPostId, communityId: community.id },
      select: {
        id: true,
        parentPostId: true,
        communityForumId: true,
        moderationStatus: true,
      },
    });
    if (!parent || parent.parentPostId !== null) {
      return NextResponse.json({ error: "Invalid thread" }, { status: 400 });
    }
    if (parent.moderationStatus !== "PUBLISHED") {
      return NextResponse.json({ error: "Thread is not available" }, { status: 403 });
    }
    if (!parent.communityForumId) {
      return NextResponse.json({ error: "Thread has no forum context" }, { status: 400 });
    }
    const forum = await prisma.communityForum.findFirst({
      where: { id: parent.communityForumId, communityId: community.id },
      select: { locked: true },
    });
    if (!forum) {
      return NextResponse.json({ error: "Forum missing" }, { status: 400 });
    }
    if (forum.locked && !canPostAnnouncement(membership.role)) {
      return NextResponse.json({ error: "Forum is locked" }, { status: 403 });
    }
    communityForumId = parent.communityForumId;
    resolvedParentId = parent.id;
  } else {
    const slugToUse = bodyForumSlug ?? "general";
    const forum = await findCommunityForumBySlug(community.id, slugToUse);
    if (!forum) {
      return NextResponse.json({ error: "Forum not found" }, { status: 404 });
    }
    if (forum.locked && !canPostAnnouncement(membership.role)) {
      return NextResponse.json({ error: "Forum is locked" }, { status: 403 });
    }
    communityForumId = forum.id;
  }

  if (kind === "ANNOUNCEMENT" && !canPostAnnouncement(membership.role)) {
    return NextResponse.json({ error: "Announcements are restricted" }, { status: 403 });
  }

  const moderationStatus = moderationStatusForNewPost(membership.role, kind);

  const created = await prisma.communityPost.create({
    data: {
      communityId: community.id,
      communityForumId,
      parentPostId: resolvedParentId,
      authorMemberId: session.memberId,
      kind,
      title: parentPostId ? null : title ?? null,
      body,
      moderationStatus,
    },
    include: {
      author: { select: { id: true, displayName: true } },
      communityForum: { select: { slug: true, name: true } },
    },
  });

  if (moderationStatus === "PUBLISHED" && resolvedParentId) {
    await bumpThreadRootAfterReplyPublished(resolvedParentId);
    await notifyThreadAuthorOfPublishedReply({
      replyPostId: created.id,
      replyAuthorMemberId: session.memberId,
      communitySlug: community.slug,
      communityName: community.name,
      parentPostId: resolvedParentId,
    });
    await processNotificationOutboxBatch(12);
  }

  return NextResponse.json({ post: toCommunityPostListApiJson(created) }, { status: 201 });
}

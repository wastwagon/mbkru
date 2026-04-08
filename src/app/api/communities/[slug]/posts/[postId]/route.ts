import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/member/session";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import {
  canReadCommunityPosts,
  findActiveCommunityBySlug,
  findMembership,
} from "@/lib/server/communities-access";
import { getCommunityPostForViewer } from "@/lib/server/community-posts-public";
import { isCommunitySlug } from "@/lib/validation/communities";

type Props = { params: Promise<{ slug: string; postId: string }> };

/** Single post for community readers (same visibility rules as feed/permalink). */
export async function GET(request: Request, { params }: Props) {
  if (!platformFeatures.communities(getServerPlatformPhase())) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  if (!(await allowPublicFormRequest(request, "communities-post-read"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { slug: rawSlug, postId } = await params;
  const slug = rawSlug.trim().toLowerCase();
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

  const post = await getCommunityPostForViewer(community.id, postId, viewerId);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({
    post: {
      id: post.id,
      kind: post.kind,
      body: post.body,
      moderationStatus: post.moderationStatus,
      pinned: post.pinned,
      createdAt: post.createdAt.toISOString(),
      author: {
        id: post.author.id,
        displayName: post.author.displayName,
      },
      community: {
        slug: community.slug,
        name: community.name,
      },
    },
  });
}

import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { notifyCommunityModeratorsOfPostReport } from "@/lib/server/community-report-notify";
import { processNotificationOutboxBatch } from "@/lib/server/notification-outbox";
import {
  canReadCommunityPosts,
  findActiveCommunityBySlug,
  findMembership,
} from "@/lib/server/communities-access";
import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { communityPostReportSchema, isCommunitySlug } from "@/lib/validation/communities";

type Props = { params: Promise<{ slug: string; postId: string }> };

/** Report a community post (active members; not own post). Notifies moderators / verified Queen Mothers. */
export async function POST(request: Request, { params }: Props) {
  if (!platformFeatures.communities(getServerPlatformPhase())) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const authBlock = guardMemberAuthApi();
  if (authBlock) return authBlock;

  if (!(await allowPublicFormRequest(request, "communities-post-report"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { slug: raw, postId: postIdParam } = await params;
  const slug = raw.trim().toLowerCase();
  if (!isCommunitySlug(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const postIdParsed = z.string().cuid().safeParse(postIdParam?.trim());
  if (!postIdParsed.success) {
    return NextResponse.json({ error: "Invalid post" }, { status: 400 });
  }

  const session = await getMemberSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const community = await findActiveCommunityBySlug(slug);
  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  const membership = await findMembership(community.id, session.memberId);
  if (!membership || membership.state !== "ACTIVE") {
    return NextResponse.json({ error: "Active membership required" }, { status: 403 });
  }

  if (!canReadCommunityPosts(community.visibility, membership)) {
    return NextResponse.json({ error: "Members only" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = communityPostReportSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const post = await prisma.communityPost.findFirst({
    where: { id: postIdParsed.data, communityId: community.id },
    select: { id: true, authorMemberId: true },
  });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (post.authorMemberId === session.memberId) {
    return NextResponse.json({ error: "Cannot report your own post" }, { status: 400 });
  }

  const duplicate = await prisma.communityPostReport.findFirst({
    where: {
      postId: post.id,
      reporterMemberId: session.memberId,
      status: "OPEN",
    },
    select: { id: true },
  });
  if (duplicate) {
    return NextResponse.json({ error: "You already have an open report for this post" }, { status: 409 });
  }

  try {
    await prisma.communityPostReport.create({
      data: {
        postId: post.id,
        reporterMemberId: session.memberId,
        reason: parsed.data.reason,
        details: parsed.data.details ?? null,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "You already have an open report for this post" }, { status: 409 });
    }
    throw e;
  }

  await notifyCommunityModeratorsOfPostReport({
    communityId: community.id,
    postId: post.id,
    reason: parsed.data.reason,
    communitySlug: community.slug,
    communityName: community.name,
    reporterMemberId: session.memberId,
  });

  await processNotificationOutboxBatch(20);

  return NextResponse.json({ ok: true });
}

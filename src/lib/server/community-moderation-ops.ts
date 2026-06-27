import "server-only";

import { prisma } from "@/lib/db/prisma";
import {
  bumpThreadRootAfterReplyPublished,
  notifyThreadAuthorOfPublishedReply,
} from "@/lib/server/community-thread-reply-notify";
import {
  enqueueCommunityJoinApprovedDelivery,
  enqueueCommunityPostPublishedDelivery,
  enqueueCommunityPostRejectedDelivery,
} from "@/lib/server/community-member-transactional-outbox";
import { createMemberNotification } from "@/lib/server/member-notifications";
import { processNotificationOutboxBatch } from "@/lib/server/notification-outbox";

export async function approvePendingCommunityMembership(
  membershipId: string,
  communityId: string,
): Promise<{ ok: true; communitySlug: string } | { ok: false }> {
  const row = await prisma.communityMembership.findFirst({
    where: {
      id: membershipId,
      communityId,
      state: "PENDING_JOIN",
    },
    include: { community: { select: { slug: true, name: true } } },
  });
  if (!row) return { ok: false };

  await prisma.communityMembership.update({
    where: { id: row.id },
    data: { state: "ACTIVE" },
  });

  await createMemberNotification(row.memberId, "community_join_approved", {
    communitySlug: row.community.slug,
    communityName: row.community.name,
  });

  await enqueueCommunityJoinApprovedDelivery(row.memberId, row.community.name, row.community.slug);
  await processNotificationOutboxBatch(12);

  return { ok: true, communitySlug: row.community.slug };
}

export async function publishPendingCommunityPost(
  postId: string,
  communityId: string,
  moderatedByAdminId?: string,
): Promise<{ ok: true; communitySlug: string; parentPostId: string | null } | { ok: false }> {
  const post = await prisma.communityPost.findFirst({
    where: {
      id: postId,
      communityId,
      moderationStatus: "PENDING",
    },
    select: {
      id: true,
      authorMemberId: true,
      parentPostId: true,
      community: { select: { slug: true, name: true } },
    },
  });
  if (!post) return { ok: false };

  await prisma.communityPost.update({
    where: { id: post.id },
    data: {
      moderationStatus: "PUBLISHED",
      moderatedAt: new Date(),
      moderatedByAdminId: moderatedByAdminId ?? null,
    },
  });

  await createMemberNotification(post.authorMemberId, "community_post_published", {
    postId: post.id,
    communitySlug: post.community.slug,
  });

  await enqueueCommunityPostPublishedDelivery(post.authorMemberId, post.id, post.community.slug);

  if (post.parentPostId) {
    await bumpThreadRootAfterReplyPublished(post.parentPostId);
  }
  await notifyThreadAuthorOfPublishedReply({
    replyPostId: post.id,
    replyAuthorMemberId: post.authorMemberId,
    communitySlug: post.community.slug,
    communityName: post.community.name,
    parentPostId: post.parentPostId,
  });

  await processNotificationOutboxBatch(15);

  return { ok: true, communitySlug: post.community.slug, parentPostId: post.parentPostId };
}

export async function rejectPendingCommunityPost(
  postId: string,
  communityId: string,
  reason: string,
  moderatedByAdminId?: string,
): Promise<{ ok: true; communitySlug: string } | { ok: false }> {
  const post = await prisma.communityPost.findFirst({
    where: {
      id: postId,
      communityId,
      moderationStatus: "PENDING",
    },
    select: {
      id: true,
      authorMemberId: true,
      community: { select: { slug: true } },
    },
  });
  if (!post) return { ok: false };

  await prisma.communityPost.update({
    where: { id: post.id },
    data: {
      moderationStatus: "REJECTED",
      moderatedAt: new Date(),
      moderatedByAdminId: moderatedByAdminId ?? null,
      rejectionReason: reason.length ? reason : null,
    },
  });

  await createMemberNotification(post.authorMemberId, "community_post_rejected", {
    postId: post.id,
    communitySlug: post.community.slug,
    reason: reason.length ? reason : null,
  });

  await enqueueCommunityPostRejectedDelivery(
    post.authorMemberId,
    post.id,
    post.community.slug,
    reason.length ? reason : null,
  );
  await processNotificationOutboxBatch(12);

  return { ok: true, communitySlug: post.community.slug };
}

export async function setCommunityMembershipBannedState(
  membershipId: string,
  communityId: string,
  state: "ACTIVE" | "BANNED",
  banReason?: string,
): Promise<{ ok: true; communitySlug: string } | { ok: false }> {
  const row = await prisma.communityMembership.findFirst({
    where: { id: membershipId, communityId },
    select: { id: true, community: { select: { slug: true } } },
  });
  if (!row) return { ok: false };

  await prisma.communityMembership.update({
    where: { id: row.id },
    data:
      state === "BANNED"
        ? {
            state: "BANNED",
            banReason: banReason ?? null,
            bannedAt: new Date(),
          }
        : {
            state: "ACTIVE",
            banReason: null,
            bannedAt: null,
          },
  });

  return { ok: true, communitySlug: row.community.slug };
}

export async function updateCommunityPostReportStatus(
  reportId: string,
  communityId: string,
  status: "REVIEWED" | "DISMISSED",
): Promise<{ ok: true } | { ok: false }> {
  const report = await prisma.communityPostReport.findFirst({
    where: {
      id: reportId,
      status: "OPEN",
      post: { communityId },
    },
    select: { id: true },
  });
  if (!report) return { ok: false };

  await prisma.communityPostReport.update({
    where: { id: report.id },
    data: { status, reviewedAt: new Date() },
  });

  return { ok: true };
}

export function revalidateCommunityModerationPaths(
  communityId: string,
  communitySlug: string,
  paths: {
    revalidatePath: (path: string) => void;
    postId?: string;
    parentPostId?: string | null;
  },
): void {
  const { revalidatePath: rev } = paths;
  rev(`/admin/communities/${communityId}`);
  rev("/admin/communities/moderation");
  rev(`/communities/${communitySlug}`);
  rev(`/communities/${communitySlug}/manage`);
  rev(`/communities/${communitySlug}/portal`);
  if (paths.postId) {
    rev(`/communities/${communitySlug}/post/${paths.postId}`);
  }
  if (paths.parentPostId) {
    rev(`/communities/${communitySlug}/post/${paths.parentPostId}`);
  }
}

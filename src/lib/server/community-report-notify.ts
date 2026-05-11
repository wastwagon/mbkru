import "server-only";

import { prisma } from "@/lib/db/prisma";

import { enqueueCommunityPostReportModeratorDelivery } from "@/lib/server/community-member-transactional-outbox";

import { createMemberNotification } from "./member-notifications";

export async function notifyCommunityModeratorsOfPostReport(args: {
  communityId: string;
  postId: string;
  reason: string;
  communitySlug: string;
  communityName: string;
  /** Excluded from moderator alerts (no self-notify when a moderator files a report). */
  reporterMemberId: string;
}): Promise<void> {
  const mods = await prisma.communityMembership.findMany({
    where: {
      communityId: args.communityId,
      state: "ACTIVE",
      role: { in: ["MODERATOR", "QUEEN_MOTHER_VERIFIED"] },
      memberId: { not: args.reporterMemberId },
    },
    select: { memberId: true },
  });

  const payload = {
    postId: args.postId,
    communityId: args.communityId,
    communitySlug: args.communitySlug,
    communityName: args.communityName,
    reason: args.reason,
  };

  await Promise.all(
    mods.map((m) => createMemberNotification(m.memberId, "community_post_reported", payload)),
  );

  await enqueueCommunityPostReportModeratorDelivery({
    moderatorMemberIds: mods.map((m) => m.memberId),
    communityName: args.communityName,
    communitySlug: args.communitySlug,
    postId: args.postId,
    reason: args.reason,
  });
}

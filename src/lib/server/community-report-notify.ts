import "server-only";

import { prisma } from "@/lib/db/prisma";

import { createMemberNotification } from "./member-notifications";

export async function notifyCommunityModeratorsOfPostReport(args: {
  communityId: string;
  postId: string;
  reason: string;
  communitySlug: string;
  communityName: string;
}): Promise<void> {
  const mods = await prisma.communityMembership.findMany({
    where: {
      communityId: args.communityId,
      state: "ACTIVE",
      role: { in: ["MODERATOR", "QUEEN_MOTHER_VERIFIED"] },
    },
    select: { memberId: true },
  });

  const payload = {
    postId: args.postId,
    communitySlug: args.communitySlug,
    communityName: args.communityName,
    reason: args.reason,
  };

  await Promise.all(
    mods.map((m) => createMemberNotification(m.memberId, "community_post_reported", payload)),
  );
}

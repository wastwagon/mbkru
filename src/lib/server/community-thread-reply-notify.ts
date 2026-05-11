import "server-only";

import { prisma } from "@/lib/db/prisma";
import { enqueueCommunityThreadReplyDelivery } from "@/lib/server/community-member-transactional-outbox";
import { createMemberNotification } from "@/lib/server/member-notifications";

/** Move the root thread up in “recent activity” forum sorts when a reply is published. */
export async function bumpThreadRootAfterReplyPublished(rootPostId: string): Promise<void> {
  await prisma.communityPost.updateMany({
    where: { id: rootPostId, parentPostId: null },
    data: { lastActivityAt: new Date() },
  });
}

/**
 * When a reply is published, notify the root thread author (if not self-reply).
 * Replies reference the thread root via `parentPostId` (flat one-level thread).
 */
export async function notifyThreadAuthorOfPublishedReply(opts: {
  replyPostId: string;
  replyAuthorMemberId: string;
  communitySlug: string;
  communityName: string;
  parentPostId: string | null;
}): Promise<void> {
  const { replyPostId, replyAuthorMemberId, communitySlug, communityName, parentPostId } = opts;
  if (!parentPostId) return;

  const root = await prisma.communityPost.findFirst({
    where: { id: parentPostId },
    select: { authorMemberId: true, id: true },
  });
  if (!root || root.authorMemberId === replyAuthorMemberId) return;

  await createMemberNotification(root.authorMemberId, "community_thread_reply", {
    communitySlug,
    communityName,
    threadPostId: root.id,
    replyPostId,
  });

  await enqueueCommunityThreadReplyDelivery(
    root.authorMemberId,
    communityName,
    communitySlug,
    root.id,
  );
}

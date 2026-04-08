import "server-only";

import { prisma } from "@/lib/db/prisma";

export async function markMemberNotificationsRead(
  memberId: string,
  input: { notificationId?: string; markAllRead?: boolean },
): Promise<void> {
  if (input.markAllRead) {
    await prisma.memberNotification.updateMany({
      where: { memberId, readAt: null },
      data: { readAt: new Date() },
    });
    return;
  }
  if (input.notificationId) {
    await prisma.memberNotification.updateMany({
      where: { id: input.notificationId, memberId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}

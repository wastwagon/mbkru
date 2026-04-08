import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export async function createMemberNotification(
  memberId: string,
  type: string,
  payload: Prisma.InputJsonValue,
): Promise<void> {
  await prisma.memberNotification.create({
    data: {
      memberId,
      type,
      payload,
    },
  });
}

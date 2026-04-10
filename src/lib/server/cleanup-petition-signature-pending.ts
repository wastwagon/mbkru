import "server-only";

import { prisma } from "@/lib/db/prisma";

/** Removes guest verification rows past `expiresAt` (harmless leftovers; cron can run daily). */
export async function deleteExpiredPetitionSignaturePending(): Promise<{ deleted: number }> {
  const result = await prisma.petitionSignaturePending.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return { deleted: result.count };
}

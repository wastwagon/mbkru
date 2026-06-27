import "server-only";

import { prisma } from "@/lib/db/prisma";

/** Active roster MP for a member's home constituency, if any. */
export async function findDefaultMpForConstituency(constituencyId: string | null | undefined) {
  if (!constituencyId) return null;
  return prisma.parliamentMember.findFirst({
    where: { active: true, constituencyId },
    select: { id: true, name: true, slug: true },
  });
}

export async function findDefaultMpForMember(memberId: string) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { constituencyId: true },
  });
  return findDefaultMpForConstituency(member?.constituencyId);
}

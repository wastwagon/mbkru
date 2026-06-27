import "server-only";

import type { CommunityMembershipRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { enqueueCommunityStewardCredentialsDelivery } from "@/lib/server/community-member-transactional-outbox";
import { generateTemporaryPassword } from "@/lib/server/generate-temporary-password";
import { processNotificationOutboxBatch } from "@/lib/server/notification-outbox";

const STEWARD_ROLES = new Set<CommunityMembershipRole>(["MODERATOR", "QUEEN_MOTHER_VERIFIED"]);

export type ProvisionCommunityStewardInput = {
  communityId: string;
  email: string;
  displayName?: string;
  role: CommunityMembershipRole;
};

export type ProvisionCommunityStewardResult =
  | {
      ok: true;
      memberId: string;
      email: string;
      createdMember: boolean;
      password: string;
      communitySlug: string;
      communityName: string;
    }
  | { ok: false; code: "invalid_role" | "community_not_found" | "email_invalid" };

export async function provisionCommunitySteward(
  input: ProvisionCommunityStewardInput,
): Promise<ProvisionCommunityStewardResult> {
  const email = input.email.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, code: "email_invalid" };
  }
  if (!STEWARD_ROLES.has(input.role)) {
    return { ok: false, code: "invalid_role" };
  }

  const community = await prisma.community.findUnique({
    where: { id: input.communityId },
    select: { id: true, slug: true, name: true, regionId: true },
  });
  if (!community) return { ok: false, code: "community_not_found" };

  const password = generateTemporaryPassword(16);
  const hash = await bcrypt.hash(password, 12);
  const displayName = input.displayName?.trim() || null;

  let memberId: string;
  let createdMember = false;

  const existing = await prisma.member.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    await prisma.member.update({
      where: { id: existing.id },
      data: {
        password: hash,
        ...(displayName ? { displayName } : {}),
      },
    });
    memberId = existing.id;
  } else {
    try {
      const created = await prisma.member.create({
        data: {
          email,
          password: hash,
          displayName,
          regionId: community.regionId,
        },
        select: { id: true },
      });
      memberId = created.id;
      createdMember = true;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        const again = await prisma.member.findUnique({ where: { email }, select: { id: true } });
        if (!again) throw e;
        await prisma.member.update({
          where: { id: again.id },
          data: { password: hash, ...(displayName ? { displayName } : {}) },
        });
        memberId = again.id;
      } else {
        throw e;
      }
    }
  }

  await prisma.communityMembership.upsert({
    where: {
      communityId_memberId: { communityId: community.id, memberId },
    },
    create: {
      communityId: community.id,
      memberId,
      role: input.role,
      state: "ACTIVE",
    },
    update: {
      role: input.role,
      state: "ACTIVE",
      banReason: null,
      bannedAt: null,
    },
  });

  if (input.role === "QUEEN_MOTHER_VERIFIED") {
    await prisma.communityVerificationRequest.updateMany({
      where: { communityId: community.id, memberId, status: "SUBMITTED" },
      data: { status: "APPROVED", reviewedAt: new Date(), reviewNotes: "Provisioned by MBKRU admin." },
    });
  }

  await enqueueCommunityStewardCredentialsDelivery({
    memberId,
    communityName: community.name,
    communitySlug: community.slug,
    email,
    password,
    role: input.role,
    createdMember,
  });
  await processNotificationOutboxBatch(8);

  return {
    ok: true,
    memberId,
    email,
    createdMember,
    password,
    communitySlug: community.slug,
    communityName: community.name,
  };
}

export type ResendCommunityStewardCredentialsResult =
  | {
      ok: true;
      memberId: string;
      email: string;
      communitySlug: string;
    }
  | { ok: false; code: "community_not_found" | "not_steward" | "member_not_found" };

/** Reset password and resend credentials for an existing steward membership. */
export async function resendCommunityStewardCredentials(input: {
  communityId: string;
  memberId: string;
}): Promise<ResendCommunityStewardCredentialsResult> {
  const community = await prisma.community.findUnique({
    where: { id: input.communityId },
    select: { id: true, slug: true, name: true },
  });
  if (!community) return { ok: false, code: "community_not_found" };

  const membership = await prisma.communityMembership.findUnique({
    where: {
      communityId_memberId: { communityId: community.id, memberId: input.memberId },
    },
    select: { role: true, state: true },
  });
  if (
    !membership ||
    membership.state !== "ACTIVE" ||
    !STEWARD_ROLES.has(membership.role)
  ) {
    return { ok: false, code: "not_steward" };
  }

  const member = await prisma.member.findUnique({
    where: { id: input.memberId },
    select: { id: true, email: true },
  });
  if (!member) return { ok: false, code: "member_not_found" };

  const password = generateTemporaryPassword(16);
  const hash = await bcrypt.hash(password, 12);
  await prisma.member.update({
    where: { id: member.id },
    data: { password: hash },
  });

  await enqueueCommunityStewardCredentialsDelivery({
    memberId: member.id,
    communityName: community.name,
    communitySlug: community.slug,
    email: member.email,
    password,
    role: membership.role,
    createdMember: false,
  });
  await processNotificationOutboxBatch(8);

  return { ok: true, memberId: member.id, email: member.email, communitySlug: community.slug };
}

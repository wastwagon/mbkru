"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";
import {
  approvePendingCommunityMembership,
  publishPendingCommunityPost,
  rejectPendingCommunityPost,
  revalidateCommunityModerationPaths,
} from "@/lib/server/community-moderation-ops";
import { provisionCommunitySteward, resendCommunityStewardCredentials } from "@/lib/server/community-steward-provision";
import { logAdminOperationalAudit } from "@/lib/server/admin-operational-audit";
import {
  enqueueCommunityVerificationOutcomeDelivery,
} from "@/lib/server/community-member-transactional-outbox";
import { createMemberNotification } from "@/lib/server/member-notifications";
import { processNotificationOutboxBatch } from "@/lib/server/notification-outbox";
import {
  communityForumCreateSchema,
  forumSlugFromName,
  isCommunitySlug,
} from "@/lib/validation/communities";

const cuid = z.string().cuid();

const createCommunitySchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .transform((s) => s.toLowerCase())
    .refine((s) => isCommunitySlug(s)),
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().min(1).max(50_000),
  joinPolicy: z.enum(["OPEN", "APPROVAL_REQUIRED"]),
  visibility: z.enum(["PUBLIC", "MEMBERS_ONLY"]),
  traditionalAreaName: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((s) => (s && s.length ? s : undefined)),
  regionId: z.preprocess(
    (v) => (typeof v === "string" && v.trim().length ? v.trim() : undefined),
    z.string().cuid().optional(),
  ),
});

export async function createCommunityAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const ta = String(formData.get("traditionalAreaName") ?? "").trim();
  const parsed = createCommunitySchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: formData.get("description"),
    joinPolicy: formData.get("joinPolicy"),
    visibility: formData.get("visibility"),
    traditionalAreaName: ta.length ? ta : undefined,
    regionId: formData.get("regionId") ?? undefined,
  });
  if (!parsed.success) return;

  if (parsed.data.regionId) {
    const r = await prisma.region.findUnique({ where: { id: parsed.data.regionId }, select: { id: true } });
    if (!r) return;
  }

  try {
    await prisma.community.create({
      data: {
        slug: parsed.data.slug,
        name: parsed.data.name,
        description: parsed.data.description,
        joinPolicy: parsed.data.joinPolicy,
        visibility: parsed.data.visibility,
        traditionalAreaName: parsed.data.traditionalAreaName ?? null,
        regionId: parsed.data.regionId ?? null,
        status: "DRAFT",
      },
    });
  } catch {
    return;
  }

  revalidatePath("/admin/communities");
}

export async function activateCommunityAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const idParsed = cuid.safeParse(formData.get("communityId"));
  if (!idParsed.success) return;

  await prisma.community.updateMany({
    where: { id: idParsed.data, status: "DRAFT" },
    data: { status: "ACTIVE" },
  });

  const c = await prisma.community.findUnique({
    where: { id: idParsed.data },
    select: { slug: true },
  });
  revalidatePath("/admin/communities");
  if (c) {
    revalidatePath("/communities");
    revalidatePath(`/communities/${c.slug}`);
  }
}

export async function approveCommunityMembershipAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const m = z
    .object({ membershipId: cuid, communityId: cuid })
    .safeParse({ membershipId: formData.get("membershipId"), communityId: formData.get("communityId") });
  if (!m.success) return;

  const result = await approvePendingCommunityMembership(m.data.membershipId, m.data.communityId);
  if (!result.ok) return;

  revalidatePath(`/admin/communities/${m.data.communityId}`);
  revalidatePath("/admin/communities");
  revalidatePath(`/communities/${result.communitySlug}`);
  revalidatePath(`/communities/${result.communitySlug}/manage`);
}

export async function publishCommunityPostAction(formData: FormData): Promise<void> {
  const { adminId } = await requireAdminSession();

  const p = z
    .object({ postId: cuid, communityId: cuid })
    .safeParse({ postId: formData.get("postId"), communityId: formData.get("communityId") });
  if (!p.success) return;

  const result = await publishPendingCommunityPost(p.data.postId, p.data.communityId, adminId);
  if (!result.ok) return;

  revalidateCommunityModerationPaths(p.data.communityId, result.communitySlug, {
    revalidatePath,
    postId: p.data.postId,
    parentPostId: result.parentPostId,
  });
}

export async function rejectCommunityPostAction(formData: FormData): Promise<void> {
  const { adminId } = await requireAdminSession();

  const reason = String(formData.get("reason") ?? "").trim().slice(0, 2000);

  const p = z
    .object({ postId: cuid, communityId: cuid })
    .safeParse({ postId: formData.get("postId"), communityId: formData.get("communityId") });
  if (!p.success) return;

  const result = await rejectPendingCommunityPost(p.data.postId, p.data.communityId, reason, adminId);
  if (!result.ok) return;

  revalidateCommunityModerationPaths(p.data.communityId, result.communitySlug, {
    revalidatePath,
    postId: p.data.postId,
  });
}

const membershipRoleSchema = z.enum(["MEMBER", "MODERATOR", "QUEEN_MOTHER_VERIFIED"]);
const membershipStateSchema = z.enum(["ACTIVE", "BANNED"]);

export async function setCommunityMembershipRoleAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const parsed = z
    .object({
      membershipId: cuid,
      communityId: cuid,
      role: membershipRoleSchema,
    })
    .safeParse({
      membershipId: formData.get("membershipId"),
      communityId: formData.get("communityId"),
      role: formData.get("role"),
    });
  if (!parsed.success) return;

  await prisma.communityMembership.updateMany({
    where: {
      id: parsed.data.membershipId,
      communityId: parsed.data.communityId,
      state: "ACTIVE",
    },
    data: { role: parsed.data.role },
  });

  const c = await prisma.community.findUnique({
    where: { id: parsed.data.communityId },
    select: { slug: true },
  });
  revalidatePath(`/admin/communities/${parsed.data.communityId}`);
  if (c) revalidatePath(`/communities/${c.slug}`);
}

export async function setCommunityMembershipStateAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const banReasonRaw = String(formData.get("banReason") ?? "").trim().slice(0, 2000);

  const parsed = z
    .object({
      membershipId: cuid,
      communityId: cuid,
      state: membershipStateSchema,
      banReason: z.string().max(2000).optional(),
    })
    .safeParse({
      membershipId: formData.get("membershipId"),
      communityId: formData.get("communityId"),
      state: formData.get("state"),
      banReason: banReasonRaw.length ? banReasonRaw : undefined,
    });
  if (!parsed.success) return;

  const row = await prisma.communityMembership.findFirst({
    where: {
      id: parsed.data.membershipId,
      communityId: parsed.data.communityId,
    },
    select: { id: true },
  });
  if (!row) return;

  await prisma.communityMembership.update({
    where: { id: row.id },
    data:
      parsed.data.state === "BANNED"
        ? {
            state: "BANNED",
            banReason: parsed.data.banReason ?? null,
            bannedAt: new Date(),
          }
        : {
            state: "ACTIVE",
            banReason: null,
            bannedAt: null,
          },
  });

  const c = await prisma.community.findUnique({
    where: { id: parsed.data.communityId },
    select: { slug: true },
  });
  revalidatePath(`/admin/communities/${parsed.data.communityId}`);
  if (c) revalidatePath(`/communities/${c.slug}`);
}

export async function updateCommunityPostReportStatusAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const parsed = z
    .object({
      reportId: cuid,
      communityId: cuid,
      status: z.enum(["REVIEWED", "DISMISSED"]),
    })
    .safeParse({
      reportId: formData.get("reportId"),
      communityId: formData.get("communityId"),
      status: formData.get("status"),
    });
  if (!parsed.success) return;

  const report = await prisma.communityPostReport.findFirst({
    where: {
      id: parsed.data.reportId,
      status: "OPEN",
      post: { communityId: parsed.data.communityId },
    },
    select: { id: true },
  });
  if (!report) return;

  await prisma.communityPostReport.update({
    where: { id: report.id },
    data: { status: parsed.data.status, reviewedAt: new Date() },
  });

  revalidatePath(`/admin/communities/${parsed.data.communityId}`);
}

export async function updateCommunityPostReportStatusFromQueueAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const parsed = z
    .object({
      reportId: cuid,
      status: z.enum(["REVIEWED", "DISMISSED"]),
    })
    .safeParse({
      reportId: formData.get("reportId"),
      status: formData.get("status"),
    });
  if (!parsed.success) return;

  const report = await prisma.communityPostReport.findFirst({
    where: {
      id: parsed.data.reportId,
      status: "OPEN",
    },
    select: { id: true, post: { select: { communityId: true, community: { select: { slug: true } } } } },
  });
  if (!report) return;

  await prisma.communityPostReport.update({
    where: { id: report.id },
    data: { status: parsed.data.status, reviewedAt: new Date() },
  });

  revalidatePath("/admin/community-reports");
  revalidatePath(`/admin/communities/${report.post.communityId}`);
  revalidatePath(`/communities/${report.post.community.slug}`);
}

export async function reviewCommunityVerificationAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const parsed = z
    .object({
      requestId: cuid,
      status: z.enum(["APPROVED", "REJECTED"]),
      notes: z
        .string()
        .trim()
        .max(2000)
        .optional()
        .transform((s) => (s && s.length ? s : undefined)),
    })
    .safeParse({
      requestId: formData.get("requestId"),
      status: formData.get("status"),
      notes: formData.get("notes"),
    });
  if (!parsed.success) return;

  const req = await prisma.communityVerificationRequest.findFirst({
    where: { id: parsed.data.requestId, status: "SUBMITTED" },
    select: {
      id: true,
      memberId: true,
      communityId: true,
      community: { select: { slug: true, name: true } },
    },
  });
  if (!req) return;

  await prisma.$transaction(async (tx) => {
    await tx.communityVerificationRequest.update({
      where: { id: req.id },
      data: {
        status: parsed.data.status,
        reviewNotes: parsed.data.notes ?? null,
        reviewedAt: new Date(),
      },
    });

    if (parsed.data.status === "APPROVED") {
      await tx.communityMembership.updateMany({
        where: {
          communityId: req.communityId,
          memberId: req.memberId,
          state: "ACTIVE",
        },
        data: { role: "QUEEN_MOTHER_VERIFIED" },
      });
    }
  });

  await createMemberNotification(
    req.memberId,
    parsed.data.status === "APPROVED" ? "community_verification_approved" : "community_verification_rejected",
    {
      communitySlug: req.community.slug,
      communityName: req.community.name,
      notes: parsed.data.notes ?? null,
    },
  );

  await enqueueCommunityVerificationOutcomeDelivery(
    req.memberId,
    parsed.data.status === "APPROVED",
    req.community.name,
    req.community.slug,
    parsed.data.notes ?? null,
  );
  await processNotificationOutboxBatch(12);

  revalidatePath("/admin/community-verifications");
  revalidatePath(`/admin/communities/${req.communityId}`);
  revalidatePath(`/communities/${req.community.slug}`);
}

const forumUpdateSchema = z.object({
  forumId: cuid,
  communityId: cuid,
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .transform((s) => (s && s.length ? s : undefined)),
  locked: z.enum(["0", "1"]),
});

export async function createCommunityForumAdminAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const communityIdParsed = cuid.safeParse(formData.get("communityId"));
  if (!communityIdParsed.success) return;

  const parsed = communityForumCreateSchema.safeParse({
    name: formData.get("name"),
    slug: (() => {
      const s = String(formData.get("slug") ?? "").trim();
      return s.length ? s : undefined;
    })(),
    description: String(formData.get("description") ?? "").trim() || undefined,
  });
  if (!parsed.success) return;

  const community = await prisma.community.findUnique({
    where: { id: communityIdParsed.data },
    select: { id: true, slug: true },
  });
  if (!community) return;

  const baseSlug = parsed.data.slug ?? forumSlugFromName(parsed.data.name);
  let candidate = baseSlug;
  for (let n = 0; n < 30; n += 1) {
    const taken = await prisma.communityForum.findUnique({
      where: { communityId_slug: { communityId: community.id, slug: candidate } },
      select: { id: true },
    });
    if (!taken) break;
    candidate = `${baseSlug}-${n + 2}`;
  }

  try {
    await prisma.communityForum.create({
      data: {
        communityId: community.id,
        slug: candidate,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
      },
    });
  } catch {
    return;
  }

  revalidatePath(`/admin/communities/${community.id}`);
  revalidatePath(`/communities/${community.slug}`);
  revalidatePath(`/communities/${community.slug}/forums`);
}

export async function updateCommunityForumAdminAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const parsed = forumUpdateSchema.safeParse({
    forumId: formData.get("forumId"),
    communityId: formData.get("communityId"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: String(formData.get("description") ?? "").trim() || undefined,
    locked: formData.get("locked"),
  });
  if (!parsed.success) return;

  const forum = await prisma.communityForum.findFirst({
    where: { id: parsed.data.forumId, communityId: parsed.data.communityId },
    select: {
      id: true,
      slug: true,
      community: { select: { slug: true } },
    },
  });
  if (!forum) return;

  if (parsed.data.slug !== forum.slug) {
    const clash = await prisma.communityForum.findFirst({
      where: {
        communityId: parsed.data.communityId,
        slug: parsed.data.slug,
        NOT: { id: forum.id },
      },
      select: { id: true },
    });
    if (clash) return;
  }

  try {
    await prisma.communityForum.update({
      where: { id: forum.id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description ?? null,
        locked: parsed.data.locked === "1",
      },
    });
  } catch {
    return;
  }

  const c = await prisma.community.findUnique({
    where: { id: parsed.data.communityId },
    select: { slug: true },
  });
  revalidatePath(`/admin/communities/${parsed.data.communityId}`);
  if (c) {
    revalidatePath(`/communities/${c.slug}`);
    revalidatePath(`/communities/${c.slug}/forums`);
    revalidatePath(`/communities/${c.slug}/forums/${forum.slug}`);
    revalidatePath(`/communities/${c.slug}/forums/${parsed.data.slug}`);
  }
}

export async function deleteCommunityForumAdminAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const ids = z
    .object({
      forumId: cuid,
      communityId: cuid,
    })
    .safeParse({
      forumId: formData.get("forumId"),
      communityId: formData.get("communityId"),
    });
  if (!ids.success) return;

  const postCount = await prisma.communityPost.count({
    where: { communityForumId: ids.data.forumId },
  });
  if (postCount > 0) return;

  const forum = await prisma.communityForum.findFirst({
    where: { id: ids.data.forumId, communityId: ids.data.communityId },
    select: { id: true },
  });
  if (!forum) return;

  await prisma.communityForum.delete({ where: { id: forum.id } });

  const c = await prisma.community.findUnique({
    where: { id: ids.data.communityId },
    select: { slug: true },
  });
  revalidatePath(`/admin/communities/${ids.data.communityId}`);
  if (c) {
    revalidatePath(`/communities/${c.slug}`);
    revalidatePath(`/communities/${c.slug}/forums`);
  }
}

const stewardRoleSchema = z.enum(["MODERATOR", "QUEEN_MOTHER_VERIFIED"]);

function stewardRedirect(path: string): never {
  redirect(path);
}

export async function provisionCommunityStewardAction(formData: FormData): Promise<void> {
  const session = await requireAdminSession();

  const parsed = z
    .object({
      communityId: cuid,
      email: z.string().trim().toLowerCase().email().max(320),
      displayName: z.string().trim().max(120).optional(),
      role: stewardRoleSchema,
    })
    .safeParse({
      communityId: formData.get("communityId"),
      email: formData.get("email"),
      displayName: String(formData.get("displayName") ?? "").trim() || undefined,
      role: formData.get("role"),
    });

  const communityId = String(formData.get("communityId") ?? "");
  const base = `/admin/communities/${communityId}`;

  if (!parsed.success) {
    stewardRedirect(`${base}?steward=invalid`);
  }

  const result = await provisionCommunitySteward({
    communityId: parsed.data.communityId,
    email: parsed.data.email,
    displayName: parsed.data.displayName,
    role: parsed.data.role,
  });

  if (!result.ok) {
    stewardRedirect(`${base}?steward=${result.code}`);
  }

  await logAdminOperationalAudit({
    adminId: session.adminId,
    action: "community_steward_provisioned",
    details: {
      communityId: parsed.data.communityId,
      memberId: result.memberId,
      email: result.email,
      role: parsed.data.role,
      createdMember: result.createdMember,
    },
  });

  revalidatePath(base);
  revalidatePath(`/communities/${result.communitySlug}`);
  revalidatePath(`/communities/${result.communitySlug}/manage`);
  revalidatePath(`/communities/${result.communitySlug}/portal`);

  stewardRedirect(`${base}?steward=sent`);
}

export async function resendCommunityStewardCredentialsAction(formData: FormData): Promise<void> {
  const session = await requireAdminSession();

  const parsed = z
    .object({
      communityId: cuid,
      memberId: cuid,
    })
    .safeParse({
      communityId: formData.get("communityId"),
      memberId: formData.get("memberId"),
    });

  const communityId = String(formData.get("communityId") ?? "");
  const base = `/admin/communities/${communityId}`;

  if (!parsed.success) {
    stewardRedirect(`${base}?steward=invalid`);
  }

  const result = await resendCommunityStewardCredentials({
    communityId: parsed.data.communityId,
    memberId: parsed.data.memberId,
  });

  if (!result.ok) {
    stewardRedirect(`${base}?steward=${result.code}`);
  }

  await logAdminOperationalAudit({
    adminId: session.adminId,
    action: "community_steward_credentials_resent",
    details: {
      communityId: parsed.data.communityId,
      memberId: result.memberId,
      email: result.email,
    },
  });

  revalidatePath(base);
  stewardRedirect(`${base}?steward=resent`);
}

const updateCommunityDefaultMpSchema = z.object({
  communityId: cuid,
  defaultParliamentMemberId: z.preprocess(
    (v) => (typeof v === "string" && v.trim().length ? v.trim() : null),
    z.string().cuid().nullable(),
  ),
});

export async function updateCommunityDefaultParliamentMemberAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const parsed = updateCommunityDefaultMpSchema.safeParse({
    communityId: formData.get("communityId"),
    defaultParliamentMemberId: formData.get("defaultParliamentMemberId"),
  });
  if (!parsed.success) return;

  const community = await prisma.community.findUnique({
    where: { id: parsed.data.communityId },
    select: { id: true, slug: true },
  });
  if (!community) return;

  if (parsed.data.defaultParliamentMemberId) {
    const mp = await prisma.parliamentMember.findUnique({
      where: { id: parsed.data.defaultParliamentMemberId, active: true },
      select: { id: true },
    });
    if (!mp) return;
  }

  await prisma.community.update({
    where: { id: community.id },
    data: { defaultParliamentMemberId: parsed.data.defaultParliamentMemberId },
  });

  revalidatePath(`/admin/communities/${community.id}`);
  revalidatePath(`/communities/${community.slug}/portal`);
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";
import {
  bumpThreadRootAfterReplyPublished,
  notifyThreadAuthorOfPublishedReply,
} from "@/lib/server/community-thread-reply-notify";
import { createMemberNotification } from "@/lib/server/member-notifications";
import { isCommunitySlug } from "@/lib/validation/communities";

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

  const row = await prisma.communityMembership.findFirst({
    where: {
      id: m.data.membershipId,
      communityId: m.data.communityId,
      state: "PENDING_JOIN",
    },
    include: { community: { select: { slug: true, name: true } } },
  });
  if (!row) return;

  await prisma.communityMembership.update({
    where: { id: row.id },
    data: { state: "ACTIVE" },
  });

  await createMemberNotification(row.memberId, "community_join_approved", {
    communitySlug: row.community.slug,
    communityName: row.community.name,
  });

  revalidatePath(`/admin/communities/${m.data.communityId}`);
  revalidatePath("/admin/communities");
  revalidatePath(`/communities/${row.community.slug}`);
}

export async function publishCommunityPostAction(formData: FormData): Promise<void> {
  const { adminId } = await requireAdminSession();

  const p = z
    .object({ postId: cuid, communityId: cuid })
    .safeParse({ postId: formData.get("postId"), communityId: formData.get("communityId") });
  if (!p.success) return;

  const post = await prisma.communityPost.findFirst({
    where: {
      id: p.data.postId,
      communityId: p.data.communityId,
      moderationStatus: "PENDING",
    },
    select: {
      id: true,
      authorMemberId: true,
      parentPostId: true,
      community: { select: { slug: true, name: true } },
    },
  });
  if (!post) return;

  await prisma.communityPost.update({
    where: { id: post.id },
    data: {
      moderationStatus: "PUBLISHED",
      moderatedAt: new Date(),
      moderatedByAdminId: adminId,
    },
  });

  await createMemberNotification(post.authorMemberId, "community_post_published", {
    postId: post.id,
    communitySlug: post.community.slug,
  });

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

  revalidatePath(`/admin/communities/${p.data.communityId}`);
  revalidatePath("/admin/communities/moderation");
  revalidatePath(`/communities/${post.community.slug}`);
  revalidatePath(`/communities/${post.community.slug}/post/${post.id}`);
  if (post.parentPostId) {
    revalidatePath(`/communities/${post.community.slug}/post/${post.parentPostId}`);
  }
}

export async function rejectCommunityPostAction(formData: FormData): Promise<void> {
  const { adminId } = await requireAdminSession();

  const reason = String(formData.get("reason") ?? "").trim().slice(0, 2000);

  const p = z
    .object({ postId: cuid, communityId: cuid })
    .safeParse({ postId: formData.get("postId"), communityId: formData.get("communityId") });
  if (!p.success) return;

  const post = await prisma.communityPost.findFirst({
    where: {
      id: p.data.postId,
      communityId: p.data.communityId,
      moderationStatus: "PENDING",
    },
    select: {
      id: true,
      authorMemberId: true,
      community: { select: { slug: true } },
    },
  });
  if (!post) return;

  await prisma.communityPost.update({
    where: { id: post.id },
    data: {
      moderationStatus: "REJECTED",
      moderatedAt: new Date(),
      moderatedByAdminId: adminId,
      rejectionReason: reason.length ? reason : null,
    },
  });

  await createMemberNotification(post.authorMemberId, "community_post_rejected", {
    postId: post.id,
    communitySlug: post.community.slug,
    reason: reason.length ? reason : null,
  });

  revalidatePath(`/admin/communities/${p.data.communityId}`);
  revalidatePath("/admin/communities/moderation");
  revalidatePath(`/communities/${post.community.slug}`);
  revalidatePath(`/communities/${post.community.slug}/post/${post.id}`);
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

  revalidatePath("/admin/community-verifications");
  revalidatePath(`/admin/communities/${req.communityId}`);
  revalidatePath(`/communities/${req.community.slug}`);
}

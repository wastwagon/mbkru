"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import {
  approvePendingCommunityMembership,
  publishPendingCommunityPost,
  rejectPendingCommunityPost,
  revalidateCommunityModerationPaths,
  setCommunityMembershipBannedState,
  updateCommunityPostReportStatus,
} from "@/lib/server/community-moderation-ops";
import { requireCommunityLeadership } from "@/lib/server/require-community-leadership";

const cuid = z.string().cuid();
const leadershipAssignableRoleSchema = z.enum(["MEMBER", "MODERATOR"]);

export async function approveCommunityMembershipLeadershipAction(formData: FormData): Promise<void> {
  const communitySlug = String(formData.get("communitySlug") ?? "").trim().toLowerCase();
  const leadership = await requireCommunityLeadership(communitySlug);

  const parsed = z
    .object({ membershipId: cuid })
    .safeParse({ membershipId: formData.get("membershipId") });
  if (!parsed.success) return;

  const result = await approvePendingCommunityMembership(parsed.data.membershipId, leadership.communityId);
  if (!result.ok) return;

  revalidatePath(`/communities/${leadership.communitySlug}/manage`);
  revalidatePath(`/communities/${leadership.communitySlug}`);
  revalidatePath(`/admin/communities/${leadership.communityId}`);
}

export async function setCommunityMembershipStateLeadershipAction(formData: FormData): Promise<void> {
  const communitySlug = String(formData.get("communitySlug") ?? "").trim().toLowerCase();
  const leadership = await requireCommunityLeadership(communitySlug);

  const banReasonRaw = String(formData.get("banReason") ?? "").trim().slice(0, 2000);
  const parsed = z
    .object({
      membershipId: cuid,
      state: z.enum(["ACTIVE", "BANNED"]),
      banReason: z.string().max(2000).optional(),
    })
    .safeParse({
      membershipId: formData.get("membershipId"),
      state: formData.get("state"),
      banReason: banReasonRaw.length ? banReasonRaw : undefined,
    });
  if (!parsed.success) return;

  const result = await setCommunityMembershipBannedState(
    parsed.data.membershipId,
    leadership.communityId,
    parsed.data.state,
    parsed.data.banReason,
  );
  if (!result.ok) return;

  revalidatePath(`/communities/${leadership.communitySlug}/manage`);
  revalidatePath(`/communities/${leadership.communitySlug}`);
  revalidatePath(`/admin/communities/${leadership.communityId}`);
}

export async function publishCommunityPostLeadershipAction(formData: FormData): Promise<void> {
  const communitySlug = String(formData.get("communitySlug") ?? "").trim().toLowerCase();
  const leadership = await requireCommunityLeadership(communitySlug);

  const parsed = z.object({ postId: cuid }).safeParse({ postId: formData.get("postId") });
  if (!parsed.success) return;

  const result = await publishPendingCommunityPost(parsed.data.postId, leadership.communityId);
  if (!result.ok) return;

  revalidateCommunityModerationPaths(leadership.communityId, leadership.communitySlug, {
    revalidatePath,
    postId: parsed.data.postId,
    parentPostId: result.parentPostId,
  });
}

export async function rejectCommunityPostLeadershipAction(formData: FormData): Promise<void> {
  const communitySlug = String(formData.get("communitySlug") ?? "").trim().toLowerCase();
  const leadership = await requireCommunityLeadership(communitySlug);

  const reason = String(formData.get("reason") ?? "").trim().slice(0, 2000);
  const parsed = z.object({ postId: cuid }).safeParse({ postId: formData.get("postId") });
  if (!parsed.success) return;

  const result = await rejectPendingCommunityPost(parsed.data.postId, leadership.communityId, reason);
  if (!result.ok) return;

  revalidateCommunityModerationPaths(leadership.communityId, leadership.communitySlug, {
    revalidatePath,
    postId: parsed.data.postId,
  });
}

export async function updateCommunityPostReportStatusLeadershipAction(formData: FormData): Promise<void> {
  const communitySlug = String(formData.get("communitySlug") ?? "").trim().toLowerCase();
  const leadership = await requireCommunityLeadership(communitySlug);

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

  const result = await updateCommunityPostReportStatus(
    parsed.data.reportId,
    leadership.communityId,
    parsed.data.status,
  );
  if (!result.ok) return;

  revalidatePath(`/communities/${leadership.communitySlug}/manage`);
  revalidatePath(`/admin/communities/${leadership.communityId}`);
}

export async function setCommunityMembershipRoleLeadershipAction(formData: FormData): Promise<void> {
  const communitySlug = String(formData.get("communitySlug") ?? "").trim().toLowerCase();
  const leadership = await requireCommunityLeadership(communitySlug);

  const parsed = z
    .object({
      membershipId: cuid,
      role: leadershipAssignableRoleSchema,
    })
    .safeParse({
      membershipId: formData.get("membershipId"),
      role: formData.get("role"),
    });
  if (!parsed.success) return;

  const target = await prisma.communityMembership.findFirst({
    where: {
      id: parsed.data.membershipId,
      communityId: leadership.communityId,
      state: "ACTIVE",
    },
    select: { id: true, memberId: true, role: true },
  });
  if (!target || target.memberId === leadership.memberId) return;
  if (target.role === "QUEEN_MOTHER_VERIFIED") return;

  if (leadership.role === "MODERATOR" && parsed.data.role !== "MEMBER") return;

  await prisma.communityMembership.update({
    where: { id: target.id },
    data: { role: parsed.data.role },
  });

  revalidatePath(`/communities/${leadership.communitySlug}/manage`);
  revalidatePath(`/communities/${leadership.communitySlug}`);
  revalidatePath(`/admin/communities/${leadership.communityId}`);
}

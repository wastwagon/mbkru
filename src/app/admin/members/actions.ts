"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";
import { createMemberNotification } from "@/lib/server/member-notifications";

const identityStatusSchema = z.enum(["UNVERIFIED", "PENDING_REVIEW", "VERIFIED", "REJECTED"]);

const updateIdentitySchema = z.object({
  memberId: z.string().cuid(),
  identityVerificationStatus: identityStatusSchema,
  identityVerificationNote: z.string().trim().max(10_000).optional(),
});

export async function updateMemberIdentityVerificationAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const parsed = updateIdentitySchema.safeParse({
    memberId: formData.get("memberId"),
    identityVerificationStatus: formData.get("identityVerificationStatus"),
    identityVerificationNote: String(formData.get("identityVerificationNote") ?? "").trim() || undefined,
  });
  if (!parsed.success) return;

  const previous = await prisma.member.findUnique({
    where: { id: parsed.data.memberId },
    select: { identityVerificationStatus: true },
  });
  if (!previous) return;

  const identityVerifiedAt = parsed.data.identityVerificationStatus === "VERIFIED" ? new Date() : null;

  await prisma.member.update({
    where: { id: parsed.data.memberId },
    data: {
      identityVerificationStatus: parsed.data.identityVerificationStatus,
      identityVerificationNote: parsed.data.identityVerificationNote ?? null,
      identityVerifiedAt,
    },
  });

  if (previous.identityVerificationStatus !== parsed.data.identityVerificationStatus) {
    await createMemberNotification(parsed.data.memberId, "identity_verification_updated", {
      status: parsed.data.identityVerificationStatus,
      previousStatus: previous.identityVerificationStatus,
    });
  }

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${parsed.data.memberId}`);
  revalidatePath("/account");
  revalidatePath("/account/notifications");
}

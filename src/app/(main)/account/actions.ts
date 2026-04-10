"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/member/session";

const requestSchema = z.object({
  message: z.string().trim().max(2000).optional(),
});

export async function requestIdentityReviewAction(formData: FormData): Promise<void> {
  const session = await getMemberSession();
  if (!session) return;

  const rawMessage = String(formData.get("message") ?? "").trim();
  const parsed = requestSchema.safeParse(rawMessage ? { message: rawMessage } : {});
  if (!parsed.success) return;

  const member = await prisma.member.findUnique({
    where: { id: session.memberId },
    select: { identityVerificationStatus: true },
  });
  if (
    !member ||
    (member.identityVerificationStatus !== "UNVERIFIED" && member.identityVerificationStatus !== "REJECTED")
  ) {
    return;
  }

  await prisma.member.update({
    where: { id: session.memberId },
    data: {
      identityVerificationStatus: "PENDING_REVIEW",
      identityReviewRequestedAt: new Date(),
      identityReviewRequestMessage: parsed.data.message ?? null,
    },
  });

  revalidatePath("/account");
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${session.memberId}`);
}

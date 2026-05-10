"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/member/session";

const requestSchema = z.object({
  message: z.string().trim().max(2000).optional(),
});

const homeLocationSchema = z.object({
  regionId: z.string().cuid(),
  constituencyId: z.union([z.string().cuid(), z.literal("")]).optional(),
});

export async function updateMemberHomeLocationAction(formData: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getMemberSession();
  if (!session) return { ok: false, error: "Sign in required." };

  const regionId = String(formData.get("regionId") ?? "").trim();
  const constituencyIdRaw = String(formData.get("constituencyId") ?? "").trim();
  const parsed = homeLocationSchema.safeParse({
    regionId,
    constituencyId: constituencyIdRaw || "",
  });
  if (!parsed.success) {
    return { ok: false, error: "Invalid region or constituency." };
  }

  const region = await prisma.region.findUnique({ where: { id: parsed.data.regionId } });
  if (!region) return { ok: false, error: "Invalid region." };

  let constituencyId: string | null = null;
  const cRaw = parsed.data.constituencyId?.trim() ?? "";
  if (cRaw.length > 0) {
    const c = await prisma.constituency.findFirst({
      where: { id: cRaw, regionId: region.id },
      select: { id: true },
    });
    if (!c) return { ok: false, error: "Constituency does not match region." };
    constituencyId = c.id;
  }

  await prisma.member.update({
    where: { id: session.memberId },
    data: { regionId: region.id, constituencyId },
  });

  revalidatePath("/account");
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${session.memberId}`);
  return { ok: true };
}

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

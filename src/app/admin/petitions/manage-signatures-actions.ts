"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";
import { logAdminOperationalAudit } from "@/lib/server/admin-operational-audit";

const cuid = z.string().cuid();

export async function adminRemovePetitionSignatureAction(formData: FormData): Promise<void> {
  const session = await requireAdminSession();

  const parsed = z
    .object({
      petitionId: cuid,
      signatureId: cuid,
    })
    .safeParse({
      petitionId: formData.get("petitionId"),
      signatureId: formData.get("signatureId"),
    });
  if (!parsed.success) {
    redirect(`/admin/petitions?error=invalid`);
  }

  const petition = await prisma.petition.findUnique({
    where: { id: parsed.data.petitionId },
    select: { id: true, slug: true },
  });
  if (!petition) {
    redirect(`/admin/petitions?error=notfound`);
  }

  const sig = await prisma.petitionSignature.findFirst({
    where: { id: parsed.data.signatureId, petitionId: petition.id },
    select: { id: true, signerEmail: true },
  });
  if (!sig) {
    redirect(`/admin/petitions/${petition.id}?error=sig`);
  }

  await prisma.petitionSignature.delete({ where: { id: sig.id } });

  await logAdminOperationalAudit({
    adminId: session.adminId,
    action: "petition_signature_removed",
    details: {
      petitionId: petition.id,
      signatureId: sig.id,
      signerEmail: sig.signerEmail,
    },
  });

  revalidatePath("/petitions");
  revalidatePath(`/petitions/${petition.slug}`);
  revalidatePath("/admin/petitions");
  revalidatePath(`/admin/petitions/${petition.id}`);

  redirect(`/admin/petitions/${petition.id}?saved=removed-sig`);
}

export async function adminRemovePetitionPendingSignatureAction(formData: FormData): Promise<void> {
  const session = await requireAdminSession();

  const parsed = z
    .object({
      petitionId: cuid,
      pendingId: cuid,
    })
    .safeParse({
      petitionId: formData.get("petitionId"),
      pendingId: formData.get("pendingId"),
    });
  if (!parsed.success) {
    redirect(`/admin/petitions?error=invalid`);
  }

  const petition = await prisma.petition.findUnique({
    where: { id: parsed.data.petitionId },
    select: { id: true, slug: true },
  });
  if (!petition) {
    redirect(`/admin/petitions?error=notfound`);
  }

  const row = await prisma.petitionSignaturePending.findFirst({
    where: { id: parsed.data.pendingId, petitionId: petition.id },
    select: { id: true, signerEmail: true },
  });
  if (!row) {
    redirect(`/admin/petitions/${petition.id}?error=pending`);
  }

  await prisma.petitionSignaturePending.delete({ where: { id: row.id } });

  await logAdminOperationalAudit({
    adminId: session.adminId,
    action: "petition_signature_pending_removed",
    details: {
      petitionId: petition.id,
      pendingId: row.id,
      signerEmail: row.signerEmail,
    },
  });

  revalidatePath("/admin/analytics/petition-pending");
  revalidatePath(`/admin/petitions/${petition.id}`);

  redirect(`/admin/petitions/${petition.id}?saved=removed-pending`);
}

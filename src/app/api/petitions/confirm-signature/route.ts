import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { isCivicPetitionsAndPublicCausesEnabled } from "@/lib/reports/accountability-pages";
import { hashPetitionSignatureToken } from "@/lib/server/petition-signature-token";

export const dynamic = "force-dynamic";

function redirectOrigin(request: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  if (env.startsWith("http")) return env.replace(/\/$/, "");
  return new URL(request.url).origin;
}

export async function GET(request: Request) {
  const origin = redirectOrigin(request);
  const fail = (code: string) =>
    NextResponse.redirect(new URL(`/petitions?verify=${encodeURIComponent(code)}`, origin));

  if (!isCivicPetitionsAndPublicCausesEnabled() || !isDatabaseConfigured()) {
    return fail("unavailable");
  }

  const url = new URL(request.url);
  const raw = url.searchParams.get("t")?.trim() ?? "";
  if (raw.length < 32 || raw.length > 128) return fail("invalid");

  const tokenHash = hashPetitionSignatureToken(raw);

  const pending = await prisma.petitionSignaturePending.findUnique({
    where: { tokenHash },
    include: { petition: { select: { id: true, slug: true, status: true } } },
  });

  if (!pending) return fail("invalid");

  if (pending.expiresAt.getTime() < Date.now()) {
    await prisma.petitionSignaturePending.delete({ where: { id: pending.id } }).catch(() => {});
    return fail("expired");
  }

  if (pending.petition.status !== "OPEN") return fail("closed");

  await prisma.$transaction(async (tx) => {
    await tx.petitionSignature.upsert({
      where: {
        petitionId_signerEmail: {
          petitionId: pending.petitionId,
          signerEmail: pending.signerEmail,
        },
      },
      create: {
        petitionId: pending.petitionId,
        memberId: null,
        signerEmail: pending.signerEmail,
        signerName: pending.signerName,
        consentShowName: pending.consentShowName,
        consentUpdates: pending.consentUpdates,
      },
      update: {
        signerName: pending.signerName,
        consentShowName: pending.consentShowName,
        consentUpdates: pending.consentUpdates,
      },
    });
    await tx.petitionSignaturePending.delete({ where: { id: pending.id } });
  });

  revalidatePath("/petitions");
  revalidatePath(`/petitions/${pending.petition.slug}`);

  return NextResponse.redirect(
    new URL(`/petitions/${encodeURIComponent(pending.petition.slug)}?verify=confirmed`, origin),
  );
}

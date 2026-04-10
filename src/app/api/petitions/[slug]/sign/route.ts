import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { isPetitionGuestEmailVerificationEnabled } from "@/lib/server/petition-guest-verification";
import {
  hashPetitionSignatureToken,
  newPetitionSignatureRawToken,
} from "@/lib/server/petition-signature-token";
import { sendPetitionSignatureVerificationEmail } from "@/lib/server/send-petition-signature-verification-email";
import { requireTurnstileIfConfigured } from "@/lib/server/verify-turnstile";
import { isCivicPetitionsAndPublicCausesEnabled } from "@/lib/reports/accountability-pages";
import { petitionSignBodySchema } from "@/lib/validation/civic-engagement";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function POST(request: Request, { params }: Props) {
  if (!isCivicPetitionsAndPublicCausesEnabled() || !isDatabaseConfigured()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!(await allowPublicFormRequest(request, "petitions-sign"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { slug: raw } = await params;
  const slug = raw.trim().toLowerCase();
  if (!slug) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = petitionSignBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const session = await getMemberSession();
  const memberAuthed = Boolean(session && platformFeatures.authentication(getServerPlatformPhase()));

  if (!memberAuthed) {
    const turnstileBlock = await requireTurnstileIfConfigured(request, parsed.data.turnstileToken);
    if (turnstileBlock) return turnstileBlock;
  }

  const authGuard = guardMemberAuthApi();
  if (memberAuthed && authGuard) return authGuard;

  const email = parsed.data.signerEmail.trim().toLowerCase();
  let memberId: string | null = null;
  let signerName = parsed.data.signerName?.trim() || null;

  if (session) {
    const m = await prisma.member.findUnique({
      where: { id: session.memberId },
      select: { id: true, email: true, displayName: true },
    });
    if (m) {
      memberId = m.id;
      if (email !== m.email.toLowerCase()) {
        return NextResponse.json(
          { error: "Use the email on your signed-in account, or sign out to use another address." },
          { status: 400 },
        );
      }
      if (!signerName && m.displayName?.trim()) signerName = m.displayName.trim();
    }
  }

  const petition = await prisma.petition.findUnique({
    where: { slug },
    select: { id: true, status: true, title: true },
  });
  if (!petition || petition.status !== "OPEN") {
    return NextResponse.json({ error: "This petition is not accepting signatures." }, { status: 400 });
  }

  const guestVerify =
    !memberId && isPetitionGuestEmailVerificationEnabled();

  if (guestVerify) {
    const existing = await prisma.petitionSignature.findUnique({
      where: {
        petitionId_signerEmail: { petitionId: petition.id, signerEmail: email },
      },
      select: { id: true },
    });
    if (existing) {
      const count = await prisma.petitionSignature.count({ where: { petitionId: petition.id } });
      return NextResponse.json({
        ok: true,
        signatureCount: count,
        alreadySigned: true,
      });
    }

    const rawToken = newPetitionSignatureRawToken();
    const tokenHash = hashPetitionSignatureToken(rawToken);
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const pendingRow = await prisma.petitionSignaturePending.upsert({
      where: {
        petitionId_signerEmail: { petitionId: petition.id, signerEmail: email },
      },
      create: {
        petitionId: petition.id,
        signerEmail: email,
        signerName,
        consentShowName: parsed.data.consentShowName,
        consentUpdates: parsed.data.consentUpdates,
        tokenHash,
        expiresAt,
      },
      update: {
        signerName,
        consentShowName: parsed.data.consentShowName,
        consentUpdates: parsed.data.consentUpdates,
        tokenHash,
        expiresAt,
      },
      select: { id: true },
    });

    const site = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
    const confirmUrl = site.startsWith("http")
      ? `${site.replace(/\/$/, "")}/api/petitions/confirm-signature?t=${encodeURIComponent(rawToken)}`
      : "";

    if (!confirmUrl) {
      await prisma.petitionSignaturePending.delete({ where: { id: pendingRow.id } }).catch(() => {});
      return NextResponse.json(
        { error: "Server misconfiguration: NEXT_PUBLIC_SITE_URL must be an absolute URL for email verification." },
        { status: 503 },
      );
    }

    const sent = await sendPetitionSignatureVerificationEmail({
      to: email,
      petitionTitle: petition.title,
      confirmUrl,
    });

    if (sent.mode !== "sent") {
      await prisma.petitionSignaturePending.delete({ where: { id: pendingRow.id } }).catch(() => {});
      return NextResponse.json(
        {
          error:
            sent.mode === "skipped"
              ? "Email is not configured. Ask the operator to set RESEND_API_KEY or disable PETITION_VERIFY_GUEST_SIGNATURES."
              : "Could not send verification email. Try again shortly.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, verificationPending: true });
  }

  await prisma.petitionSignature.upsert({
    where: {
      petitionId_signerEmail: { petitionId: petition.id, signerEmail: email },
    },
    create: {
      petitionId: petition.id,
      memberId,
      signerEmail: email,
      signerName,
      consentShowName: parsed.data.consentShowName,
      consentUpdates: parsed.data.consentUpdates,
    },
    update: {
      signerName,
      consentShowName: parsed.data.consentShowName,
      consentUpdates: parsed.data.consentUpdates,
      memberId: memberId ?? undefined,
    },
  });

  await prisma.petitionSignaturePending.deleteMany({
    where: { petitionId: petition.id, signerEmail: email },
  });

  const count = await prisma.petitionSignature.count({ where: { petitionId: petition.id } });

  return NextResponse.json({ ok: true, signatureCount: count });
}

export async function DELETE(request: Request, { params }: Props) {
  if (!isCivicPetitionsAndPublicCausesEnabled() || !isDatabaseConfigured()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const authBlock = guardMemberAuthApi();
  if (authBlock) return authBlock;

  const session = await getMemberSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { slug: raw } = await params;
  const slug = raw.trim().toLowerCase();
  if (!slug) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const m = await prisma.member.findUnique({
    where: { id: session.memberId },
    select: { email: true },
  });
  if (!m?.email) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const petition = await prisma.petition.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!petition) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const emailLower = m.email.trim().toLowerCase();
  await prisma.$transaction([
    prisma.petitionSignature.deleteMany({
      where: {
        petitionId: petition.id,
        signerEmail: emailLower,
      },
    }),
    prisma.petitionSignaturePending.deleteMany({
      where: {
        petitionId: petition.id,
        signerEmail: emailLower,
      },
    }),
  ]);

  const count = await prisma.petitionSignature.count({ where: { petitionId: petition.id } });
  return NextResponse.json({ ok: true, signatureCount: count });
}

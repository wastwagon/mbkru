import { NextResponse } from "next/server";

import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/member/session";
import { isCivicPetitionsAndPublicCausesEnabled } from "@/lib/reports/accountability-pages";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Props) {
  if (!isCivicPetitionsAndPublicCausesEnabled() || !isDatabaseConfigured()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { slug: raw } = await params;
  const slug = raw.trim().toLowerCase();
  if (!slug) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const p = await prisma.petition.findUnique({
    where: { slug },
    include: {
      region: { select: { name: true, slug: true } },
      author: { select: { displayName: true } },
      _count: { select: { signatures: true } },
    },
  });

  if (!p || p.status === "ARCHIVED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const recent = await prisma.petitionSignature.findMany({
    where: { petitionId: p.id },
    orderBy: { createdAt: "desc" },
    take: 24,
    select: {
      signerName: true,
      consentShowName: true,
      createdAt: true,
    },
  });

  const session = await getMemberSession();
  let viewerSigned = false;
  if (session) {
    const m = await prisma.member.findUnique({
      where: { id: session.memberId },
      select: { email: true },
    });
    if (m?.email) {
      const sig = await prisma.petitionSignature.findUnique({
        where: {
          petitionId_signerEmail: {
            petitionId: p.id,
            signerEmail: m.email.trim().toLowerCase(),
          },
        },
        select: { id: true },
      });
      viewerSigned = Boolean(sig);
    }
  }

  return NextResponse.json({
    petition: {
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      body: p.body,
      status: p.status,
      targetSignatures: p.targetSignatures,
      createdAt: p.createdAt.toISOString(),
      regionName: p.region?.name ?? null,
      authorDisplayName: p.author.displayName ?? "Member",
      signatureCount: p._count.signatures,
      viewerSigned,
      recentSignatures: recent.map((s) => ({
        label:
          s.consentShowName && s.signerName?.trim()
            ? s.signerName.trim()
            : "Supporter",
        signedAt: s.createdAt.toISOString(),
      })),
    },
  });
}

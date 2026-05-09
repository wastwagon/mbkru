import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

export async function GET(request: Request) {
  const denied = guardMemberAuthApi();
  if (denied) return denied;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "account-data-export"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const session = await getMemberSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const member = await prisma.member.findUnique({
    where: { id: session.memberId },
    select: {
      id: true,
      email: true,
      displayName: true,
      phone: true,
      regionId: true,
      identityVerificationStatus: true,
      identityVerifiedAt: true,
      identityReviewRequestedAt: true,
      createdAt: true,
      updatedAt: true,
      region: { select: { name: true } },
    },
  });

  if (!member) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [
    reports,
    petitionSignatures,
    authoredPetitions,
    communityMemberships,
    notifications,
  ] = await Promise.all([
    prisma.citizenReport.findMany({
      where: { memberId: session.memberId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        trackingCode: true,
        kind: true,
        status: true,
        title: true,
        body: true,
        category: true,
        latitude: true,
        longitude: true,
        localArea: true,
        publicCauseSlug: true,
        publicCauseTitle: true,
        publicCauseSummary: true,
        createdAt: true,
        updatedAt: true,
        attachments: {
          select: { id: true, mimeType: true, createdAt: true },
        },
      },
    }),
    prisma.petitionSignature.findMany({
      where: { memberId: session.memberId },
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        signerEmail: true,
        signerName: true,
        consentShowName: true,
        consentUpdates: true,
        petition: { select: { slug: true, title: true, status: true } },
      },
    }),
    prisma.petition.findMany({
      where: { authorMemberId: session.memberId },
      orderBy: { createdAt: "desc" },
      select: {
        slug: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.communityMembership.findMany({
      where: { memberId: session.memberId },
      select: {
        role: true,
        state: true,
        createdAt: true,
        community: { select: { slug: true, name: true } },
      },
    }),
    prisma.memberNotification.findMany({
      where: { memberId: session.memberId },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        type: true,
        payload: true,
        readAt: true,
        createdAt: true,
      },
    }),
  ]);

  const { region: regionRow, ...memberRest } = member;

  const payload = {
    schemaVersion: 1 as const,
    exportedAt: new Date().toISOString(),
    member: {
      ...memberRest,
      regionName: regionRow?.name ?? null,
    },
    reports,
    petitionSignatures,
    authoredPetitions,
    communityMemberships,
    notifications,
  };

  const body = JSON.stringify(payload, null, 2);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="mbkru-account-export-${session.memberId.slice(0, 8)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}

import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { MPS_ROSTER_TAG } from "@/lib/accountability-tags";
import { citizensVoiceDisabledResponse, isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";
import { allocateTrackingCode } from "@/lib/server/allocate-tracking-code";
import { signReportAttachmentScope } from "@/lib/server/report-upload-token";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { requireTurnstileIfConfigured } from "@/lib/server/verify-turnstile";
import { prisma } from "@/lib/db/prisma";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { roundApproximateCoord } from "@/lib/geo/round-approximate-coord";
import { getMemberSession } from "@/lib/member/session";
import { createReportBodySchema } from "@/lib/validation/reports";

export async function POST(request: Request) {
  if (!isCitizensVoiceEnabled()) return citizensVoiceDisabledResponse();

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "reports-submit"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = createReportBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const data = parsed.data;
    const turnstileBlock = await requireTurnstileIfConfigured(request, data.turnstileToken);
    if (turnstileBlock) return turnstileBlock;

    const member = await getMemberSession();
    if (!member) {
      return NextResponse.json({ error: "Sign in to submit a report." }, { status: 401 });
    }

    let regionId = data.regionId;
    let constituencyId = data.constituencyId ?? null;
    let parliamentMemberId: string | null = null;
    let parliamentMemberSlug: string | null = null;

    if (data.kind === "MP_PERFORMANCE") {
      const rosterMp = await prisma.parliamentMember.findFirst({
        where: { id: data.parliamentMemberId!, active: true },
        select: { id: true, slug: true, constituencyId: true },
      });
      if (!rosterMp) {
        return NextResponse.json(
          { error: "Select a valid Member of Parliament from the roster." },
          { status: 400 },
        );
      }
      parliamentMemberId = rosterMp.id;
      parliamentMemberSlug = rosterMp.slug;
      if (rosterMp.constituencyId) {
        const c = await prisma.constituency.findUnique({
          where: { id: rosterMp.constituencyId },
          select: { id: true, regionId: true },
        });
        if (c) {
          constituencyId = c.id;
          regionId = c.regionId;
        }
      }
    }

    const region = await prisma.region.findUnique({ where: { id: regionId } });
    if (!region) {
      return NextResponse.json({ error: "Invalid region" }, { status: 400 });
    }

    if (constituencyId) {
      const c = await prisma.constituency.findUnique({ where: { id: constituencyId } });
      if (!c) {
        return NextResponse.json({ error: "Invalid constituency" }, { status: 400 });
      }
      if (c.regionId !== regionId) {
        return NextResponse.json({ error: "Constituency does not belong to the selected region" }, { status: 400 });
      }
    }

    const lat = roundApproximateCoord(data.latitude);
    const lng = roundApproximateCoord(data.longitude);

    const trackingCode = await allocateTrackingCode(prisma);

    const report = await prisma.citizenReport.create({
      data: {
        trackingCode,
        kind: data.kind,
        memberId: member?.memberId ?? null,
        parliamentMemberId,
        submitterEmail: data.submitterEmail?.trim().toLowerCase() ?? null,
        submitterPhone: data.submitterPhone?.trim() ?? null,
        title: data.title,
        body: data.body,
        category: data.category?.trim() || null,
        regionId,
        constituencyId,
        localArea: data.localArea.trim(),
        latitude: lat,
        longitude: lng,
      },
      select: { trackingCode: true, id: true, createdAt: true },
    });

    const attachmentUploadToken = signReportAttachmentScope(report.id);

    if (parliamentMemberId) {
      revalidateTag(MPS_ROSTER_TAG, "max");
    }

    return NextResponse.json({
      ok: true,
      trackingCode: report.trackingCode,
      id: report.id,
      submittedAt: report.createdAt.toISOString(),
      ...(attachmentUploadToken ? { attachmentUploadToken } : {}),
      ...(parliamentMemberSlug ? { parliamentMemberSlug } : {}),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not submit report" }, { status: 500 });
  }
}

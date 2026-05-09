import { NextResponse } from "next/server";

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

    const region = await prisma.region.findUnique({ where: { id: data.regionId } });
    if (!region) {
      return NextResponse.json({ error: "Invalid region" }, { status: 400 });
    }

    if (data.constituencyId) {
      const c = await prisma.constituency.findUnique({ where: { id: data.constituencyId } });
      if (!c) {
        return NextResponse.json({ error: "Invalid constituency" }, { status: 400 });
      }
      if (data.regionId && c.regionId !== data.regionId) {
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
        submitterEmail: data.submitterEmail?.trim().toLowerCase() ?? null,
        submitterPhone: data.submitterPhone?.trim() ?? null,
        title: data.title,
        body: data.body,
        category: data.category?.trim() || null,
        regionId: data.regionId,
        constituencyId: data.constituencyId ?? null,
        localArea: data.localArea.trim(),
        latitude: lat,
        longitude: lng,
      },
      select: { trackingCode: true, id: true, createdAt: true },
    });

    const attachmentUploadToken = signReportAttachmentScope(report.id);

    return NextResponse.json({
      ok: true,
      trackingCode: report.trackingCode,
      id: report.id,
      submittedAt: report.createdAt.toISOString(),
      ...(attachmentUploadToken ? { attachmentUploadToken } : {}),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not submit report" }, { status: 500 });
  }
}

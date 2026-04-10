import { NextResponse } from "next/server";

import { citizensVoiceDisabledResponse, isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { prisma } from "@/lib/db/prisma";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { trackingCodeParamSchema } from "@/lib/validation/reports";

type Props = { params: Promise<{ code: string }> };

/** Public status lookup — no PII or narrative. */
export async function GET(request: Request, { params }: Props) {
  if (!isCitizensVoiceEnabled()) return citizensVoiceDisabledResponse();

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "reports-track"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { code: raw } = await params;
  const code = trackingCodeParamSchema.safeParse(raw.toUpperCase());
  if (!code.success) {
    return NextResponse.json({ error: "Invalid tracking code" }, { status: 400 });
  }

  const row = await prisma.citizenReport.findUnique({
    where: { trackingCode: code.data },
    select: {
      trackingCode: true,
      kind: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      adminReplies: {
        where: { visibleToSubmitter: true },
        orderBy: { createdAt: "asc" },
        select: { id: true, body: true, createdAt: true },
      },
    },
  });

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const notes = row.adminReplies;
  const lastNote = notes.at(-1);
  const lastVisibleTeamNoteAt = lastNote ? lastNote.createdAt.toISOString() : null;

  return NextResponse.json({
    trackingCode: row.trackingCode,
    kind: row.kind,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    visibleTeamNoteCount: notes.length,
    lastVisibleTeamNoteAt,
    adminReplies: notes.map((r) => ({
      id: r.id,
      body: r.body,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}

import { NextResponse } from "next/server";

import { isDatabaseConfigured } from "@/lib/db/prisma";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";
import { buildVoiceDiscussionPayload } from "@/lib/server/voice-discussion-payload";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ reportId: string }> };

export async function GET(_request: Request, { params }: Props) {
  if (!isCitizensVoiceEnabled() || !isDatabaseConfigured()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { reportId } = await params;
  if (!reportId?.trim()) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const discussion = await buildVoiceDiscussionPayload(reportId);
  if (!discussion) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ discussion });
}

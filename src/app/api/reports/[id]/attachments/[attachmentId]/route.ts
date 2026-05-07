import { readFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/admin/session";
import { prisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/member/session";
import { citizensVoiceDisabledResponse, isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";
import { isPrivateStoragePath, readPrivateUploadFile } from "@/lib/server/private-upload-storage";
import { verifyReportAttachmentScope } from "@/lib/server/report-upload-token";

type Props = { params: Promise<{ id: string; attachmentId: string }> };

export async function GET(request: Request, { params }: Props) {
  if (!isCitizensVoiceEnabled()) return citizensVoiceDisabledResponse();
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { id: reportId, attachmentId } = await params;
  if (!z.string().cuid().safeParse(reportId).success || !z.string().cuid().safeParse(attachmentId).success) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const attachment = await prisma.citizenReportAttachment.findFirst({
    where: { id: attachmentId, reportId },
    select: { id: true, path: true, mimeType: true, report: { select: { memberId: true } } },
  });
  if (!attachment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const admin = await getAdminSession();
  let authorized = Boolean(admin);
  if (!authorized) {
    const member = await getMemberSession();
    if (member?.memberId && attachment.report.memberId === member.memberId) {
      authorized = true;
    } else {
      const token = request.headers.get("x-report-upload-token")?.trim() || "";
      if (token && verifyReportAttachmentScope(token, reportId)) {
        authorized = true;
      }
    }
  }

  if (!authorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = isPrivateStoragePath(attachment.path)
      ? await readPrivateUploadFile(attachment.path)
      : await readFile(path.join(process.cwd(), "public", attachment.path.replace(/^\/+/, "")));
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": attachment.mimeType || "application/octet-stream",
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
  }
}

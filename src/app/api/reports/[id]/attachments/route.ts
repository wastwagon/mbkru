import { randomUUID } from "crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { citizensVoiceDisabledResponse, isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";
import {
  REPORT_ATTACHMENT_MAX_BYTES,
  REPORT_ATTACHMENT_MAX_FILES,
  REPORT_ATTACHMENT_MIME,
} from "@/lib/server/report-attachment-limits";
import { writePrivateUploadFile } from "@/lib/server/private-upload-storage";
import { MalwareScanError, scanUploadedFileOrThrow } from "@/lib/server/upload-malware-scan";
import { verifyReportAttachmentScope } from "@/lib/server/report-upload-token";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { prisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/member/session";

type Props = { params: Promise<{ id: string }> };

function extForMime(mime: string): string {
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "application/pdf") return ".pdf";
  return ".jpg";
}

export async function POST(request: Request, { params }: Props) {
  if (!isCitizensVoiceEnabled()) return citizensVoiceDisabledResponse();

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "reports-attach"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id: reportId } = await params;
  if (!z.string().cuid().safeParse(reportId).success) {
    return NextResponse.json({ error: "Invalid report id" }, { status: 400 });
  }

  const report = await prisma.citizenReport.findUnique({
    where: { id: reportId },
    select: { id: true, memberId: true },
  });
  if (!report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const session = await getMemberSession();
  const headerToken = request.headers.get("x-report-upload-token")?.trim();
  const formData = await request.formData();
  const bodyToken =
    typeof formData.get("uploadToken") === "string" ? (formData.get("uploadToken") as string).trim() : "";
  const token = headerToken || bodyToken;

  let authorized = false;
  if (session?.memberId && report.memberId === session.memberId) {
    authorized = true;
  } else if (token && verifyReportAttachmentScope(token, reportId)) {
    authorized = true;
  }

  if (!authorized) {
    return NextResponse.json(
      { error: "Sign in as the submitting member or use the upload token from your submission response." },
      { status: 403 },
    );
  }

  const files = formData.getAll("file").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return NextResponse.json({ error: "No files" }, { status: 400 });
  }
  if (files.length > REPORT_ATTACHMENT_MAX_FILES) {
    return NextResponse.json(
      { error: `Maximum ${REPORT_ATTACHMENT_MAX_FILES} files per request` },
      { status: 400 },
    );
  }

  const existingCount = await prisma.citizenReportAttachment.count({ where: { reportId } });
  if (existingCount + files.length > REPORT_ATTACHMENT_MAX_FILES) {
    return NextResponse.json(
      { error: `This report already has ${existingCount} file(s); max ${REPORT_ATTACHMENT_MAX_FILES} total.` },
      { status: 400 },
    );
  }

  const created: { id: string; path: string; mimeType: string }[] = [];

  try {
    for (const file of files) {
      if (file.size > REPORT_ATTACHMENT_MAX_BYTES) {
        return NextResponse.json(
          { error: `Each file must be at most ${REPORT_ATTACHMENT_MAX_BYTES / (1024 * 1024)} MB` },
          { status: 400 },
        );
      }
      if (!REPORT_ATTACHMENT_MIME.has(file.type)) {
        return NextResponse.json(
          { error: "Only JPEG, PNG, WebP, and PDF are allowed" },
          { status: 400 },
        );
      }

      const filename = `${randomUUID()}${extForMime(file.type)}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      try {
        await scanUploadedFileOrThrow(buffer, `report-attachment:${reportId}`);
      } catch (err) {
        if (err instanceof MalwareScanError) {
          return NextResponse.json(
            { error: err.code === "infected" ? "File blocked by malware scanner" : "Upload scanner unavailable" },
            { status: err.code === "infected" ? 400 : 503 },
          );
        }
        throw err;
      }
      const storagePath = await writePrivateUploadFile({
        bucket: "reports",
        segments: [reportId, filename],
        bytes: buffer,
      });
      const record = await prisma.citizenReportAttachment.create({
        data: {
          reportId,
          path: storagePath,
          mimeType: file.type,
        },
      });
      created.push({
        id: record.id,
        path: `/api/reports/${encodeURIComponent(reportId)}/attachments/${encodeURIComponent(record.id)}`,
        mimeType: file.type,
      });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, attachments: created });
}

import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/admin/session";
import { prisma } from "@/lib/db/prisma";
import { isPrivateStoragePath, readPrivateUploadFile } from "@/lib/server/private-upload-storage";

type Props = { params: Promise<{ mediaId: string }> };

export async function GET(_request: Request, { params }: Props) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { mediaId } = await params;
  if (!z.string().cuid().safeParse(mediaId).success) {
    return NextResponse.json({ error: "Invalid media id" }, { status: 400 });
  }

  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    select: { id: true, filename: true, storagePath: true, mimeType: true },
  });
  if (!media || !isPrivateStoragePath(media.storagePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const linkedRequest = await prisma.communityVerificationRequest.findFirst({
    where: { documentMediaIds: { array_contains: [media.id] } },
    select: { id: true },
  });
  if (!linkedRequest) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const bytes = await readPrivateUploadFile(media.storagePath);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": media.mimeType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${encodeURIComponent(media.filename || "document")}"`,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
  }
}

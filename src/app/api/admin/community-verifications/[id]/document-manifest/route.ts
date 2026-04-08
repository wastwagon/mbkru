import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/session";
import { prisma } from "@/lib/db/prisma";

type Props = { params: Promise<{ id: string }> };

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replaceAll("\"", "\"\"")}"`;
  }
  return value;
}

/** Export CSV manifest of document links for one community verification request. */
export async function GET(request: Request, { params }: Props) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const row = await prisma.communityVerificationRequest.findUnique({
    where: { id },
    include: {
      community: { select: { name: true, slug: true } },
      member: { select: { email: true, displayName: true } },
    },
  });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const mediaIds = Array.isArray(row.documentMediaIds)
    ? row.documentMediaIds.filter((v): v is string => typeof v === "string")
    : [];
  const mediaRows = mediaIds.length
    ? await prisma.media.findMany({
        where: { id: { in: mediaIds } },
        select: { id: true, filename: true, storagePath: true, mimeType: true },
      })
    : [];
  const mediaById = new Map(mediaRows.map((m) => [m.id, m]));

  const origin = new URL(request.url).origin;
  const lines = [
    "requestId,communitySlug,communityName,memberEmail,memberDisplayName,status,reviewedAt,mediaId,filename,mimeType,url,missing",
  ];
  for (const mediaId of mediaIds) {
    const media = mediaById.get(mediaId);
    const line = [
      row.id,
      row.community.slug,
      row.community.name,
      row.member.email,
      row.member.displayName ?? "",
      row.status,
      row.reviewedAt ? row.reviewedAt.toISOString() : "",
      mediaId,
      media?.filename ?? "",
      media?.mimeType ?? "",
      media ? `${origin}${media.storagePath}` : "",
      media ? "false" : "true",
    ].map((v) => csvEscape(v));
    lines.push(line.join(","));
  }

  const filename = `verification-${row.id}-documents.csv`;
  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

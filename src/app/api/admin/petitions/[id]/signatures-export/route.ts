import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/session";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { prisma } from "@/lib/db/prisma";
import { allowAdminSessionRequest } from "@/lib/server/rate-limit";

const BOM = "\uFEFF";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Props) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await allowAdminSessionRequest(session.adminId, "petitions-signatures-export"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { id } = await params;
  const petition = await prisma.petition.findUnique({
    where: { id },
    select: { id: true, slug: true, title: true },
  });
  if (!petition) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rows = await prisma.petitionSignature.findMany({
    where: { petitionId: petition.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      signerEmail: true,
      signerName: true,
      consentShowName: true,
      consentUpdates: true,
      memberId: true,
      createdAt: true,
    },
  });

  const header = ["signatureId", "signerEmail", "signerName", "consentShowName", "consentUpdates", "memberId", "createdAt"];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        csvEscape(r.id),
        csvEscape(r.signerEmail),
        csvEscape(r.signerName ?? ""),
        r.consentShowName ? "1" : "0",
        r.consentUpdates ? "1" : "0",
        csvEscape(r.memberId ?? ""),
        csvEscape(r.createdAt.toISOString()),
      ].join(","),
    ),
  ];

  const csv = BOM + lines.join("\n");
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="petition-${encodeURIComponent(petition.slug)}-signatures-${stamp}.csv"`,
    },
  });
}

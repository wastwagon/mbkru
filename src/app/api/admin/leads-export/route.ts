import type { LeadCaptureSource } from "@prisma/client";
import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/session";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

const CSV_BOM = "\uFEFF";
const MAX_ROWS = 20_000;

function csvCell(value: string | number | null | undefined): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function parseSource(raw: string | null): LeadCaptureSource | undefined {
  if (!raw) return undefined;
  const allowed: LeadCaptureSource[] = ["PARLIAMENT_TRACKER", "NEWSLETTER", "EARLY_ACCESS"];
  return allowed.includes(raw as LeadCaptureSource) ? (raw as LeadCaptureSource) : undefined;
}

/** UTF-8 CSV of lead captures for ESP / CRM import. Admin session required. */
export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const url = new URL(request.url);
  const sourceFilter = parseSource(url.searchParams.get("source"));

  const leads = await prisma.leadCapture.findMany({
    where: sourceFilter ? { source: sourceFilter } : undefined,
    orderBy: { createdAt: "desc" },
    take: MAX_ROWS,
    select: { email: true, source: true, createdAt: true },
  });

  const header = "email,source,signed_up_utc";
  const lines = [
    header,
    ...leads.map((r) =>
      [csvCell(r.email), csvCell(r.source), csvCell(r.createdAt.toISOString())].join(","),
    ),
  ];
  const body = CSV_BOM + lines.join("\n");

  const stamp = new Date().toISOString().slice(0, 10);
  const suffix = sourceFilter ? `-${sourceFilter.toLowerCase()}` : "";
  const filename = `mbkru-leads${suffix}-${stamp}.csv`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

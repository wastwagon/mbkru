import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import {
  accountabilityPublicCacheControl,
  getCachedPromisesExportCsvRows,
} from "@/lib/server/accountability-cache";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

function csvCell(value: string | number | null | undefined): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const CSV_BOM = "\uFEFF";

/**
 * Campaign promises as CSV (full set; optional `memberSlug` like `GET /api/promises`).
 * Same phase gate and rate limits as JSON; UTF-8 BOM for Excel.
 */
export async function GET(request: Request) {
  if (!platformFeatures.parliamentTrackerData(getServerPlatformPhase())) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "promises-export-csv"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const memberSlug = searchParams.get("memberSlug")?.trim().toLowerCase() ?? "";

  const rows = await getCachedPromisesExportCsvRows(memberSlug);
  const header =
    "id,title,description,source_label,source_date,status,updated_at,member_name,member_slug,member_role,member_party";
  const lines = [
    header,
    ...rows.map((r) =>
      [
        csvCell(r.id),
        csvCell(r.title),
        csvCell(r.description),
        csvCell(r.sourceLabel),
        csvCell(r.sourceDate),
        csvCell(r.status),
        csvCell(r.updatedAt),
        csvCell(r.member?.name),
        csvCell(r.member?.slug),
        csvCell(r.member?.role),
        csvCell(r.member?.party),
      ].join(","),
    ),
  ];

  const body = CSV_BOM + lines.join("\r\n");
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": accountabilityPublicCacheControl(),
    },
  });
}

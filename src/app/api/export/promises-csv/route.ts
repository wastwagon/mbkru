import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { parsePromisesApiFilters } from "@/lib/promises-api-filters";
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
 * Campaign promises as CSV (full set; same query params as `GET /api/promises`: `memberSlug`, `partySlug`, `electionCycle`, `governmentOnly`).
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

  const filters = parsePromisesApiFilters(new URL(request.url));

  const rows = await getCachedPromisesExportCsvRows(filters);
  const header =
    "id,title,description,source_label,source_url,source_date,verification_notes,status,policy_sector,updated_at,election_cycle,party_slug,manifesto_document_id,manifesto_page_ref,is_government_programme,manifesto_title,manifesto_source_url,member_name,member_slug,member_role,member_party,member_constituency";
  const lines = [
    header,
    ...rows.map((r) =>
      [
        csvCell(r.id),
        csvCell(r.title),
        csvCell(r.description),
        csvCell(r.sourceLabel),
        csvCell(r.sourceUrl),
        csvCell(r.sourceDate),
        csvCell(r.verificationNotes),
        csvCell(r.status),
        csvCell(r.policySector),
        csvCell(r.updatedAt),
        csvCell(r.electionCycle),
        csvCell(r.partySlug),
        csvCell(r.manifestoDocumentId),
        csvCell(r.manifestoPageRef),
        csvCell(r.isGovernmentProgramme ? "true" : "false"),
        csvCell(r.manifestoTitle),
        csvCell(r.manifestoSourceUrl),
        csvCell(r.member?.name),
        csvCell(r.member?.slug),
        csvCell(r.member?.role),
        csvCell(r.member?.party),
        csvCell(r.member?.constituencyName),
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

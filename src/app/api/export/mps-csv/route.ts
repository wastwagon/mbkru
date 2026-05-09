import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import {
  accountabilityPublicCacheControl,
  getCachedMpsPublicRoster,
} from "@/lib/server/accountability-cache";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

function csvCell(value: string | number | null | undefined): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** UTF-8 BOM so Excel opens special characters reliably */
const CSV_BOM = "\uFEFF";

/**
 * Active MP roster as CSV (researchers / spreadsheets). Same phase and rate limits as `GET /api/mps`.
 */
export async function GET(request: Request) {
  if (!platformFeatures.parliamentTrackerData(getServerPlatformPhase())) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "mps-export-csv"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const members = await getCachedMpsPublicRoster();
  const header = "slug,name,role,party,constituency_name,promise_count,mp_voice_report_count";
  const lines = [
    header,
    ...members.map((m) =>
      [
        csvCell(m.slug),
        csvCell(m.name),
        csvCell(m.role),
        csvCell(m.party),
        csvCell(m.constituencyName),
        csvCell(m.promiseCount),
        csvCell(m.mpVoiceReportCount),
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

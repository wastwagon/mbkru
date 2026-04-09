import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/session";
import { parseConstituenciesCsv } from "@/lib/constituency-csv-parse";
import { prisma } from "@/lib/db/prisma";
import { MPS_ROSTER_TAG } from "@/lib/server/accountability-cache";

const MAX_BYTES = 2 * 1024 * 1024;

/**
 * POST multipart/form-data: `file` = UTF-8 CSV with header
 * `name,slug,region_slug,code` (code may be empty).
 * Upserts `Constituency` by `slug`; `region_slug` must match an existing `Region.slug`.
 */
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Missing CSV file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 2 MB)" }, { status: 400 });
  }

  const text = await file.text();
  const parsed = parseConstituenciesCsv(text);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const regions = await prisma.region.findMany({ select: { id: true, slug: true } });
  const regionSlugToId = new Map(regions.map((r) => [r.slug, r.id]));

  let created = 0;
  let updated = 0;
  const rowErrors: string[] = [];

  for (let i = 0; i < parsed.rows.length; i++) {
    const row = parsed.rows[i]!;
    const lineNo = i + 2;
    const regionId = regionSlugToId.get(row.region_slug);
    if (!regionId) {
      rowErrors.push(`Row ${lineNo}: unknown region_slug "${row.region_slug}"`);
      continue;
    }

    try {
      const existing = await prisma.constituency.findUnique({
        where: { slug: row.slug },
        select: { id: true },
      });
      await prisma.constituency.upsert({
        where: { slug: row.slug },
        create: {
          name: row.name,
          slug: row.slug,
          regionId,
          code: row.code ?? null,
        },
        update: {
          name: row.name,
          regionId,
          code: row.code ?? null,
        },
      });
      if (existing) updated += 1;
      else created += 1;
    } catch (e) {
      console.error(e);
      rowErrors.push(`Row ${lineNo}: database error for slug "${row.slug}"`);
    }
  }

  if (created + updated > 0) {
    revalidateTag(MPS_ROSTER_TAG, "max");
  }

  return NextResponse.json({
    ok: true,
    created,
    updated,
    skipped: rowErrors.length,
    errors: rowErrors,
  });
}

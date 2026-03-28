import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/session";
import { prisma } from "@/lib/db/prisma";
import { PROMISES_INDEX_TAG, promisesMemberTag } from "@/lib/server/accountability-cache";
import { parseParliamentMembersCsv } from "@/lib/server/parliament-csv";

const MAX_BYTES = 2 * 1024 * 1024;

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
  const parsed = parseParliamentMembersCsv(text);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const constituencies = await prisma.constituency.findMany({ select: { id: true, slug: true } });
  const slugToConstituencyId = new Map(constituencies.map((c) => [c.slug, c.id]));

  let created = 0;
  let updated = 0;
  const rowErrors: string[] = [];
  const touchedSlugs = new Set<string>();

  for (let i = 0; i < parsed.rows.length; i++) {
    const row = parsed.rows[i]!;
    let constituencyId: string | null = null;
    if (row.constituency_slug) {
      const cid = slugToConstituencyId.get(row.constituency_slug);
      if (!cid) {
        rowErrors.push(`Row ${i + 2}: unknown constituency_slug "${row.constituency_slug}"`);
        continue;
      }
      constituencyId = cid;
    }

    try {
      const existing = await prisma.parliamentMember.findUnique({
        where: { slug: row.slug },
        select: { id: true },
      });
      await prisma.parliamentMember.upsert({
        where: { slug: row.slug },
        create: {
          name: row.name,
          slug: row.slug,
          role: row.role,
          party: row.party ?? null,
          constituencyId,
          active: row.active,
        },
        update: {
          name: row.name,
          role: row.role,
          party: row.party ?? null,
          constituencyId,
          active: row.active,
        },
      });
      if (existing) updated += 1;
      else created += 1;
      touchedSlugs.add(row.slug);
    } catch (e) {
      console.error(e);
      rowErrors.push(`Row ${i + 2}: database error for slug "${row.slug}"`);
    }
  }

  if (touchedSlugs.size > 0) {
    revalidateTag(PROMISES_INDEX_TAG, "max");
    for (const s of touchedSlugs) {
      revalidateTag(promisesMemberTag(s), "max");
      revalidatePath(`/promises/${s}`);
    }
    revalidatePath("/promises");
  }

  return NextResponse.json({
    ok: true,
    created,
    updated,
    skipped: rowErrors.length,
    errors: rowErrors,
  });
}

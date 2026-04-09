import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/session";
import { prisma } from "@/lib/db/prisma";
import { parseParliamentMembersCsv } from "@/lib/server/parliament-csv";
import { computeParliamentImportReconcile } from "@/lib/parliament-reconcile";

const MAX_BYTES = 2 * 1024 * 1024;

/**
 * POST multipart/form-data: `file` = same MP roster CSV as import.
 * Returns a dry-run diff (no writes): creates, updates, unchanged, DB rows missing from file, row errors.
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
  const parsed = parseParliamentMembersCsv(text);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const [constituencies, dbMembersRaw] = await Promise.all([
    prisma.constituency.findMany({ select: { id: true, slug: true } }),
    prisma.parliamentMember.findMany({
      select: {
        slug: true,
        name: true,
        role: true,
        party: true,
        active: true,
        constituency: { select: { slug: true } },
      },
    }),
  ]);

  const slugToConstituencyId = new Map(constituencies.map((c) => [c.slug, c.id]));

  const dbMembers = dbMembersRaw.map((m) => ({
    slug: m.slug,
    name: m.name,
    role: m.role,
    party: m.party,
    constituencySlug: m.constituency?.slug ?? null,
    active: m.active,
  }));

  const result = computeParliamentImportReconcile(parsed.rows, dbMembers, slugToConstituencyId);

  return NextResponse.json({ ok: true, ...result });
}

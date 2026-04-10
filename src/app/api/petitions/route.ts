import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { isCivicPetitionsAndPublicCausesEnabled } from "@/lib/reports/accountability-pages";
import { slugifyTitleSegment, randomSlugSuffix } from "@/lib/civic/slug";
import { petitionCreateBodySchema } from "@/lib/validation/civic-engagement";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isCivicPetitionsAndPublicCausesEnabled() || !isDatabaseConfigured()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const take = Math.min(50, Math.max(1, Number.parseInt(url.searchParams.get("take") ?? "20", 10) || 20));
  const skip = Math.max(0, Number.parseInt(url.searchParams.get("skip") ?? "0", 10) || 0);

  const [rows, total] = await Promise.all([
    prisma.petition.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        slug: true,
        title: true,
        summary: true,
        targetSignatures: true,
        createdAt: true,
        region: { select: { name: true, slug: true } },
        author: { select: { displayName: true } },
        _count: { select: { signatures: true } },
      },
    }),
    prisma.petition.count({ where: { status: "OPEN" } }),
  ]);

  return NextResponse.json({
    petitions: rows.map((p) => ({
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      targetSignatures: p.targetSignatures,
      createdAt: p.createdAt.toISOString(),
      regionName: p.region?.name ?? null,
      authorDisplayName: p.author.displayName ?? "Member",
      signatureCount: p._count.signatures,
    })),
    total,
  });
}

export async function POST(request: Request) {
  if (!isCivicPetitionsAndPublicCausesEnabled() || !isDatabaseConfigured()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const authBlock = guardMemberAuthApi();
  if (authBlock) return authBlock;

  if (!(await allowPublicFormRequest(request, "petitions-create"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!platformFeatures.authentication(getServerPlatformPhase())) {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  const session = await getMemberSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = petitionCreateBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { title, summary, body, targetSignatures, regionId } = parsed.data;

  if (regionId) {
    const r = await prisma.region.findUnique({ where: { id: regionId }, select: { id: true } });
    if (!r) return NextResponse.json({ error: "Unknown region" }, { status: 400 });
  }

  let slug = `${slugifyTitleSegment(title)}-${randomSlugSuffix()}`;
  for (let attempt = 0; attempt < 8; attempt++) {
    const clash = await prisma.petition.findUnique({ where: { slug }, select: { id: true } });
    if (!clash) break;
    slug = `${slugifyTitleSegment(title)}-${randomSlugSuffix()}`;
  }

  const petition = await prisma.petition.create({
    data: {
      slug,
      title,
      summary: summary?.trim() || null,
      body,
      targetSignatures: targetSignatures ?? null,
      regionId: regionId ?? null,
      authorMemberId: session.memberId,
      status: "OPEN",
    },
    select: { slug: true, id: true },
  });

  return NextResponse.json({ ok: true, slug: petition.slug });
}

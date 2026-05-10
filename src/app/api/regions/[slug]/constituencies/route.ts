import { NextResponse } from "next/server";

import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

type Props = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Props) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "regions-constituencies-read"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { slug: raw } = await params;
  const slug = raw.trim().toLowerCase();
  if (!slug) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const region = await prisma.region.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  });
  if (!region) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const constituencies = await prisma.constituency.findMany({
    where: { regionId: region.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return NextResponse.json(
    { region, constituencies },
    { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } },
  );
}

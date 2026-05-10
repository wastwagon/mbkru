import { NextResponse } from "next/server";

import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

/** Public directory of Ghana regions (id + slug + name) for registration and forms. */
export async function GET(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "regions-directory-read"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const regions = await prisma.region.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return NextResponse.json(
    { regions },
    { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } },
  );
}

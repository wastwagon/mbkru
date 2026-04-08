import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { searchCommunitiesAndPosts } from "@/lib/server/communities-search";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { normalizeCommunitySearchQuery } from "@/lib/validation/communities";

/** Full-text search over active communities and published posts in public communities. */
export async function GET(request: Request) {
  if (!platformFeatures.communities(getServerPlatformPhase())) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  if (!(await allowPublicFormRequest(request, "communities-search"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const url = new URL(request.url);
  const raw = url.searchParams.get("q") ?? "";
  const normalized = normalizeCommunitySearchQuery(raw);
  if (!normalized) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters" },
      { status: 400 },
    );
  }

  try {
    const result = await searchCommunitiesAndPosts(normalized);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

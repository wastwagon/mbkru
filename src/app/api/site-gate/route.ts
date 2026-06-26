import { NextResponse } from "next/server";

import { getPublicSiteConfig } from "@/lib/server/site-config";

export const dynamic = "force-dynamic";

/** Lightweight gate probe for `src/proxy.ts` (short CDN cache). */
export async function GET() {
  const config = await getPublicSiteConfig();
  return NextResponse.json(
    {
      underConstruction: config.publicUnderConstruction,
      updatedAt: config.updatedAt,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=30",
      },
    },
  );
}

import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/admin/session";
import { logAdminOperationalAudit } from "@/lib/server/admin-operational-audit";
import { getPublicSiteConfig, updatePublicSiteConfig } from "@/lib/server/site-config";

const patchSchema = z.object({
  publicUnderConstruction: z.boolean(),
  constructionHeadline: z.string().max(200).nullable().optional(),
  constructionBody: z.string().max(4000).nullable().optional(),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await getPublicSiteConfig();
  return NextResponse.json({ config });
}

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const config = await updatePublicSiteConfig({
      adminId: session.adminId,
      ...parsed.data,
    });

    await logAdminOperationalAudit({
      adminId: session.adminId,
      action: "site_config.update",
      details: {
        publicUnderConstruction: config.publicUnderConstruction,
      },
    });

    return NextResponse.json({ ok: true, config });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

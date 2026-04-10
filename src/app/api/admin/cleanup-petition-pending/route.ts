import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/session";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { deleteExpiredPetitionSignaturePending } from "@/lib/server/cleanup-petition-signature-pending";

/** Manual run: same delete as cron; requires admin session cookie. */
export async function POST() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const { deleted } = await deleteExpiredPetitionSignaturePending();
    return NextResponse.json(
      { ok: true, deleted },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}

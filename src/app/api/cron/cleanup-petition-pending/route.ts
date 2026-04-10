import { NextResponse } from "next/server";

import { isDatabaseConfigured } from "@/lib/db/prisma";
import { deleteExpiredPetitionSignaturePending } from "@/lib/server/cleanup-petition-signature-pending";

function authorizeCron(request: Request, secret: string): boolean {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7) === secret;
  }
  return request.headers.get("x-cron-secret") === secret;
}

/**
 * Scheduled cleanup for expired `PetitionSignaturePending` rows.
 * Set `CRON_SECRET` and call POST or GET with `Authorization: Bearer <CRON_SECRET>`.
 */
export async function POST(request: Request) {
  return handle(request);
}

export async function GET(request: Request) {
  return handle(request);
}

async function handle(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 503 });
  }
  if (!authorizeCron(request, secret)) {
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

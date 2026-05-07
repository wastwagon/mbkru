import { NextResponse } from "next/server";

import { isDatabaseConfigured } from "@/lib/db/prisma";
import { processNotificationOutboxBatch } from "@/lib/server/notification-outbox";

function authorizeCron(request: Request, secret: string): boolean {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7) === secret;
  }
  return request.headers.get("x-cron-secret") === secret;
}

function parseLimit(url: string): number {
  const sp = new URL(url).searchParams;
  const raw = Number.parseInt(sp.get("limit") ?? "", 10);
  if (Number.isFinite(raw) && raw > 0) return Math.min(raw, 200);
  const envRaw = Number.parseInt(process.env.NOTIFICATION_OUTBOX_BATCH_SIZE ?? "50", 10);
  return Number.isFinite(envRaw) && envRaw > 0 ? Math.min(envRaw, 200) : 50;
}

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
    const limit = parseLimit(request.url);
    const result = await processNotificationOutboxBatch(limit);
    return NextResponse.json({ ok: true, ...result, limit }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Outbox processing failed" }, { status: 500 });
  }
}

import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/session";
import {
  MPS_ROSTER_TAG,
  PROMISES_INDEX_TAG,
  REPORT_CARD_INDEX_TAG,
  reportCardYearTag,
} from "@/lib/accountability-tags";
import {
  type PrismaMaintenanceAction,
  runPrismaMaintenance,
} from "@/lib/server/prisma-cli";

const ACTIONS = new Set<PrismaMaintenanceAction>([
  "migrate-deploy",
  "seed",
  "migrate-and-seed",
]);

function parseAction(body: unknown): PrismaMaintenanceAction | null {
  if (!body || typeof body !== "object") return null;
  const a = (body as { action?: unknown }).action;
  return typeof a === "string" && ACTIONS.has(a as PrismaMaintenanceAction)
    ? (a as PrismaMaintenanceAction)
    : null;
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured on the server." },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const action = parseAction(json);
  if (!action) {
    return NextResponse.json(
      {
        error: "Invalid action. Use migrate-deploy, seed, or migrate-and-seed.",
      },
      { status: 400 },
    );
  }

  const { steps } = await runPrismaMaintenance(action);
  const allOk = steps.every((s) => s.ok);

  const seedStep = steps.find((s) => s.command.includes("db seed"));
  if (seedStep?.ok) {
    try {
      revalidateTag(PROMISES_INDEX_TAG);
      revalidateTag(REPORT_CARD_INDEX_TAG);
      revalidateTag(MPS_ROSTER_TAG);
      revalidateTag(reportCardYearTag(2026));
      revalidatePath("/promises");
      revalidatePath("/promises/browse");
      revalidatePath("/report-card");
      revalidatePath("/communities");
      revalidatePath("/government-commitments");
    } catch (e) {
      console.error("[database-maintenance] revalidate after seed:", e);
    }
  }

  return NextResponse.json(
    {
      ok: allOk,
      action,
      steps,
    },
    { status: allOk ? 200 : 500 },
  );
}

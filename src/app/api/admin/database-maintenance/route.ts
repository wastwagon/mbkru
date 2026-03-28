import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/session";
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

  return NextResponse.json(
    {
      ok: allOk,
      action,
      steps,
    },
    { status: allOk ? 200 : 500 },
  );
}

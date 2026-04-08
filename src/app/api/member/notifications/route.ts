import { NextResponse } from "next/server";
import { z } from "zod";

import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import { markMemberNotificationsRead } from "@/lib/server/member-notification-read";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

/** Recent in-app notifications for the signed-in member (Phase 2+). */
export async function GET() {
  const denied = guardMemberAuthApi();
  if (denied) return denied;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const session = await getMemberSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const rows = await prisma.memberNotification.findMany({
    where: { memberId: session.memberId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      type: true,
      payload: true,
      readAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    notifications: rows.map((n) => ({
      id: n.id,
      type: n.type,
      payload: n.payload,
      readAt: n.readAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
    })),
  });
}

const patchBodySchema = z.union([
  z.object({ notificationId: z.string().cuid() }),
  z.object({ markAllRead: z.literal(true) }),
]);

/** Mark one notification or all unread as read. */
export async function PATCH(request: Request) {
  const denied = guardMemberAuthApi();
  if (denied) return denied;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "member-notifications-patch"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const session = await getMemberSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if ("markAllRead" in parsed.data) {
    await markMemberNotificationsRead(session.memberId, { markAllRead: true });
  } else {
    await markMemberNotificationsRead(session.memberId, {
      notificationId: parsed.data.notificationId,
    });
  }

  const remainingUnread = await prisma.memberNotification.count({
    where: { memberId: session.memberId, readAt: null },
  });

  return NextResponse.json({ ok: true, remainingUnread });
}

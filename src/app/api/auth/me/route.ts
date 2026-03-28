import { NextResponse } from "next/server";

import { guardMemberAuthMeRoute } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import { prisma } from "@/lib/db/prisma";
import { isDatabaseConfigured } from "@/lib/db/prisma";

export async function GET() {
  const denied = guardMemberAuthMeRoute();
  if (denied) return denied;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const session = await getMemberSession();
  if (!session) {
    return NextResponse.json({ member: null }, { status: 200 });
  }

  const member = await prisma.member.findUnique({
    where: { id: session.memberId },
    select: {
      id: true,
      email: true,
      displayName: true,
      phone: true,
      regionId: true,
      createdAt: true,
    },
  });

  if (!member) {
    return NextResponse.json({ member: null }, { status: 200 });
  }

  return NextResponse.json({ member });
}

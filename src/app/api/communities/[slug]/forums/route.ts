import { CommunityMembershipRole, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import {
  canReadCommunityPosts,
  findActiveCommunityBySlug,
  findMembership,
} from "@/lib/server/communities-access";
import { listCommunityForums } from "@/lib/server/community-forums-public";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import {
  communityForumCreateSchema,
  forumSlugFromName,
  isCommunitySlug,
} from "@/lib/validation/communities";

type Props = { params: Promise<{ slug: string }> };

function canCreateForum(role: CommunityMembershipRole): boolean {
  return role === "MODERATOR" || role === "QUEEN_MOTHER_VERIFIED";
}

export async function GET(request: Request, { params }: Props) {
  if (!platformFeatures.communities(getServerPlatformPhase())) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  if (!(await allowPublicFormRequest(request, "communities-forums-read"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { slug: raw } = await params;
  const slug = raw.trim().toLowerCase();
  if (!isCommunitySlug(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const community = await findActiveCommunityBySlug(slug);
  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  const session = await getMemberSession();
  const membership = session ? await findMembership(community.id, session.memberId) : null;
  if (!canReadCommunityPosts(community.visibility, membership)) {
    return NextResponse.json({ error: "Members only" }, { status: 403 });
  }

  const forums = await listCommunityForums(community.id);
  return NextResponse.json({
    forums: forums.map((f) => ({
      id: f.id,
      slug: f.slug,
      name: f.name,
      description: f.description,
      locked: f.locked,
      createdAt: f.createdAt.toISOString(),
      publishedThreadCount: f.publishedThreadCount,
      lastActivityAt: f.lastActivityAt?.toISOString() ?? null,
    })),
  });
}

export async function POST(request: Request, { params }: Props) {
  if (!platformFeatures.communities(getServerPlatformPhase())) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const authBlock = guardMemberAuthApi();
  if (authBlock) return authBlock;

  if (!(await allowPublicFormRequest(request, "communities-forums-write"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { slug: raw } = await params;
  const slug = raw.trim().toLowerCase();
  if (!isCommunitySlug(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const session = await getMemberSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const community = await findActiveCommunityBySlug(slug);
  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  const membership = await prisma.communityMembership.findUnique({
    where: {
      communityId_memberId: { communityId: community.id, memberId: session.memberId },
    },
  });
  if (!membership || membership.state !== "ACTIVE") {
    return NextResponse.json({ error: "Active membership required" }, { status: 403 });
  }
  if (!canCreateForum(membership.role)) {
    return NextResponse.json({ error: "Only moderators or verified leaders can create forums" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = communityForumCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const baseSlug = parsed.data.slug ?? forumSlugFromName(parsed.data.name);
  let candidate = baseSlug;
  for (let n = 0; n < 30; n += 1) {
    const taken = await prisma.communityForum.findUnique({
      where: { communityId_slug: { communityId: community.id, slug: candidate } },
      select: { id: true },
    });
    if (!taken) break;
    candidate = `${baseSlug}-${n + 2}`;
  }

  let created;
  try {
    created = await prisma.communityForum.create({
      data: {
        communityId: community.id,
        slug: candidate,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        locked: true,
        createdAt: true,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "Forum slug already exists" }, { status: 409 });
    }
    throw e;
  }

  return NextResponse.json({ forum: created }, { status: 201 });
}

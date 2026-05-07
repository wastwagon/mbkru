import { NextResponse } from "next/server";
import { z } from "zod";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import { findActiveCommunityBySlug, findMembership } from "@/lib/server/communities-access";
import {
  createMediaRecordsFromVerificationFiles,
  VerificationUploadError,
} from "@/lib/server/community-verification-upload";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import {
  communityVerificationSubmitSchema,
  isCommunitySlug,
} from "@/lib/validation/communities";

type Props = { params: Promise<{ slug: string }> };

/** Current member's latest verification request for a community. */
export async function GET(request: Request, { params }: Props) {
  if (!platformFeatures.communities(getServerPlatformPhase())) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  const authBlock = guardMemberAuthApi();
  if (authBlock) return authBlock;
  if (!(await allowPublicFormRequest(request, "communities-verification-read"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { slug: raw } = await params;
  const slug = raw.trim().toLowerCase();
  if (!isCommunitySlug(slug)) return NextResponse.json({ error: "Invalid slug" }, { status: 400 });

  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const community = await findActiveCommunityBySlug(slug);
  if (!community) return NextResponse.json({ error: "Community not found" }, { status: 404 });

  const membership = await findMembership(community.id, session.memberId);
  if (!membership || membership.state !== "ACTIVE") {
    return NextResponse.json({ error: "Active membership required" }, { status: 403 });
  }

  const latest = await prisma.communityVerificationRequest.findFirst({
    where: { communityId: community.id, memberId: session.memberId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      reviewNotes: true,
      reviewedAt: true,
      createdAt: true,
      updatedAt: true,
      documentMediaIds: true,
    },
  });

  return NextResponse.json({ verification: latest });
}

/** Submit a verification request for an active community member. */
export async function POST(request: Request, { params }: Props) {
  if (!platformFeatures.communities(getServerPlatformPhase())) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  const authBlock = guardMemberAuthApi();
  if (authBlock) return authBlock;
  if (!(await allowPublicFormRequest(request, "communities-verification-submit"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { slug: raw } = await params;
  const slug = raw.trim().toLowerCase();
  if (!isCommunitySlug(slug)) return NextResponse.json({ error: "Invalid slug" }, { status: 400 });

  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const community = await findActiveCommunityBySlug(slug);
  if (!community) return NextResponse.json({ error: "Community not found" }, { status: 404 });

  const membership = await findMembership(community.id, session.memberId);
  if (!membership || membership.state !== "ACTIVE") {
    return NextResponse.json({ error: "Active membership required" }, { status: 403 });
  }
  if (membership.role === "QUEEN_MOTHER_VERIFIED") {
    return NextResponse.json({ error: "Already verified in this community" }, { status: 409 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  let mediaIds: string[];
  let note: string | null;

  if (contentType.includes("multipart/form-data")) {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const files = formData.getAll("documents").filter((x): x is File => x instanceof File);
    let uploadedIds: string[] = [];
    if (files.length > 0) {
      try {
        uploadedIds = await createMediaRecordsFromVerificationFiles(files);
      } catch (e) {
        if (e instanceof VerificationUploadError) {
          const message =
            e.code === "empty"
              ? "Each file must be non-empty"
              : e.code === "too_large"
                ? "Each file must be at most 8 MB"
                : e.code === "bad_mime"
                  ? "Only JPEG, PNG, WebP, GIF, and PDF are allowed"
                  : e.code === "scanner_infected"
                    ? "A document was blocked by malware scanner"
                    : e.code === "scanner_unavailable"
                      ? "Upload scanner unavailable"
                      : "At most 10 documents per request";
          return NextResponse.json(
            { error: message },
            { status: e.code === "scanner_unavailable" ? 503 : 400 },
          );
        }
        throw e;
      }
    }

    const idsField = formData.get("documentMediaIds");
    const extraTokens =
      typeof idsField === "string"
        ? idsField
            .split(/[\s,]+/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
    let extraIds: string[] = [];
    if (extraTokens.length > 0) {
      const extraParsed = z.array(z.string().cuid()).min(1).max(10).safeParse(extraTokens);
      if (!extraParsed.success) {
        return NextResponse.json({ error: "Invalid documentMediaIds in form" }, { status: 400 });
      }
      extraIds = extraParsed.data;
    }

    mediaIds = [...new Set([...uploadedIds, ...extraIds])];
    if (mediaIds.length === 0) {
      return NextResponse.json(
        { error: "Add at least one document (upload files and/or paste existing media IDs)" },
        { status: 400 },
      );
    }
    if (mediaIds.length > 10) {
      return NextResponse.json({ error: "At most 10 documents per request" }, { status: 400 });
    }

    const noteRaw = formData.get("note");
    const noteStr = typeof noteRaw === "string" ? noteRaw.trim().slice(0, 2000) : "";
    note = noteStr.length ? noteStr : null;

    const existingExtra = extraIds.filter((id) => !uploadedIds.includes(id));
    if (existingExtra.length > 0) {
      const mediaCount = await prisma.media.count({
        where: { id: { in: existingExtra } },
      });
      if (mediaCount !== existingExtra.length) {
        return NextResponse.json({ error: "One or more document IDs are invalid" }, { status: 400 });
      }
    }
  } else {
    const json = (await request.json().catch(() => null)) as unknown;
    const parsed = communityVerificationSubmitSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    mediaIds = [...new Set(parsed.data.documentMediaIds)];
    note = parsed.data.note ?? null;

    const mediaCount = await prisma.media.count({
      where: { id: { in: mediaIds } },
    });
    if (mediaCount !== mediaIds.length) {
      return NextResponse.json({ error: "One or more document IDs are invalid" }, { status: 400 });
    }
  }

  const existingOpen = await prisma.communityVerificationRequest.findFirst({
    where: {
      communityId: community.id,
      memberId: session.memberId,
      status: "SUBMITTED",
    },
    select: { id: true },
  });
  if (existingOpen) {
    return NextResponse.json({ error: "A verification request is already pending review" }, { status: 409 });
  }

  const created = await prisma.communityVerificationRequest.create({
    data: {
      communityId: community.id,
      memberId: session.memberId,
      status: "SUBMITTED",
      documentMediaIds: mediaIds,
      reviewNotes: note,
    },
    select: { id: true, status: true, createdAt: true },
  });

  return NextResponse.json({ verification: created }, { status: 201 });
}

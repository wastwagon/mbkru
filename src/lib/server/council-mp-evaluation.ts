import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { GHANA_REGION_CENTROIDS } from "@/lib/geo/ghana-region-centroids";
import { roundApproximateCoord } from "@/lib/geo/round-approximate-coord";
import { allocateTrackingCode } from "@/lib/server/allocate-tracking-code";
import { createMemberNotification } from "@/lib/server/member-notifications";
import type { CommunityLeadershipContext } from "@/lib/server/require-community-leadership";
import {
  buildCouncilRubricJson,
  parseMeetingDate,
  type CouncilMpEvaluationDraftInput,
} from "@/lib/validation/council-mp-evaluation";

function formatRubricBlock(rubric: Record<string, number> | null): string {
  if (!rubric) return "";
  const lines: string[] = ["Structured council scores (1–5):"];
  if (rubric.accessibility != null) lines.push(`- Accessibility: ${rubric.accessibility}/5`);
  if (rubric.responsiveness != null) lines.push(`- Responsiveness: ${rubric.responsiveness}/5`);
  if (rubric.followThrough != null) lines.push(`- Follow-through: ${rubric.followThrough}/5`);
  return `\n\n${lines.join("\n")}`;
}

export async function upsertCouncilMpEvaluationDraft(
  leadership: CommunityLeadershipContext,
  input: CouncilMpEvaluationDraftInput,
): Promise<{ ok: true; evaluationId: string } | { ok: false; error: string }> {
  const meetingDate = parseMeetingDate(input.meetingDate);
  if (!meetingDate) return { ok: false, error: "Invalid meeting date." };

  const mp = await prisma.parliamentMember.findFirst({
    where: { id: input.parliamentMemberId, active: true },
    select: { id: true },
  });
  if (!mp) return { ok: false, error: "Select a valid MP from the roster." };

  const rubric = buildCouncilRubricJson(input);
  const rubricJson: Prisma.InputJsonValue | typeof Prisma.JsonNull =
    rubric != null ? rubric : Prisma.JsonNull;

  if (input.evaluationId) {
    const existing = await prisma.councilMpEvaluation.findFirst({
      where: {
        id: input.evaluationId,
        communityId: leadership.communityId,
        status: "DRAFT",
      },
      select: { id: true },
    });
    if (!existing) return { ok: false, error: "Draft not found or already submitted." };

    await prisma.councilMpEvaluation.update({
      where: { id: existing.id },
      data: {
        parliamentMemberId: mp.id,
        meetingDate,
        meetingSummary: input.meetingSummary,
        projectsDiscussed: input.projectsDiscussed ?? null,
        attendeesNotes: input.attendeesNotes ?? null,
        rubric: rubricJson,
      },
    });
    return { ok: true, evaluationId: existing.id };
  }

  const created = await prisma.councilMpEvaluation.create({
    data: {
      communityId: leadership.communityId,
      parliamentMemberId: mp.id,
      meetingDate,
      meetingSummary: input.meetingSummary,
      projectsDiscussed: input.projectsDiscussed ?? null,
      attendeesNotes: input.attendeesNotes ?? null,
      rubric: rubricJson,
      createdByMemberId: leadership.memberId,
    },
    select: { id: true },
  });
  return { ok: true, evaluationId: created.id };
}

export async function signAndSubmitCouncilMpEvaluation(
  leadership: CommunityLeadershipContext,
  evaluationId: string,
): Promise<{ ok: true; trackingCode: string } | { ok: false; error: string }> {
  if (leadership.role !== "QUEEN_MOTHER_VERIFIED") {
    return { ok: false, error: "Only a verified Queen Mother can sign and submit council evaluations." };
  }

  const evaluation = await prisma.councilMpEvaluation.findFirst({
    where: { id: evaluationId, communityId: leadership.communityId, status: "DRAFT" },
    include: {
      community: { select: { id: true, name: true, slug: true, regionId: true, traditionalAreaName: true } },
      parliamentMember: {
        select: {
          id: true,
          name: true,
          slug: true,
          constituencyId: true,
          constituency: { select: { id: true, regionId: true, name: true } },
        },
      },
    },
  });

  if (!evaluation) return { ok: false, error: "Draft not found or already submitted." };

  const signedAt = new Date();
  const rubric =
    evaluation.rubric != null &&
    typeof evaluation.rubric === "object" &&
    !Array.isArray(evaluation.rubric)
      ? (evaluation.rubric as Record<string, number>)
      : null;

  const bodyParts = [
    evaluation.meetingSummary.trim(),
    evaluation.projectsDiscussed?.trim()
      ? `\n\nDevelopment projects discussed:\n${evaluation.projectsDiscussed.trim()}`
      : "",
    evaluation.attendeesNotes?.trim()
      ? `\n\nCouncil attendees / notes:\n${evaluation.attendeesNotes.trim()}`
      : "",
    formatRubricBlock(rubric),
    `\n\nMeeting date: ${evaluation.meetingDate.toLocaleDateString("en-GB", { dateStyle: "long" })}`,
  ];

  let regionId = evaluation.community.regionId ?? evaluation.parliamentMember.constituency?.regionId ?? null;
  let constituencyId = evaluation.parliamentMember.constituencyId ?? null;

  if (!regionId && constituencyId) {
    const c = await prisma.constituency.findUnique({
      where: { id: constituencyId },
      select: { regionId: true },
    });
    regionId = c?.regionId ?? null;
  }

  if (!regionId) {
    return { ok: false, error: "Could not resolve region for this evaluation. Link the community to a region in admin." };
  }

  const region = await prisma.region.findUnique({
    where: { id: regionId },
    select: { name: true, slug: true },
  });

  const localArea =
    evaluation.community.traditionalAreaName?.trim() ||
    evaluation.community.name ||
    region?.name ||
    "Ghana";

  let latitude: number | null = null;
  let longitude: number | null = null;
  if (region?.slug && GHANA_REGION_CENTROIDS[region.slug]) {
    const c = GHANA_REGION_CENTROIDS[region.slug]!;
    latitude = roundApproximateCoord(c.lat);
    longitude = roundApproximateCoord(c.lng);
  }

  const trackingCode = await allocateTrackingCode(prisma);
  const title = `Council MP evaluation — ${evaluation.community.name}`.slice(0, 300);

  const staffNotes = [
    `Council evaluation from community "${evaluation.community.name}" (${evaluation.community.slug}).`,
    `Queen Mother signed ${signedAt.toISOString()}.`,
    `Evaluation id: ${evaluation.id}.`,
  ].join(" ");

  const report = await prisma.$transaction(async (tx) => {
    const created = await tx.citizenReport.create({
      data: {
        trackingCode,
        kind: "MP_PERFORMANCE",
        intakeSource: "COUNCIL_EVALUATION",
        memberId: leadership.memberId,
        communityId: evaluation.community.id,
        parliamentMemberId: evaluation.parliamentMember.id,
        experienceVerificationTier: "CORROBORATED",
        mpPerformanceRubric: rubric != null ? rubric : undefined,
        title,
        body: bodyParts.join("").trim(),
        regionId,
        constituencyId,
        localArea: localArea.slice(0, 512),
        latitude,
        longitude,
        staffNotes,
        submitterWasAssisted: false,
      },
      select: { id: true, trackingCode: true },
    });

    await tx.councilMpEvaluation.update({
      where: { id: evaluation.id },
      data: {
        status: "SUBMITTED",
        signedByMemberId: leadership.memberId,
        signedAt,
        citizenReportId: created.id,
      },
    });

    return created;
  });

  await createMemberNotification(leadership.memberId, "COUNCIL_MP_EVALUATION_SUBMITTED", {
    communitySlug: evaluation.community.slug,
    communityName: evaluation.community.name,
    trackingCode: report.trackingCode,
    parliamentMemberName: evaluation.parliamentMember.name,
  });

  if (evaluation.createdByMemberId !== leadership.memberId) {
    await createMemberNotification(evaluation.createdByMemberId, "COUNCIL_MP_EVALUATION_SUBMITTED", {
      communitySlug: evaluation.community.slug,
      communityName: evaluation.community.name,
      trackingCode: report.trackingCode,
      parliamentMemberName: evaluation.parliamentMember.name,
    });
  }

  return { ok: true, trackingCode: report.trackingCode };
}

export async function listCouncilMpEvaluationsForCommunity(communityId: string) {
  return prisma.councilMpEvaluation.findMany({
    where: { communityId },
    orderBy: { updatedAt: "desc" },
    take: 20,
    select: {
      id: true,
      status: true,
      meetingDate: true,
      meetingSummary: true,
      signedAt: true,
      createdAt: true,
      parliamentMember: { select: { name: true } },
      citizenReport: { select: { trackingCode: true } },
    },
  });
}

export async function loadMpOptionsForCommunityRegion(regionId: string | null) {
  const where = regionId
    ? { active: true, constituency: { regionId } }
    : { active: true };

  const rows = await prisma.parliamentMember.findMany({
    where,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      party: true,
      constituency: { select: { name: true } },
    },
  });

  return rows.map((m) => ({
    id: m.id,
    label: `${m.name}${m.party ? ` · ${m.party}` : ""}${m.constituency?.name ? ` · ${m.constituency.name}` : ""}`,
  }));
}

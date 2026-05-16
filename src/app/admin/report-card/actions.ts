"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";
import { computeTripleHeadlineScore } from "@/lib/report-card-headline";
import { REPORT_CARD_INDEX_TAG, reportCardYearTag } from "@/lib/server/accountability-cache";

const createCycleSchema = z.object({
  year: z.coerce.number().int().min(1992).max(2100),
  label: z.string().trim().min(1).max(200),
  methodology: z.string().trim().max(100_000).optional(),
  disputeWindowEndsAt: z.union([z.string(), z.undefined()]).transform((s) => {
    const t = s?.trim();
    if (!t) return null;
    const d = new Date(t);
    return Number.isNaN(d.getTime()) ? null : d;
  }),
});

const cycleIdSchema = z.object({
  cycleId: z.string().cuid(),
});

const optionalScoreField = z
  .string()
  .optional()
  .transform((s) => {
    const t = s?.trim();
    if (!t) return null;
    const n = Number.parseFloat(t);
    return Number.isFinite(n) ? n : null;
  });

const upsertEntrySchema = z.object({
  cycleId: z.string().cuid(),
  memberId: z.string().cuid(),
  narrative: z.string().trim().max(100_000).optional(),
  indexAScore: optionalScoreField,
  indexBScore: optionalScoreField,
  indexCScore: optionalScoreField,
  overallScore: optionalScoreField,
  syncHeadlineFromTriple: z.preprocess(
    (v) => v === "on" || v === "1" || v === true || v === "true",
    z.boolean(),
  ),
});

export async function createReportCardCycleAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const parsed = createCycleSchema.safeParse({
    year: formData.get("year"),
    label: formData.get("label"),
    methodology: String(formData.get("methodology") ?? "").trim() || undefined,
    disputeWindowEndsAt: formData.get("disputeWindowEndsAt") ?? undefined,
  });
  if (!parsed.success) return;

  try {
    await prisma.reportCardCycle.create({
      data: {
        year: parsed.data.year,
        label: parsed.data.label,
        methodology: parsed.data.methodology ?? null,
        disputeWindowEndsAt: parsed.data.disputeWindowEndsAt,
      },
    });
  } catch {
    return;
  }

  revalidatePath("/admin/report-card");
  revalidatePath("/report-card");
  revalidatePath(`/report-card/${parsed.data.year}`);
  revalidateTag(REPORT_CARD_INDEX_TAG, "max");
  revalidateTag(reportCardYearTag(parsed.data.year), "max");
}

const cycleDisputeSchema = z.object({
  cycleId: z.string().cuid(),
  disputeWindowEndsAt: z.union([z.string(), z.undefined()]).transform((s) => {
    const t = s?.trim();
    if (!t) return null;
    const d = new Date(t);
    return Number.isNaN(d.getTime()) ? null : d;
  }),
});

export async function updateReportCardCycleDisputeWindowAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const parsed = cycleDisputeSchema.safeParse({
    cycleId: formData.get("cycleId"),
    disputeWindowEndsAt: formData.get("disputeWindowEndsAt") ?? undefined,
  });
  if (!parsed.success) return;

  const row = await prisma.reportCardCycle.findUnique({
    where: { id: parsed.data.cycleId },
    select: { id: true, year: true },
  });
  if (!row) return;

  await prisma.reportCardCycle.update({
    where: { id: parsed.data.cycleId },
    data: { disputeWindowEndsAt: parsed.data.disputeWindowEndsAt },
  });

  revalidatePath("/admin/report-card");
  revalidatePath(`/admin/report-card/${parsed.data.cycleId}`);
  revalidatePath("/report-card");
  revalidatePath(`/report-card/${row.year}`);
  revalidateTag(REPORT_CARD_INDEX_TAG, "max");
  revalidateTag(reportCardYearTag(row.year), "max");
}

export async function publishReportCardCycleAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const parsed = cycleIdSchema.safeParse({ cycleId: formData.get("cycleId") });
  if (!parsed.success) return;

  await prisma.reportCardCycle.update({
    where: { id: parsed.data.cycleId },
    data: { publishedAt: new Date() },
  });
  revalidatePath("/admin/report-card");
  revalidatePath("/report-card");
  const c = await prisma.reportCardCycle.findUnique({
    where: { id: parsed.data.cycleId },
    select: { year: true },
  });
  if (c) {
    revalidatePath(`/report-card/${c.year}`);
    revalidateTag(REPORT_CARD_INDEX_TAG, "max");
    revalidateTag(reportCardYearTag(c.year), "max");
  }
}

export async function unpublishReportCardCycleAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const parsed = cycleIdSchema.safeParse({ cycleId: formData.get("cycleId") });
  if (!parsed.success) return;

  const c = await prisma.reportCardCycle.findUnique({
    where: { id: parsed.data.cycleId },
    select: { year: true },
  });
  await prisma.reportCardCycle.update({
    where: { id: parsed.data.cycleId },
    data: { publishedAt: null },
  });
  revalidatePath("/admin/report-card");
  revalidatePath("/report-card");
  if (c) {
    revalidatePath(`/report-card/${c.year}`);
    revalidateTag(REPORT_CARD_INDEX_TAG, "max");
    revalidateTag(reportCardYearTag(c.year), "max");
  }
}

export async function upsertScorecardEntryAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const metricsRaw = String(formData.get("metrics") ?? "").trim();
  let metrics: Prisma.InputJsonValue | typeof Prisma.JsonNull = Prisma.JsonNull;
  if (metricsRaw) {
    try {
      metrics = JSON.parse(metricsRaw) as Prisma.InputJsonValue;
    } catch {
      return;
    }
  }

  const parsed = upsertEntrySchema.safeParse({
    cycleId: formData.get("cycleId"),
    memberId: formData.get("memberId"),
    narrative: String(formData.get("narrative") ?? "").trim() || undefined,
    indexAScore: formData.get("indexAScore") ?? undefined,
    indexBScore: formData.get("indexBScore") ?? undefined,
    indexCScore: formData.get("indexCScore") ?? undefined,
    overallScore: formData.get("overallScore") ?? undefined,
    syncHeadlineFromTriple: formData.get("syncHeadlineFromTriple") ?? undefined,
  });
  if (!parsed.success) return;

  let overallScore = parsed.data.overallScore;
  if (parsed.data.syncHeadlineFromTriple) {
    const derived = computeTripleHeadlineScore(
      parsed.data.indexAScore,
      parsed.data.indexBScore,
      parsed.data.indexCScore,
    );
    if (derived != null) overallScore = derived;
  }

  const cycle = await prisma.reportCardCycle.findUnique({
    where: { id: parsed.data.cycleId },
    select: { id: true },
  });
  if (!cycle) return;

  const member = await prisma.parliamentMember.findUnique({
    where: { id: parsed.data.memberId },
    select: { id: true },
  });
  if (!member) return;

  await prisma.scorecardEntry.upsert({
    where: {
      cycleId_memberId: {
        cycleId: parsed.data.cycleId,
        memberId: parsed.data.memberId,
      },
    },
    create: {
      cycleId: parsed.data.cycleId,
      memberId: parsed.data.memberId,
      narrative: parsed.data.narrative ?? null,
      indexAScore: parsed.data.indexAScore,
      indexBScore: parsed.data.indexBScore,
      indexCScore: parsed.data.indexCScore,
      overallScore,
      metrics: metrics === Prisma.JsonNull ? Prisma.JsonNull : metrics,
    },
    update: {
      narrative: parsed.data.narrative ?? null,
      indexAScore: parsed.data.indexAScore,
      indexBScore: parsed.data.indexBScore,
      indexCScore: parsed.data.indexCScore,
      overallScore,
      metrics: metrics === Prisma.JsonNull ? Prisma.JsonNull : metrics,
    },
  });

  revalidatePath(`/admin/report-card/${parsed.data.cycleId}`);
  revalidatePath("/report-card");
  const cy = await prisma.reportCardCycle.findUnique({
    where: { id: parsed.data.cycleId },
    select: { year: true, publishedAt: true },
  });
  if (cy?.publishedAt) {
    revalidatePath(`/report-card/${cy.year}`);
    revalidateTag(REPORT_CARD_INDEX_TAG, "max");
    revalidateTag(reportCardYearTag(cy.year), "max");
  }
}

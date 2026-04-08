"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { PromiseStatus } from "@prisma/client";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";
import { isPolicySectorValue } from "@/lib/promise-policy-sectors";
import {
  MPS_ROSTER_TAG,
  PROMISES_INDEX_TAG,
  promisesMemberTag,
} from "@/lib/server/accountability-cache";

const createPromiseSchema = z.object({
  memberId: z.string().cuid(),
  title: z.string().trim().min(3).max(500),
  description: z.string().trim().max(50_000).optional(),
  sourceLabel: z.string().trim().min(1).max(200),
  sourceDate: z.union([z.string(), z.undefined()]).transform((s) => {
    const t = s?.trim();
    if (!t) return null;
    const d = new Date(t);
    return Number.isNaN(d.getTime()) ? null : d;
  }),
  electionCycle: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((s) => (s && s.length ? s : undefined)),
  partySlug: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((s) => (s && s.length ? s.toLowerCase() : undefined)),
  manifestoDocumentId: z.preprocess(
    (v) => (typeof v === "string" && v.trim().length ? v.trim() : undefined),
    z.string().cuid().optional(),
  ),
  manifestoPageRef: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((s) => (s && s.length ? s : undefined)),
  sourceUrl: z.preprocess(
    (v) => {
      if (v == null || v === "") return undefined;
      const s = String(v).trim();
      return s.length ? s : undefined;
    },
    z.string().url().max(2000).optional(),
  ),
  verificationNotes: z
    .string()
    .trim()
    .max(50_000)
    .optional()
    .transform((s) => (s && s.length ? s : undefined)),
});

const updateStatusSchema = z.object({
  promiseId: z.string().cuid(),
  memberId: z.string().cuid(),
});

function parsePromiseStatus(raw: unknown): PromiseStatus {
  const s = String(raw ?? "").trim();
  return (Object.values(PromiseStatus) as string[]).includes(s) ? (s as PromiseStatus) : "TRACKING";
}

export async function createCampaignPromiseAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const descRaw = String(formData.get("description") ?? "").trim();
  const parsed = createPromiseSchema.safeParse({
    memberId: formData.get("memberId"),
    title: formData.get("title"),
    description: descRaw.length > 0 ? descRaw : undefined,
    sourceLabel: formData.get("sourceLabel"),
    sourceDate: formData.get("sourceDate") ?? undefined,
    electionCycle: formData.get("electionCycle") ?? undefined,
    partySlug: formData.get("partySlug") ?? undefined,
    manifestoDocumentId: formData.get("manifestoDocumentId") ?? undefined,
    manifestoPageRef: formData.get("manifestoPageRef") ?? undefined,
    sourceUrl: formData.get("sourceUrl") ?? undefined,
    verificationNotes: String(formData.get("verificationNotes") ?? "").trim() || undefined,
  });

  if (!parsed.success) {
    return;
  }

  const sectorRaw = String(formData.get("policySector") ?? "").trim().toUpperCase();
  let policySector: string | null = null;
  if (sectorRaw) {
    if (!isPolicySectorValue(sectorRaw)) return;
    policySector = sectorRaw;
  }

  const status = parsePromiseStatus(formData.get("status"));
  const isGovernmentProgramme = formData.get("isGovernmentProgramme") === "on";

  const member = await prisma.parliamentMember.findUnique({
    where: { id: parsed.data.memberId },
    select: { id: true, slug: true },
  });
  if (!member) return;

  if (parsed.data.manifestoDocumentId) {
    const doc = await prisma.manifestoDocument.findUnique({
      where: { id: parsed.data.manifestoDocumentId },
      select: { id: true },
    });
    if (!doc) return;
  }

  await prisma.campaignPromise.create({
    data: {
      memberId: parsed.data.memberId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      sourceLabel: parsed.data.sourceLabel,
      sourceUrl: parsed.data.sourceUrl ?? null,
      sourceDate: parsed.data.sourceDate,
      verificationNotes: parsed.data.verificationNotes ?? null,
      status,
      electionCycle: parsed.data.electionCycle ?? null,
      partySlug: parsed.data.partySlug ?? null,
      manifestoDocumentId: parsed.data.manifestoDocumentId ?? null,
      manifestoPageRef: parsed.data.manifestoPageRef ?? null,
      isGovernmentProgramme,
      policySector,
    },
  });

  revalidatePath(`/admin/parliament/${parsed.data.memberId}`);
  revalidatePath("/admin/parliament");
  revalidateTag(PROMISES_INDEX_TAG, "max");
  revalidateTag(promisesMemberTag(member.slug), "max");
  revalidateTag(MPS_ROSTER_TAG, "max");
  revalidatePath("/promises");
  revalidatePath(`/promises/${member.slug}`);
  revalidatePath("/government-commitments");
}

export async function updateCampaignPromiseStatusAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const parsed = updateStatusSchema.safeParse({
    promiseId: formData.get("promiseId"),
    memberId: formData.get("memberId"),
  });
  if (!parsed.success) return;

  const status = parsePromiseStatus(formData.get("status"));

  const row = await prisma.campaignPromise.findFirst({
    where: { id: parsed.data.promiseId, memberId: parsed.data.memberId },
    select: { id: true },
  });
  if (!row) return;

  await prisma.campaignPromise.update({
    where: { id: parsed.data.promiseId },
    data: { status },
  });

  const member = await prisma.parliamentMember.findUnique({
    where: { id: parsed.data.memberId },
    select: { slug: true },
  });

  revalidatePath(`/admin/parliament/${parsed.data.memberId}`);
  if (member) {
    revalidateTag(PROMISES_INDEX_TAG, "max");
    revalidateTag(promisesMemberTag(member.slug), "max");
    revalidateTag(MPS_ROSTER_TAG, "max");
    revalidatePath("/promises");
    revalidatePath(`/promises/${member.slug}`);
    revalidatePath("/government-commitments");
  }
}

const updateEvidenceSchema = z.object({
  promiseId: z.string().cuid(),
  memberId: z.string().cuid(),
  sourceLabel: z.string().trim().min(1).max(200),
});

export async function updateCampaignPromiseEvidenceAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const parsed = updateEvidenceSchema.safeParse({
    promiseId: formData.get("promiseId"),
    memberId: formData.get("memberId"),
    sourceLabel: formData.get("sourceLabel"),
  });
  if (!parsed.success) return;

  const sourceUrlRaw = String(formData.get("sourceUrl") ?? "").trim();
  let sourceUrl: string | null = null;
  if (sourceUrlRaw.length > 0) {
    const urlParsed = z.string().url().max(2000).safeParse(sourceUrlRaw);
    if (!urlParsed.success) return;
    sourceUrl = urlParsed.data;
  }

  const notesRaw = String(formData.get("verificationNotes") ?? "");
  const verificationNotes = notesRaw.trim().length > 0 ? notesRaw.trim() : null;

  const sectorRaw = String(formData.get("policySector") ?? "").trim().toUpperCase();
  let policySector: string | null = null;
  if (sectorRaw) {
    if (!isPolicySectorValue(sectorRaw)) return;
    policySector = sectorRaw;
  } else {
    policySector = null;
  }

  const row = await prisma.campaignPromise.findFirst({
    where: { id: parsed.data.promiseId, memberId: parsed.data.memberId },
    select: { id: true },
  });
  if (!row) return;

  await prisma.campaignPromise.update({
    where: { id: row.id },
    data: {
      sourceLabel: parsed.data.sourceLabel,
      sourceUrl,
      verificationNotes,
      policySector,
    },
  });

  const member = await prisma.parliamentMember.findUnique({
    where: { id: parsed.data.memberId },
    select: { slug: true },
  });

  revalidatePath(`/admin/parliament/${parsed.data.memberId}`);
  revalidateTag(PROMISES_INDEX_TAG, "max");
  if (member) {
    revalidateTag(promisesMemberTag(member.slug), "max");
    revalidatePath(`/promises/${member.slug}`);
  }
  revalidateTag(MPS_ROSTER_TAG, "max");
  revalidatePath("/promises");
  revalidatePath("/government-commitments");
}

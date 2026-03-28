"use server";

import { revalidatePath } from "next/cache";
import { PromiseStatus } from "@prisma/client";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";

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
  });

  if (!parsed.success) {
    return;
  }

  const status = parsePromiseStatus(formData.get("status"));

  const member = await prisma.parliamentMember.findUnique({
    where: { id: parsed.data.memberId },
    select: { id: true },
  });
  if (!member) return;

  await prisma.campaignPromise.create({
    data: {
      memberId: parsed.data.memberId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      sourceLabel: parsed.data.sourceLabel,
      sourceDate: parsed.data.sourceDate,
      status,
    },
  });

  revalidatePath(`/admin/parliament/${parsed.data.memberId}`);
  revalidatePath("/admin/parliament");
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

  revalidatePath(`/admin/parliament/${parsed.data.memberId}`);
}

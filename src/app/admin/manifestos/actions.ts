"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";

const createSchema = z.object({
  title: z.string().trim().min(2).max(500),
  partySlug: z.string().trim().min(1).max(120).toLowerCase(),
  electionCycle: z.string().trim().min(2).max(32),
  sourceUrl: z.string().trim().url().max(4000),
  notes: z.string().trim().max(20_000).optional(),
  publishedAt: z
    .union([z.string(), z.undefined()])
    .transform((s) => {
      const t = s?.trim();
      if (!t) return null;
      const d = new Date(t);
      return Number.isNaN(d.getTime()) ? null : d;
    }),
});

export async function createManifestoDocumentAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const notesRaw = String(formData.get("notes") ?? "").trim();
  const parsed = createSchema.safeParse({
    title: formData.get("title"),
    partySlug: formData.get("partySlug"),
    electionCycle: formData.get("electionCycle"),
    sourceUrl: formData.get("sourceUrl"),
    notes: notesRaw.length > 0 ? notesRaw : undefined,
    publishedAt: formData.get("publishedAt") ?? undefined,
  });

  if (!parsed.success) return;

  await prisma.manifestoDocument.create({
    data: {
      title: parsed.data.title,
      partySlug: parsed.data.partySlug,
      electionCycle: parsed.data.electionCycle,
      sourceUrl: parsed.data.sourceUrl,
      notes: parsed.data.notes ?? null,
      publishedAt: parsed.data.publishedAt,
    },
  });

  revalidatePath("/admin/manifestos");
}

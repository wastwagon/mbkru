"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const statusEnum = z.enum(["TBC", "SCHEDULED", "COMPLETED", "CANCELLED"]);

const programmeKindEnum = z.enum(["TOWN_HALL", "REGIONAL_FORUM", "CONSTITUENCY_DEBATE"]);

function parseOptionalDate(raw: FormDataEntryValue | null): Date | null {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

const createSchema = z.object({
  slug: z.string().trim().min(1).max(140).regex(slugRegex),
  title: z.string().trim().min(1).max(300),
  summary: z.string().trim().max(20_000).optional(),
  programmeQuarter: z.string().trim().max(80).optional(),
  venueLine: z.string().trim().max(500).optional(),
  infoUrl: z.string().trim().max(2000).url().optional(),
  sourceCitation: z.string().trim().max(20_000).optional(),
  sortOrder: z.coerce.number().int().min(0).max(999_999).optional(),
  status: statusEnum,
  regionId: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().cuid().optional(),
  ),
  kind: programmeKindEnum,
  constituencyId: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().cuid().optional(),
  ),
});

async function resolveProgrammeRegionId(
  regionId: string | null | undefined,
  constituencyId: string | null | undefined,
): Promise<string | null> {
  if (constituencyId) {
    const c = await prisma.constituency.findUnique({
      where: { id: constituencyId },
      select: { regionId: true },
    });
    if (c) return c.regionId;
  }
  return regionId ?? null;
}

export async function createTownHallEventAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const parsed = createSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    summary: String(formData.get("summary") ?? "").trim() || undefined,
    programmeQuarter: String(formData.get("programmeQuarter") ?? "").trim() || undefined,
    venueLine: String(formData.get("venueLine") ?? "").trim() || undefined,
    infoUrl: (() => {
      const u = String(formData.get("infoUrl") ?? "").trim();
      return u.length > 0 ? u : undefined;
    })(),
    sourceCitation: String(formData.get("sourceCitation") ?? "").trim() || undefined,
    sortOrder: formData.get("sortOrder"),
    status: formData.get("status"),
    regionId: String(formData.get("regionId") ?? "").trim(),
    kind: formData.get("kind"),
    constituencyId: String(formData.get("constituencyId") ?? "").trim(),
  });
  if (!parsed.success) return;

  const constituencyId = parsed.data.constituencyId ?? null;
  const regionId = await resolveProgrammeRegionId(parsed.data.regionId ?? null, constituencyId);
  const infoUrl = parsed.data.infoUrl ?? null;
  const startsAt = parseOptionalDate(formData.get("startsAt"));
  const endsAt = parseOptionalDate(formData.get("endsAt"));

  try {
    await prisma.townHallEvent.create({
      data: {
        slug: parsed.data.slug,
        kind: parsed.data.kind,
        title: parsed.data.title,
        summary: parsed.data.summary ?? null,
        programmeQuarter: parsed.data.programmeQuarter ?? null,
        venueLine: parsed.data.venueLine ?? null,
        infoUrl,
        sourceCitation: parsed.data.sourceCitation ?? null,
        sortOrder: parsed.data.sortOrder ?? 0,
        status: parsed.data.status,
        regionId,
        constituencyId,
        startsAt,
        endsAt,
      },
    });
  } catch {
    return;
  }

  revalidatePath("/admin/town-halls");
  revalidatePath("/town-halls");
  revalidatePath("/debates");
}

const updateSchema = createSchema.extend({
  id: z.string().cuid(),
});

export async function updateTownHallEventAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    slug: formData.get("slug"),
    title: formData.get("title"),
    summary: String(formData.get("summary") ?? "").trim() || undefined,
    programmeQuarter: String(formData.get("programmeQuarter") ?? "").trim() || undefined,
    venueLine: String(formData.get("venueLine") ?? "").trim() || undefined,
    infoUrl: (() => {
      const u = String(formData.get("infoUrl") ?? "").trim();
      return u.length > 0 ? u : undefined;
    })(),
    sourceCitation: String(formData.get("sourceCitation") ?? "").trim() || undefined,
    sortOrder: formData.get("sortOrder"),
    status: formData.get("status"),
    regionId: String(formData.get("regionId") ?? "").trim(),
    kind: formData.get("kind"),
    constituencyId: String(formData.get("constituencyId") ?? "").trim(),
  });
  if (!parsed.success) return;

  const constituencyId = parsed.data.constituencyId ?? null;
  const regionId = await resolveProgrammeRegionId(parsed.data.regionId ?? null, constituencyId);
  const infoUrl = parsed.data.infoUrl ?? null;
  const startsAt = parseOptionalDate(formData.get("startsAt"));
  const endsAt = parseOptionalDate(formData.get("endsAt"));

  const existing = await prisma.townHallEvent.findUnique({
    where: { id: parsed.data.id },
    select: { id: true, slug: true },
  });
  if (!existing) return;

  if (parsed.data.slug !== existing.slug) {
    const clash = await prisma.townHallEvent.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } });
    if (clash && clash.id !== parsed.data.id) return;
  }

  await prisma.townHallEvent.update({
    where: { id: parsed.data.id },
    data: {
      slug: parsed.data.slug,
      kind: parsed.data.kind,
      title: parsed.data.title,
      summary: parsed.data.summary ?? null,
      programmeQuarter: parsed.data.programmeQuarter ?? null,
      venueLine: parsed.data.venueLine ?? null,
      infoUrl,
      sourceCitation: parsed.data.sourceCitation ?? null,
      sortOrder: parsed.data.sortOrder ?? 0,
      status: parsed.data.status,
      regionId,
      constituencyId,
      startsAt,
      endsAt,
    },
  });

  revalidatePath("/admin/town-halls");
  revalidatePath(`/admin/town-halls/${parsed.data.id}`);
  revalidatePath("/town-halls");
  revalidatePath("/debates");
}

const deleteSchema = z.object({
  id: z.string().cuid(),
});

export async function deleteTownHallEventAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const parsed = deleteSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return;

  try {
    await prisma.townHallEvent.delete({ where: { id: parsed.data.id } });
  } catch {
    return;
  }

  revalidatePath("/admin/town-halls");
  revalidatePath("/town-halls");
  revalidatePath("/debates");
  redirect("/admin/town-halls");
}

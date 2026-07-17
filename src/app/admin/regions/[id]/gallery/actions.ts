"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";

const cuid = z.string().cuid();

const addSchema = z.object({
  regionId: cuid,
  mediaId: cuid,
  sectorLabel: z.string().trim().min(2).max(80),
  alt: z.string().trim().min(5).max(300),
  credit: z.string().trim().max(200).optional(),
});

const updateSchema = z.object({
  id: cuid,
  mediaId: cuid.optional(),
  sectorLabel: z.string().trim().min(2).max(80),
  alt: z.string().trim().min(5).max(300),
  credit: z.string().trim().max(200).optional(),
});

const idSchema = z.object({ id: cuid });

const moveSchema = z.object({
  id: cuid,
  direction: z.enum(["up", "down"]),
});

/** Only public library images may appear on public regional galleries. */
async function assertPublicImage(mediaId: string): Promise<boolean> {
  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    select: { visibility: true, mimeType: true },
  });
  return Boolean(media && media.visibility === "PUBLIC" && media.mimeType.startsWith("image/"));
}

async function revalidateRegionGallery(regionId: string): Promise<void> {
  const region = await prisma.region.findUnique({ where: { id: regionId }, select: { slug: true } });
  revalidatePath(`/admin/regions/${regionId}/gallery`);
  if (region) revalidatePath(`/regions/${region.slug}`);
}

export async function addRegionSectorImageAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const parsed = addSchema.safeParse({
    regionId: formData.get("regionId"),
    mediaId: formData.get("mediaId"),
    sectorLabel: formData.get("sectorLabel"),
    alt: formData.get("alt"),
    credit: formData.get("credit") || undefined,
  });
  if (!parsed.success) return;
  if (!(await assertPublicImage(parsed.data.mediaId))) return;

  const region = await prisma.region.findUnique({ where: { id: parsed.data.regionId }, select: { id: true } });
  if (!region) return;

  const maxRow = await prisma.regionSectorImage.aggregate({
    where: { regionId: parsed.data.regionId },
    _max: { sortOrder: true },
  });

  await prisma.regionSectorImage.create({
    data: {
      regionId: parsed.data.regionId,
      mediaId: parsed.data.mediaId,
      sectorLabel: parsed.data.sectorLabel,
      alt: parsed.data.alt,
      credit: parsed.data.credit ?? null,
      sortOrder: (maxRow._max.sortOrder ?? 0) + 1,
    },
  });

  await revalidateRegionGallery(parsed.data.regionId);
}

export async function updateRegionSectorImageAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    mediaId: formData.get("mediaId") || undefined,
    sectorLabel: formData.get("sectorLabel"),
    alt: formData.get("alt"),
    credit: formData.get("credit") || undefined,
  });
  if (!parsed.success) return;

  const row = await prisma.regionSectorImage.findUnique({
    where: { id: parsed.data.id },
    select: { regionId: true },
  });
  if (!row) return;

  if (parsed.data.mediaId && !(await assertPublicImage(parsed.data.mediaId))) return;

  await prisma.regionSectorImage.update({
    where: { id: parsed.data.id },
    data: {
      sectorLabel: parsed.data.sectorLabel,
      alt: parsed.data.alt,
      credit: parsed.data.credit ?? null,
      ...(parsed.data.mediaId ? { mediaId: parsed.data.mediaId } : {}),
    },
  });

  await revalidateRegionGallery(row.regionId);
}

export async function removeRegionSectorImageAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const parsed = idSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return;

  const row = await prisma.regionSectorImage.findUnique({
    where: { id: parsed.data.id },
    select: { regionId: true },
  });
  if (!row) return;

  // Removes the gallery association only — the media stays in the library.
  await prisma.regionSectorImage.delete({ where: { id: parsed.data.id } });

  await revalidateRegionGallery(row.regionId);
}

export async function moveRegionSectorImageAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const parsed = moveSchema.safeParse({
    id: formData.get("id"),
    direction: formData.get("direction"),
  });
  if (!parsed.success) return;

  const row = await prisma.regionSectorImage.findUnique({
    where: { id: parsed.data.id },
    select: { id: true, regionId: true, sortOrder: true },
  });
  if (!row) return;

  const neighbour = await prisma.regionSectorImage.findFirst({
    where: {
      regionId: row.regionId,
      sortOrder: parsed.data.direction === "up" ? { lt: row.sortOrder } : { gt: row.sortOrder },
    },
    orderBy: { sortOrder: parsed.data.direction === "up" ? "desc" : "asc" },
    select: { id: true, sortOrder: true },
  });
  if (!neighbour) return;

  await prisma.$transaction([
    prisma.regionSectorImage.update({ where: { id: row.id }, data: { sortOrder: neighbour.sortOrder } }),
    prisma.regionSectorImage.update({ where: { id: neighbour.id }, data: { sortOrder: row.sortOrder } }),
  ]);

  await revalidateRegionGallery(row.regionId);
}

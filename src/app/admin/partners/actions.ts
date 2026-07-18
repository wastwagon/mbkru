"use server";

import { PartnerCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { randomSlugSuffix, slugifyTitleSegment } from "@/lib/civic/slug";
import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";
import { assertPublicImageMedia } from "@/lib/server/public-media";

function revalidatePartnersPages(): void {
  revalidatePath("/admin/partners");
  revalidatePath("/partners");
  revalidatePath("/about");
}

function parseSortOrder(raw: FormDataEntryValue | null): number {
  const n = Number.parseInt(String(raw ?? "0"), 10);
  return Number.isFinite(n) ? Math.min(999_999, Math.max(0, n)) : 0;
}

function optionalText(raw: FormDataEntryValue | null, maxLength: number): string | null {
  const s = String(raw ?? "").trim();
  return s.length > 0 ? s.slice(0, maxLength) : null;
}

async function parseMediaId(raw: FormDataEntryValue | null): Promise<string | null | undefined> {
  const id = String(raw ?? "").trim();
  if (!id) return null;
  if (!(await assertPublicImageMedia(id))) return undefined;
  return id;
}

/* ------------------------------ Partners ------------------------------ */

function parsePartnerCategory(raw: unknown): PartnerCategory {
  const s = typeof raw === "string" ? raw.trim().toUpperCase() : "";
  if (s === "GOVERNMENT" || s === "CIVIL_SOCIETY" || s === "DEVELOPMENT" || s === "FOUNDATION" || s === "OTHER") {
    return s as PartnerCategory;
  }
  return PartnerCategory.OTHER;
}

function slugFromNameOrInput(name: string, slugInput: string): string {
  const manual = slugInput
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
  if (manual.length >= 2 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manual)) return manual;
  const fromName = slugifyTitleSegment(name).slice(0, 100);
  return fromName.length > 0 ? fromName : "partner";
}

async function allocateUniquePartnerSlug(base: string, excludeId?: string): Promise<string> {
  let candidate = base.slice(0, 140) || "partner";
  for (let attempt = 0; attempt < 24; attempt++) {
    const clash = await prisma.partner.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!clash || clash.id === excludeId) return candidate;
    candidate = `${base.slice(0, 96)}-${randomSlugSuffix()}`;
  }
  throw new Error("Could not allocate unique partner slug");
}

export async function createPartnerAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const name = String(formData.get("name") ?? "").trim();
  if (!name || name.length < 2) return;

  const logoMediaId = await parseMediaId(formData.get("logoMediaId"));
  if (logoMediaId === undefined) return;

  const baseSlug = slugFromNameOrInput(name, String(formData.get("slug") ?? "").trim());
  const slug = await allocateUniquePartnerSlug(baseSlug);

  try {
    await prisma.partner.create({
      data: {
        name: name.slice(0, 200),
        slug,
        category: parsePartnerCategory(formData.get("category")),
        websiteUrl: optionalText(formData.get("websiteUrl"), 500),
        summary: optionalText(formData.get("summary"), 600),
        logoMediaId,
        sortOrder: parseSortOrder(formData.get("sortOrder")),
        publishedAt: formData.get("publishNow") === "on" ? new Date() : null,
      },
    });
  } catch (e) {
    console.error("[admin/partners] partner create failed", e);
    return;
  }

  revalidatePartnersPages();
}

export async function updatePartnerAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name || name.length < 2) return;

  const existing = await prisma.partner.findUnique({ where: { id }, select: { slug: true } });
  if (!existing) return;

  const logoMediaId = await parseMediaId(formData.get("logoMediaId"));
  if (logoMediaId === undefined) return;

  const baseSlug = slugFromNameOrInput(name, String(formData.get("slug") ?? "").trim());
  const slug = baseSlug === existing.slug ? existing.slug : await allocateUniquePartnerSlug(baseSlug, id);

  await prisma.partner.update({
    where: { id },
    data: {
      name: name.slice(0, 200),
      slug,
      category: parsePartnerCategory(formData.get("category")),
      websiteUrl: optionalText(formData.get("websiteUrl"), 500),
      summary: optionalText(formData.get("summary"), 600),
      logoMediaId,
      sortOrder: parseSortOrder(formData.get("sortOrder")),
    },
  });

  revalidatePartnersPages();
}

export async function publishPartnerAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await prisma.partner.update({ where: { id }, data: { publishedAt: new Date() } });
  revalidatePartnersPages();
}

export async function unpublishPartnerAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await prisma.partner.update({ where: { id }, data: { publishedAt: null } });
  revalidatePartnersPages();
}

export async function deletePartnerAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  try {
    await prisma.partner.delete({ where: { id } });
  } catch {
    return;
  }
  revalidatePartnersPages();
}

/* ------------------------- Leadership profiles ------------------------- */

export async function createLeadershipProfileAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const name = String(formData.get("name") ?? "").trim();
  const roleTitle = String(formData.get("roleTitle") ?? "").trim();
  if (!name || name.length < 2 || !roleTitle || roleTitle.length < 2) return;

  const portraitMediaId = await parseMediaId(formData.get("portraitMediaId"));
  if (portraitMediaId === undefined) return;

  try {
    await prisma.leadershipProfile.create({
      data: {
        name: name.slice(0, 200),
        roleTitle: roleTitle.slice(0, 200),
        bio: optionalText(formData.get("bio"), 10_000),
        portraitMediaId,
        sortOrder: parseSortOrder(formData.get("sortOrder")),
        publishedAt: formData.get("publishNow") === "on" ? new Date() : null,
      },
    });
  } catch (e) {
    console.error("[admin/partners] leadership create failed", e);
    return;
  }

  revalidatePartnersPages();
}

export async function updateLeadershipProfileAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const roleTitle = String(formData.get("roleTitle") ?? "").trim();
  if (!id || !name || name.length < 2 || !roleTitle || roleTitle.length < 2) return;

  const portraitMediaId = await parseMediaId(formData.get("portraitMediaId"));
  if (portraitMediaId === undefined) return;

  const existing = await prisma.leadershipProfile.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return;

  await prisma.leadershipProfile.update({
    where: { id },
    data: {
      name: name.slice(0, 200),
      roleTitle: roleTitle.slice(0, 200),
      bio: optionalText(formData.get("bio"), 10_000),
      portraitMediaId,
      sortOrder: parseSortOrder(formData.get("sortOrder")),
    },
  });

  revalidatePartnersPages();
}

export async function publishLeadershipProfileAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await prisma.leadershipProfile.update({ where: { id }, data: { publishedAt: new Date() } });
  revalidatePartnersPages();
}

export async function unpublishLeadershipProfileAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await prisma.leadershipProfile.update({ where: { id }, data: { publishedAt: null } });
  revalidatePartnersPages();
}

export async function deleteLeadershipProfileAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  try {
    await prisma.leadershipProfile.delete({ where: { id } });
  } catch {
    return;
  }
  revalidatePartnersPages();
}

/* ----------------------------- Endorsements ---------------------------- */

export async function createEndorsementAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const quote = String(formData.get("quote") ?? "").trim();
  const attributionName = String(formData.get("attributionName") ?? "").trim();
  if (!quote || quote.length < 2 || !attributionName || attributionName.length < 2) return;

  try {
    await prisma.endorsement.create({
      data: {
        quote: quote.slice(0, 800),
        attributionName: attributionName.slice(0, 200),
        attributionRole: optionalText(formData.get("attributionRole"), 200),
        sortOrder: parseSortOrder(formData.get("sortOrder")),
        publishedAt: formData.get("publishNow") === "on" ? new Date() : null,
      },
    });
  } catch (e) {
    console.error("[admin/partners] endorsement create failed", e);
    return;
  }

  revalidatePartnersPages();
}

export async function updateEndorsementAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  const quote = String(formData.get("quote") ?? "").trim();
  const attributionName = String(formData.get("attributionName") ?? "").trim();
  if (!id || !quote || quote.length < 2 || !attributionName || attributionName.length < 2) return;

  const existing = await prisma.endorsement.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return;

  await prisma.endorsement.update({
    where: { id },
    data: {
      quote: quote.slice(0, 800),
      attributionName: attributionName.slice(0, 200),
      attributionRole: optionalText(formData.get("attributionRole"), 200),
      sortOrder: parseSortOrder(formData.get("sortOrder")),
    },
  });

  revalidatePartnersPages();
}

export async function publishEndorsementAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await prisma.endorsement.update({ where: { id }, data: { publishedAt: new Date() } });
  revalidatePartnersPages();
}

export async function unpublishEndorsementAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await prisma.endorsement.update({ where: { id }, data: { publishedAt: null } });
  revalidatePartnersPages();
}

export async function deleteEndorsementAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  try {
    await prisma.endorsement.delete({ where: { id } });
  } catch {
    return;
  }
  revalidatePartnersPages();
}

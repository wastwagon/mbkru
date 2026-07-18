import "server-only";

import { Prisma, type Endorsement, type LeadershipProfile, type Media, type Partner } from "@prisma/client";

import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

export type PartnerWithLogo = Partner & { logoMedia: Media | null };
export type LeadershipProfileWithPortrait = LeadershipProfile & { portraitMedia: Media | null };

/**
 * Treat missing table/schema drift or temporarily unreachable DB as "nothing
 * published" so static page generation can still complete.
 */
function isRecoverableCmsReadError(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021") {
    return true;
  }
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }
  return false;
}

export async function getPublishedPartners(): Promise<PartnerWithLogo[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    return await prisma.partner.findMany({
      where: { publishedAt: { not: null } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { logoMedia: true },
    });
  } catch (e) {
    if (isRecoverableCmsReadError(e)) return [];
    throw e;
  }
}

export async function getPublishedLeadershipProfiles(): Promise<LeadershipProfileWithPortrait[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    return await prisma.leadershipProfile.findMany({
      where: { publishedAt: { not: null } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { portraitMedia: true },
    });
  } catch (e) {
    if (isRecoverableCmsReadError(e)) return [];
    throw e;
  }
}

export async function getPublishedEndorsements(): Promise<Endorsement[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    return await prisma.endorsement.findMany({
      where: { publishedAt: { not: null } },
      orderBy: [{ sortOrder: "asc" }, { attributionName: "asc" }],
    });
  } catch (e) {
    if (isRecoverableCmsReadError(e)) return [];
    throw e;
  }
}

export function partnerCategoryLabel(category: Partner["category"]): string {
  switch (category) {
    case "GOVERNMENT":
      return "Government";
    case "CIVIL_SOCIETY":
      return "Civil society";
    case "DEVELOPMENT":
      return "Development";
    case "FOUNDATION":
      return "Foundation";
    default:
      return "Other";
  }
}

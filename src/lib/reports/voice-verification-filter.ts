import type { CitizenReportExperienceVerificationTier, Prisma } from "@prisma/client";

/** Public Report Card Voice browse — verified vs unverified experience ladder. */
export type VoiceVerificationBrowseFilter = "verified" | "unverified";

export function parseVoiceVerificationBrowseFilter(
  raw: string | undefined | null,
): VoiceVerificationBrowseFilter | null {
  const t = raw?.trim().toLowerCase();
  if (t === "verified" || t === "unverified") return t;
  return null;
}

/** Staff tiers treated as “verified” for public browse filters. */
export const VERIFIED_EXPERIENCE_TIERS: CitizenReportExperienceVerificationTier[] = [
  "CORROBORATED",
  "DOCUMENTED",
];

export function voiceVerificationBrowseWhere(
  filter: VoiceVerificationBrowseFilter | null,
): Prisma.CitizenReportWhereInput | undefined {
  if (filter === "unverified") return { experienceVerificationTier: "UNVERIFIED" };
  if (filter === "verified") return { experienceVerificationTier: { in: VERIFIED_EXPERIENCE_TIERS } };
  return undefined;
}

export function publicExperienceVerificationLabel(
  tier: CitizenReportExperienceVerificationTier | null | undefined,
): "Verified" | "Unverified" {
  if (tier === "CORROBORATED" || tier === "DOCUMENTED") return "Verified";
  return "Unverified";
}

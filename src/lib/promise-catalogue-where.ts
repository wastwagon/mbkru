import type { Prisma } from "@prisma/client";

/** Active MP must be linked (public “By MP” / browse-all channel). */
export function campaignPromiseMemberWhere(
  memberSlug?: string,
  constituencySlug?: string,
): Prisma.ParliamentMemberWhereInput {
  const m: Prisma.ParliamentMemberWhereInput = { active: true };
  if (memberSlug) m.slug = memberSlug;
  if (constituencySlug) m.constituency = { slug: constituencySlug };
  return m;
}

/** Government commitments: programme-tagged; optional MP and/or constituency narrow the catalogue. */
export function governmentProgrammeCatalogueWhere(
  memberSlug?: string,
  constituencySlug?: string,
): Prisma.CampaignPromiseWhereInput {
  if (memberSlug || constituencySlug) {
    return {
      isGovernmentProgramme: true,
      member: { is: campaignPromiseMemberWhere(memberSlug, constituencySlug) },
    };
  }
  return {
    isGovernmentProgramme: true,
    OR: [{ memberId: null }, { member: { is: { active: true } } }],
  };
}

/** Title, body, source line, linked manifesto title, MP name/party — one search across both dashboards. */
export function promiseTextSearchWhere(q: string): Prisma.CampaignPromiseWhereInput {
  return {
    OR: [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { sourceLabel: { contains: q, mode: "insensitive" } },
      { manifestoDocument: { is: { title: { contains: q, mode: "insensitive" } } } },
      { member: { is: { active: true, name: { contains: q, mode: "insensitive" } } } },
      { member: { is: { active: true, party: { contains: q, mode: "insensitive" } } } },
    ],
  };
}

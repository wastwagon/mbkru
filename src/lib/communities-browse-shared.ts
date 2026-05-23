/** Shared filters for public community directory (index + region pills). */

import type { Prisma } from "@prisma/client";

export const activeCommunityVisibilityFilter = {
  status: "ACTIVE" as const,
  visibility: { in: ["PUBLIC", "MEMBERS_ONLY"] as ("PUBLIC" | "MEMBERS_ONLY")[] },
};

export type CommunitiesJoinFilter = "all" | "open" | "approval";
export type CommunitiesSort = "name" | "traditional" | "region";

export type CommunitiesBrowseParams = {
  q?: string;
  region?: string;
  join?: CommunitiesJoinFilter;
  sort?: CommunitiesSort;
  verified?: boolean;
};

export function parseCommunitiesJoinFilter(raw: string | undefined): CommunitiesJoinFilter {
  if (raw === "open" || raw === "approval") return raw;
  return "all";
}

export function parseCommunitiesSort(raw: string | undefined): CommunitiesSort {
  if (raw === "traditional" || raw === "region") return raw;
  return "name";
}

export function parseCommunitiesBrowseParams(sp: {
  q?: string;
  region?: string;
  join?: string;
  sort?: string;
  verified?: string;
}): CommunitiesBrowseParams {
  const rawQ = typeof sp.q === "string" ? sp.q : "";
  const region = typeof sp.region === "string" ? sp.region.trim() : "";
  const verifiedRaw = typeof sp.verified === "string" ? sp.verified.trim().toLowerCase() : "";
  return {
    q: rawQ,
    region: region || undefined,
    join: parseCommunitiesJoinFilter(typeof sp.join === "string" ? sp.join : undefined),
    sort: parseCommunitiesSort(typeof sp.sort === "string" ? sp.sort : undefined),
    verified: verifiedRaw === "1" || verifiedRaw === "true" || verifiedRaw === "yes",
  };
}

export function communitiesBrowseHref(opts: CommunitiesBrowseParams) {
  const sp = new URLSearchParams();
  if (opts.q?.trim()) sp.set("q", opts.q.trim());
  if (opts.region?.trim()) sp.set("region", opts.region.trim());
  if (opts.join && opts.join !== "all") sp.set("join", opts.join);
  if (opts.sort && opts.sort !== "name") sp.set("sort", opts.sort);
  if (opts.verified) sp.set("verified", "1");
  const qs = sp.toString();
  return qs ? `/communities?${qs}` : "/communities";
}

export function joinPolicyBrowseFilter(join: CommunitiesJoinFilter): Prisma.CommunityWhereInput {
  if (join === "open") return { joinPolicy: "OPEN" };
  if (join === "approval") return { joinPolicy: "APPROVAL_REQUIRED" };
  return {};
}

export function verifiedQueenMotherBrowseFilter(verified: boolean | undefined): Prisma.CommunityWhereInput {
  if (!verified) return {};
  return {
    memberships: {
      some: {
        state: "ACTIVE",
        role: "QUEEN_MOTHER_VERIFIED",
      },
    },
  };
}

export function communityListOrderBy(sort: CommunitiesSort): Prisma.CommunityOrderByWithRelationInput[] {
  switch (sort) {
    case "traditional":
      return [{ traditionalAreaName: { sort: "asc", nulls: "last" } }, { name: "asc" }];
    case "region":
      return [{ region: { name: "asc" } }, { name: "asc" }];
    default:
      return [{ name: "asc" }];
  }
}

export function joinFilterLabel(join: CommunitiesJoinFilter): string | null {
  if (join === "open") return "Open to join";
  if (join === "approval") return "Approval required";
  return null;
}

export function sortLabel(sort: CommunitiesSort): string {
  switch (sort) {
    case "traditional":
      return "Traditional area A–Z";
    case "region":
      return "Region, then name";
    default:
      return "Name A–Z";
  }
}

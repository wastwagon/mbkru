/** Shared filters for public community directory (index + region pills). */

export const activeCommunityVisibilityFilter = {
  status: "ACTIVE" as const,
  visibility: { in: ["PUBLIC", "MEMBERS_ONLY"] as ("PUBLIC" | "MEMBERS_ONLY")[] },
};

export function communitiesBrowseHref(opts: { q?: string; region?: string }) {
  const sp = new URLSearchParams();
  if (opts.q?.trim()) sp.set("q", opts.q.trim());
  if (opts.region?.trim()) sp.set("region", opts.region.trim());
  const qs = sp.toString();
  return qs ? `/communities?${qs}` : "/communities";
}

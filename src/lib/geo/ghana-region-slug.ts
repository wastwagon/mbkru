/**
 * Maps a Ghana region display title (as in `ghanaRegionsData` / map labels) to the DB `Region.slug`
 * (same convention as `REGIONS_SEED` in prisma/seed.mjs).
 */
export function ghanaRegionSlugFromDisplayName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

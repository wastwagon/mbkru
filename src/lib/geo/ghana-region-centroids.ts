/**
 * Approximate administrative centroids for Ghana regions (slug keys match `prisma/seed.mjs`).
 * Used only to suggest a region when the user picks coordinates on the map — not authoritative boundaries.
 */
export const GHANA_REGION_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  "greater-accra": { lat: 5.6037, lng: -0.187 },
  ashanti: { lat: 6.6885, lng: -1.6244 },
  northern: { lat: 9.4075, lng: -0.8533 },
  western: { lat: 4.896, lng: -1.755 },
  eastern: { lat: 6.4509, lng: -0.7803 },
  volta: { lat: 6.6018, lng: 0.4713 },
  "upper-east": { lat: 10.7853, lng: -0.8514 },
  "upper-west": { lat: 10.0601, lng: -2.5093 },
  central: { lat: 5.1053, lng: -1.2466 },
  bono: { lat: 7.3399, lng: -2.3268 },
  "bono-east": { lat: 7.95, lng: -1.3 },
  ahafo: { lat: 6.75, lng: -2.5 },
  oti: { lat: 7.4004, lng: 0.329 },
  "western-north": { lat: 6.2, lng: -2.35 },
  "north-east": { lat: 10.5276, lng: -0.3713 },
  savannah: { lat: 9.2173, lng: -1.3605 },
};

const R = 6371;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Region slug with smallest great-circle distance to the point. */
export function nearestRegionSlug(lat: number, lng: number): string {
  let bestSlug = "";
  let bestKm = Infinity;
  for (const [slug, c] of Object.entries(GHANA_REGION_CENTROIDS)) {
    const km = haversineKm(lat, lng, c.lat, c.lng);
    if (km < bestKm) {
      bestKm = km;
      bestSlug = slug;
    }
  }
  return bestSlug;
}

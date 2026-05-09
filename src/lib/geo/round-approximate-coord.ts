/** Decimal places for stored/displayed approximate GPS — ~1.1 km at Ghana latitudes (privacy). */
export const APPROXIMATE_LOCATION_DECIMALS = 2;

export function roundApproximateCoord(value: number): number {
  const f = 10 ** APPROXIMATE_LOCATION_DECIMALS;
  return Math.round(value * f) / f;
}

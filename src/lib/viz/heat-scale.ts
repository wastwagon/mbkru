/** Map a numeric value to a 0–1 intensity for choropleth fills (0 = no data). */
export function normalizeHeatIntensity(value: number, max: number): number {
  if (value <= 0 || max <= 0) return 0;
  return Math.min(1, value / max);
}

/** Display helper for table / screen-reader intensity (0–100%). */
export function heatIntensityPercent(value: number, max: number): number {
  return Math.round(normalizeHeatIntensity(value, max) * 100);
}

/**
 * Teal intensity scale for regional heat maps — light base at 0, brand primary at 1.
 * Returns CSS color string.
 */
export function heatFillColor(intensity: number, hasData: boolean): string {
  if (!hasData || intensity <= 0) return "hsl(200, 18%, 88%)";
  const hue = 174;
  const sat = 42 + intensity * 28;
  const light = 78 - intensity * 38;
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}

/** Discrete legend stops for choropleth keys (no data → high). */
export const HEAT_LEGEND_STOPS = [
  { label: "None", color: heatFillColor(0, false) },
  { label: "Low", color: heatFillColor(0.25, true) },
  { label: "Mid", color: heatFillColor(0.55, true) },
  { label: "High", color: heatFillColor(1, true) },
] as const;


/**
 * Map optional 1–5 MP performance rubric averages to a suggested Index C (0–100 editorial scale).
 */
export function suggestIndexCFromRubric(rubric: unknown): number | null {
  if (rubric == null || typeof rubric !== "object" || Array.isArray(rubric)) return null;
  const o = rubric as Record<string, unknown>;
  const scores: number[] = [];
  for (const key of ["accessibility", "responsiveness", "followThrough"] as const) {
    const v = o[key];
    if (typeof v === "number" && Number.isFinite(v) && v >= 1 && v <= 5) scores.push(v);
  }
  if (scores.length === 0) return null;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round((avg / 5) * 100 * 10) / 10;
}

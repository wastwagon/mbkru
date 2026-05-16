/**
 * Ghana People’s Report Card headline blend: Index A (legislative duty) 50%,
 * Index B (constituency accountability) 35%, Index C (citizen experience) 15%.
 * **Storage convention:** A, B, and C are each entered on a **commensurate 0–100 scale**
 * (editors normalise raw B/C scales before publishing). Headline is 0–100.
 */
const W_A = 0.5;
const W_B = 0.35;
const W_C = 0.15;

/** Published weights — keep in sync with `/methodology` and partner JSON. */
export const REPORT_CARD_HEADLINE_WEIGHTS = { a: W_A, b: W_B, c: W_C } as const;

export const headlineFormulaNote =
  "indices on a common 0–100 scale before weighting";

function clampScore100(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

/** Returns null unless all three indices are finite numbers (0–100 clamped). */
export function computeTripleHeadlineScore(
  indexA: number | null | undefined,
  indexB: number | null | undefined,
  indexC: number | null | undefined,
): number | null {
  if (indexA == null || indexB == null || indexC == null) return null;
  const a = clampScore100(Number(indexA));
  const b = clampScore100(Number(indexB));
  const c = clampScore100(Number(indexC));
  const v = W_A * a + W_B * b + W_C * c;
  return Math.round(v * 100) / 100;
}

/**
 * Gate value when the `/api/site-gate` probe fails entirely (network error, timeout, non-200).
 *
 * Pre-launch safety: a broken probe must never silently expose a gated site, so with no
 * last-known value we fail **closed** (show the holding page) in production. Outside
 * production we fail open so local dev without a running gate endpoint stays browsable.
 */
export function gateFallbackOnProbeFailure(
  lastKnown: boolean | null,
  isProduction: boolean,
): boolean {
  if (lastKnown !== null) return lastKnown;
  return isProduction;
}

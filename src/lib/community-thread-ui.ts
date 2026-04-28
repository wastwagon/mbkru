/** Treat `lastActivityAt` as meaningfully newer than `createdAt` (ignore clock skew / tiny deltas). */
export const THREAD_ACTIVITY_BUMP_MS = 60_000;

export function isThreadActivityBumped(createdAt: Date, lastActivityAt: Date): boolean {
  return lastActivityAt.getTime() > createdAt.getTime() + THREAD_ACTIVITY_BUMP_MS;
}

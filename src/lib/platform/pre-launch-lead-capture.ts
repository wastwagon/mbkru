import { getServerPlatformPhase, platformFeatures } from "@/config/platform";

/** Waitlist / early-access panels — only for builds below phase 4 launch polish. */
export function isPreLaunchLeadCaptureEnabled(phase = getServerPlatformPhase()): boolean {
  return !platformFeatures.publicLaunchPolish(phase);
}

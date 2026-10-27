import { getServerPlatformPhase, platformFeatures, type PlatformPhase } from "@/config/platform";

/** Server components: Phase 4 public launch polish (slim marketing chrome). */
export function isPublicLaunchPolishEnabled(phase?: PlatformPhase): boolean {
  return platformFeatures.publicLaunchPolish(phase ?? getServerPlatformPhase());
}

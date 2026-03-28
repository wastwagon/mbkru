import "server-only";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";

/** Phase 2+ — situational alert intake (uses same `CitizenReport` pipeline as Voice). */
export function isSituationalAlertsIntakeEnabled(): boolean {
  return platformFeatures.situationalAlertsSystem(getServerPlatformPhase());
}

import "server-only";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";

export function isMemberAuthEnabled(): boolean {
  return platformFeatures.authentication(getServerPlatformPhase());
}

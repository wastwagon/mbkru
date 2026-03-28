import "server-only";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";

export function isPromisesBrowseEnabled(): boolean {
  return platformFeatures.parliamentTrackerData(getServerPlatformPhase());
}

export function isReportCardPublicEnabled(): boolean {
  return platformFeatures.accountabilityScorecards(getServerPlatformPhase());
}

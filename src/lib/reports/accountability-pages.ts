import "server-only";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";

export function isPromisesBrowseEnabled(): boolean {
  return platformFeatures.parliamentTrackerData(getServerPlatformPhase());
}

export function isReportCardPublicEnabled(): boolean {
  return platformFeatures.accountabilityScorecards(getServerPlatformPhase());
}

export function isLegalEmpowermentPageEnabled(): boolean {
  return platformFeatures.legalEmpowermentDesk(getServerPlatformPhase());
}

export function isTownHallDirectoryPageEnabled(): boolean {
  return platformFeatures.townHallDirectory(getServerPlatformPhase());
}

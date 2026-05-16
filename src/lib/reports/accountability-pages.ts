import "server-only";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";

export function isPromisesBrowseEnabled(): boolean {
  return platformFeatures.parliamentTrackerData(getServerPlatformPhase());
}

export function isReportCardPublicEnabled(): boolean {
  return platformFeatures.publicReportCard(getServerPlatformPhase());
}

/**
 * Ghana methodology “depth” — triple ledger on cycle pages, public dispute window, partner JSON index A/B/C, and
 * optional MP performance rubric on Citizens Voice. Requires Phase 3 (`accountabilityScorecards`).
 */
export function isGhanaReportCardMethodologyPublicEnabled(): boolean {
  return platformFeatures.accountabilityScorecards(getServerPlatformPhase());
}

export function isPublicVoiceStatisticsEnabled(): boolean {
  return platformFeatures.publicVoiceStatistics(getServerPlatformPhase());
}

export function isLegalEmpowermentPageEnabled(): boolean {
  return platformFeatures.legalEmpowermentDesk(getServerPlatformPhase());
}

export function isTownHallDirectoryPageEnabled(): boolean {
  return platformFeatures.townHallDirectory(getServerPlatformPhase());
}

export function isCommunitiesBrowseEnabled(): boolean {
  return platformFeatures.communities(getServerPlatformPhase());
}

export function isWhistleblowerGuidancePageEnabled(): boolean {
  return platformFeatures.whistleblowerGuidance(getServerPlatformPhase());
}

/** Petitions + public Voice “cause” threads (Phase 2+ Voice pillar). */
export function isCivicPetitionsAndPublicCausesEnabled(): boolean {
  return platformFeatures.citizensVoicePlatform(getServerPlatformPhase());
}

/** Public partner data & API terms (`/partner-api`); Phase 2+ only. */
export function isPartnerApiTermsPageEnabled(): boolean {
  return platformFeatures.partnerJsonProgramme(getServerPlatformPhase());
}

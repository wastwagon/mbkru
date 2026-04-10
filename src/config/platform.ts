/**
 * Platform phase and feature flags for MBKRU delivery.
 * Phase 1 = marketing + CMS + lead capture (no auth, no complaints DB).
 * Phase 2+ = gated in code and via NEXT_PUBLIC_PLATFORM_PHASE at build time.
 *
 * @see docs/ARCHITECTURE.md
 */

export type PlatformPhase = 1 | 2 | 3;

function parsePhase(raw: string | undefined): PlatformPhase {
  const n = Number.parseInt(raw ?? "1", 10);
  if (n === 2 || n === 3) return n;
  return 1;
}

/** Server or build: optional override without exposing to client bundle. */
export function getServerPlatformPhase(): PlatformPhase {
  if (process.env.PLATFORM_PHASE !== undefined) {
    return parsePhase(process.env.PLATFORM_PHASE);
  }
  return parsePhase(process.env.NEXT_PUBLIC_PLATFORM_PHASE);
}

/**
 * Client-visible phase — must match build-time NEXT_PUBLIC_PLATFORM_PHASE.
 * Use only in Client Components or after passing from a Server Component.
 */
export function getPublicPlatformPhase(): PlatformPhase {
  return parsePhase(process.env.NEXT_PUBLIC_PLATFORM_PHASE);
}

/**
 * Feature gates for Phase 2+ work. Keep conservative: default false until phase matches.
 */
export const platformFeatures = {
  /** User accounts, sessions (Phase 2+) */
  authentication: (phase: PlatformPhase) => phase >= 2,

  /** MBKRU Voice — complaints, geo workflows (Phase 2+) */
  citizensVoicePlatform: (phase: PlatformPhase) => phase >= 2,

  /** Situational alerts submission / routing (Phase 2–3) */
  situationalAlertsSystem: (phase: PlatformPhase) => phase >= 2,

  /** MP / minister data pipelines, scorecards (Phase 2–3) */
  parliamentTrackerData: (phase: PlatformPhase) => phase >= 2,

  /**
   * Published People's Report Card (public HTML + partner JSON). Phase 2+ aligns with roadmap Year 1 publication.
   * Election-window hardening (observation flows) remains Phase 3 via `electionObservatory`.
   */
  publicReportCard: (phase: PlatformPhase) => phase >= 2,

  /** Reserved: pre-election flagship messaging / future scorecard-only gates (Phase 3). */
  accountabilityScorecards: (phase: PlatformPhase) => phase >= 3,

  /** Aggregate, non-identifying MBKRU Voice statistics on the public site. */
  publicVoiceStatistics: (phase: PlatformPhase) => phase >= 2,

  /** Legal empowerment desk content + referrals (Phase 2+) */
  legalEmpowermentDesk: (phase: PlatformPhase) => phase >= 2,

  /** Town halls / forums directory and RSVP (Phase 2+) */
  townHallDirectory: (phase: PlatformPhase) => phase >= 2,

  /** Election observation–style situational reporting UI (Phase 3 hard launch) */
  electionObservatory: (phase: PlatformPhase) => phase >= 3,

  /** Logged-in member dashboard (MBKRU Voice) */
  memberDashboard: (phase: PlatformPhase) => phase >= 2,

  /** Queen Mothers / traditional-area community spaces (Phase 2+) */
  communities: (phase: PlatformPhase) => phase >= 2,

  /** Party manifesto registry + government-commitment tagging (Phase 2+) */
  manifestoRegistry: (phase: PlatformPhase) => phase >= 2,

  /** Whistleblower guidance page (Phase 2+; complements MBKRU Voice) */
  whistleblowerGuidance: (phase: PlatformPhase) => phase >= 2,
} as const;

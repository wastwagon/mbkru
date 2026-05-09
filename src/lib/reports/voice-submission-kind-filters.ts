import type { CitizenReportKind } from "@prisma/client";

/** Allowed filters on `/report-card` Voice submissions (matches enum subset). Shared with client filter UI. */
export const VOICE_SUBMISSION_KIND_FILTERS: readonly CitizenReportKind[] = [
  "VOICE",
  "MP_PERFORMANCE",
  "GOVERNMENT_PERFORMANCE",
  "SITUATIONAL_ALERT",
  "ELECTION_OBSERVATION",
] as const;

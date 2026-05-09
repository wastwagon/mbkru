/**
 * Public accountability copy aligns published PRC cycles to Ghana’s four-year Parliament window.
 * Dates are calendar shorthand for the sitting whose MPs were elected in the prior general election
 * (e.g. Dec 2024) and face the next scheduled poll (per EC calendar — currently referenced as 2028 in programme copy).
 */
export const GHANA_ACCOUNTABILITY_PARLIAMENT_TERM = {
  /** Start year used in citizen-facing “stacking” copy for the current term. */
  startYear: 2024,
  /** General election year referenced alongside pre-election scorecards in programme materials. */
  generalElectionYear: 2028,
} as const;

export function ghanaParliamentTermShortLabel(): string {
  return `${GHANA_ACCOUNTABILITY_PARLIAMENT_TERM.startYear}–${GHANA_ACCOUNTABILITY_PARLIAMENT_TERM.generalElectionYear}`;
}

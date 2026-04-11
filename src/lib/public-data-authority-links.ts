/**
 * Authoritative Ghana institutions commonly referenced in MBKRU accountability and Voice flows.
 * Use for stakeholder-facing copy; detailed file-level provenance remains on `/data-sources`.
 * Editorial note (site): April 2026 — verify URLs before major external communications.
 */
export const ghanaPublicDataAuthorityLinks = [
  {
    label: "Ghana Statistical Service",
    href: "https://www.statsghana.gov.gh/",
    scope: "Official statistics, census, and projections",
  },
  {
    label: "Parliament of Ghana",
    href: "https://www.parliament.gh/",
    scope: "MP roster and parliamentary business",
  },
  {
    label: "Electoral Commission of Ghana",
    href: "https://ec.gov.gh/",
    scope: "Election administration and official results",
  },
  {
    label: "CHRAJ",
    href: "https://chraj.gov.gh/",
    scope: "Human rights and administrative justice guidance",
  },
] as const;

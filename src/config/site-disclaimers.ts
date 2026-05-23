/** Central copy for public trust / limitation notices (counsel may revise Terms; these are UX summaries). */

export const siteDisclaimerBanner = {
  /** Bump when banner copy changes so returning visitors see the updated notice once. */
  version: 1,
  storageKey: "mbkru-site-disclaimer-banner-dismissed-v",
  ariaLabel: "Site notice",
  body:
    "MBKRU is an independent civic accountability programme — not a government agency, court, or the Electoral Commission. Scores and citizen reports are editorial or triage tools, not legal findings.",
  methodologyLabel: "Methodology",
  termsLabel: "Terms",
} as const;

export const accountabilityDisclaimers = {
  voiceSubmissions: {
    title: "About listed Voice submissions",
    body:
      "Titles and public threads reflect staff moderation and programme rules. They are not court filings, regulator decisions, or official election challenges. Do not use this list for emergency response — contact local emergency services when safety is at risk.",
  },
  reportCardScores: {
    title: "About People's Report Card scores",
    body:
      "Cycle scores and narratives are explanatory editorial assessments with published methodology. They complement — and never replace — CHRAJ, the Auditor-General, the Electoral Commission, or the courts.",
  },
  reportCardCycle: {
    title: "How to read this cycle",
    body:
      "Each published row is a dated snapshot for accountability dialogue, not a statutory audit or legal finding. Material corrections follow our methodology and dispute window where published.",
  },
} as const;

export type AccountabilityDisclaimerVariant = keyof typeof accountabilityDisclaimers;

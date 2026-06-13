/** Central copy for public trust / limitation notices (counsel may revise Terms; these are UX summaries). */

export const siteDisclaimerBanner = {
  /** Bump when banner copy changes so returning visitors see the updated notice once. */
  version: 3,
  storageKey: "mbkru-site-disclaimer-banner-dismissed-v",
  ariaLabel: "Site notice",
  body:
    "MBKRU is an independent civic accountability programme — not a government agency, court, or the Electoral Commission. Scores and citizen reports are editorial or triage tools, not legal findings. When you share a report, stick to facts you can stand behind and avoid threats or knowingly false claims.",
  methodologyLabel: "Methodology",
  termsLabel: "Terms",
} as const;

/** Persistent one-line trust notice above the header — always visible (not dismissible). */
export const siteTrustNotice = {
  ariaLabel: "Independent programme notice",
  body: "Independent civic programme — not government, court, or the Electoral Commission.",
  methodologyLabel: "Methodology",
  termsLabel: "Terms",
} as const;

/** Footer backstop when the dismissible banner has been closed. */
export const footerTrustLine = {
  body: "MBKRU is an independent, non-partisan civic accountability programme — not a government agency, court, or regulator.",
  emergencyNote: "For emergencies, contact local emergency services.",
  methodologyLabel: "Methodology",
  termsLabel: "Terms",
} as const;

/** One-line trust copy for the homepage body (banner uses the fuller `body`). */
export const homepageTrustLine = {
  body: "MBKRU is an independent, non-partisan civic programme — not a government agency, court, or regulator.",
  emergencyNote: "For emergencies, contact local emergency services.",
  methodologyLabel: "How we work",
} as const;

/** Reused wherever users submit or browse Voice reports. */
export const voiceSharingMindfulNote =
  "Be mindful of what you share: describe what you observed, avoid threats or knowingly false claims, and include others’ personal details only when necessary for accountability.";

export const accountabilityDisclaimers = {
  voiceSubmissions: {
    title: "About listed Voice submissions",
    body:
      "Titles and public threads reflect staff moderation and programme rules. They are not court filings, regulator decisions, or official election challenges. Do not use this list for emergency response — contact local emergency services when safety is at risk.",
    sharingNote: voiceSharingMindfulNote,
  },
  voiceSubmit: {
    title: "Before you submit",
    body:
      "Your report may be reviewed by staff and, where policy allows, summarized in public listings or threads. Take a moment to check accuracy and tone before sending.",
    sharingNote: voiceSharingMindfulNote,
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
  promiseCatalogue: {
    title: "About pledge catalogue rows",
    body:
      "Commitment titles, statuses, and MP sheets are editorial catalogue entries with cited sources where published — not Hansard transcripts, Electoral Commission filings, or court judgments.",
  },
  parliamentHub: {
    title: "About this accountability hub",
    body:
      "Roster names, Voice intakes, and catalogue links are programme tools for civic dialogue. They complement — and never replace — parliament.gh, CHRAJ, the Auditor-General, the Electoral Commission, or the courts.",
  },
  civicParticipation: {
    title: "About petitions & civic campaigns",
    body:
      "Petitions and signature counts show breadth of concern on MBKRU — not a formal government petition process, regulator action, or MBKRU legal finding.",
  },
  electionObservation: {
    title: "About election reporting",
    body:
      "Election-window submissions are moderated triage for civic visibility — not Electoral Commission filings, court challenges, or official result declarations.",
  },
  situationalAlerts: {
    title: "About situational alerts",
    body:
      "Shared alerts are staff-reviewed programme submissions — not emergency dispatch. Contact local emergency services when safety is at risk.",
  },
} as const;

export type AccountabilityDisclaimerVariant = keyof typeof accountabilityDisclaimers;

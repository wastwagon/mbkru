/**
 * Accountability promise catalogue — one `CampaignPromise` dataset, three public surfaces.
 *
 * Phase 1 (here): shared routes, user-facing copy, and pathname rules so nav, account,
 * breadcrumbs, and marketing blocks stay aligned.
 * Phase 2+: add optional analytics IDs or locale-specific copy without changing hrefs.
 */

export const ACCOUNTABILITY_CATALOGUE_ROUTES = {
  governmentCommitments: "/government-commitments",
  browseAllPromises: "/promises/browse",
  promisesByMp: "/promises",
} as const;

/** Short labels for dense nav (header dropdown). */
export const accountabilityCatalogueNavShort = {
  government: "Commitments",
  browseAll: "Browse all",
  byMp: "By MP",
} as const;

/** Sidebar / account — slightly fuller than header. */
export const accountabilityCatalogueNavMedium = {
  government: "Government commitments",
  browseAll: "Browse all commitments",
  byMp: "Commitments by MP",
} as const;

/** Homepage embedded previews — H2 matches full routes; body explains “live” scope. */
export const accountabilityHomePreviewCopy = {
  governmentHeading: `${accountabilityCatalogueNavMedium.government} — live`,
  governmentLead:
    "Programme- and executive-tagged pledges only. Same underlying rows as MP pledge sheets when a member is linked — one status everywhere.",
  /** Shown above live promise tables on the homepage and government commitments page. */
  promiseCardSurfaceExplainer:
    "Each card shows a brief summary on the face, citation chips (party · year, manifesto chapter when catalogued), optional page reference, and a link to the official PDF; expand for verification notes and full source buttons.",
  browseHeading: `${accountabilityCatalogueNavMedium.browseAll} — live`,
  browseLead:
    "Full searchable catalogue for sitting MPs — identical data to the dedicated browse page and public export.",
} as const;

/**
 * Metadata, methodology, hub pages, partner copy, and admin-adjacent UI — consistent “catalogue” language.
 */
export const accountabilityProse = {
  governmentCommitmentsMetaDescription:
    "Tracked commitments tagged as government programmes or executive pledges — published beside MP and minister rows in the same catalogue.",
  methodologyPromiseTrackingBody:
    "Each catalogue row is logged with a title, optional narrative, and a source label (e.g. manifesto section or speech). Status moves through tracking, in progress, fulfilled, broken, or deferred — always tied back to evidence or a transparent rationale for deferral.",
  parliamentTrackerMetaDescription:
    "People's Report Card, public commitment catalogue, Accountability Scorecards, citizen petition mechanism.",
  parliamentPageHeaderDescription:
    "People's Report Cards, public commitment catalogue, and Accountability Scorecards.",
  partnerApiPageIntro:
    "Read-only endpoints for MPs, the public commitment catalogue, the People's Report Card, and research exports. This page is a public summary of how we expect partners to use them — not a substitute for legal advice or a signed agreement.",
  statsStripBrowseSubtitle: `Use ${accountabilityCatalogueNavMedium.browseAll} for live filters; the roster below lists every active MP in the catalogue (including members with no catalogue rows yet).`,
  statsStripGovernmentKpiFootnote: `Also on ${accountabilityCatalogueNavMedium.government}`,
  hubBrowseCardTitle: accountabilityCatalogueNavMedium.browseAll,
  hubBrowseCardDescription:
    "Search, filter, and export the full dataset — same filters as the public API and the government commitments view.",
  pillarHomeBullet: "Public commitment catalogue",
  trackerSignupUpdates:
    "Receive updates on People's Report Cards, Accountability Scorecards, and the public commitment catalogue.",
  pillarDRealtimeBullet:
    "Tracked commitments versus delivery — sources and status in one catalogue.",
  mpPledgeSheetLink: "View pledge sheet",
  livePlatformStripPhase1:
    "MBKRU Voice, the public commitment catalogue, report cards, and pillar pages switch on when this site is upgraded to Phase 2 or higher — see the roadmap below.",
  partnerApiMpsCellLinkLabel: "commitment catalogue",
  apiPromisesTableRow:
    "Tracked commitments via GET /api/promises with optional filters; JSON responses are capped — use CSV for full exports.",
  reportCardStatsStripSubtitle: `Cross-links the public commitment catalogue, MPs, and published scorecard rows — same aggregates as ${accountabilityCatalogueNavMedium.browseAll}.`,
  /** `/methodology` — aligns page meta and in-page H2 with public catalogue language. */
  methodologyPageMetaDescription:
    "How MBKRU approaches tracked commitments, the public catalogue, and score-style accountability — independent, transparent, and adapted for Ghana.",
  methodologyCatalogueSectionHeading: "Tracked commitments",
  /** Claims section — avoids “promises” as a standalone product noun. */
  methodologyClaimsBulletStrong: "Catalogue commitments",
  /** `/promises/[slug]` — back link to the MP roster index. */
  mpRosterBackLink: "← MP roster",
  adminParliamentIntro:
    "Import MPs / ministers from CSV, then attach tracked commitment records per person. Public read APIs (Phase 2+ build):",
  adminManifestosIntro:
    "Register party manifesto documents so catalogue rows can cite them. Public list:",
  adminAddPromiseHeading: "Add catalogue row",
  memberSheetMetaSuffix: " — tracked commitments we publish.",
  adminDashboardParliamentCard: "CSV import for MPs/ministers and tracked commitment records.",
  /** Admin `/admin/parliament` — aligns with public “catalogue” language (Prisma model remains `CampaignPromise`). */
  adminParliamentSectionTitle: "Parliament & catalogue",
  adminParliamentListBackLink: "← Parliament & catalogue",
  browseFiltersEmptyResult: "No catalogue rows match. Try clearing search or filters.",
  browseFiltersEmptyGovernmentMode:
    "No government-programme commitments match. Try clearing search or filters.",
  promisesIndexEmptyState:
    "No tracked commitments are published yet. Check back after the team adds rows in admin.",
  adminCreateCatalogueRowButton: "Save catalogue row",
  adminMemberCatalogueSectionHeading: "Catalogue rows",
  adminCreateGovernmentTagHint:
    "When checked, the row appears on the public Government commitments page. You can change this later under Save source & verification for each row.",
  /** Browse `/promises/browse` — default “all” option in the manifesto slice control. */
  browseCatalogueSelectAllTracked: "All tracked commitments",
  /** Helper under constituency filter — same roster as imports; “catalogue” not “every utterance”. */
  browseConstituencyFilterHelp:
    "Uses the same constituency and MP records as parliament.gh imports — filter catalogue rows for whoever holds that seat in this database.",
  /** Admin member detail — empty list under catalogue rows. */
  adminMemberCatalogueEmpty: "No catalogue rows yet.",
  /** Stats strip KPI — sitting MPs with at least one published catalogue row in the current slice. */
  statsStripMpsWithCatalogueRowsLabel: "MPs w/ catalogue rows",
} as const;

export type AccountabilityCatalogueCard = {
  href: string;
  title: string;
  description: string;
};

/**
 * Member account “Public accountability” — three equal destinations (no DB fields;
 * same pages as the marketing homepage blocks).
 */
export function getAccountabilityCatalogueCards(): AccountabilityCatalogueCard[] {
  return [
    {
      href: ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments,
      title: accountabilityCatalogueNavMedium.government,
      description:
        "National programme and executive-tagged pledges only. Same underlying records as MP sheets when a row is linked to a sitting member.",
    },
    {
      href: ACCOUNTABILITY_CATALOGUE_ROUTES.browseAllPromises,
      title: accountabilityCatalogueNavMedium.browseAll,
      description:
        "Full searchable catalogue for active parliamentarians — filters, status, and CSV export match the public API.",
    },
    {
      href: ACCOUNTABILITY_CATALOGUE_ROUTES.promisesByMp,
      title: accountabilityCatalogueNavMedium.byMp,
      description:
        "Pick a member from the roster to open their pledge sheet with sources and status.",
    },
  ];
}

/** Participate hub tiles — titles match account; bodies stay short for scanability. */
export function getAccountabilityParticipateHubTiles(): {
  government: { href: string; title: string; body: string };
  browse: { href: string; title: string; body: string };
  byMp: { href: string; title: string; body: string };
} {
  const cards = getAccountabilityCatalogueCards();
  return {
    government: {
      href: cards[0].href,
      title: cards[0].title,
      body: "Programme- and executive-tagged pledges — the government slice of the same dataset as MP sheets.",
    },
    browse: {
      href: cards[1].href,
      title: cards[1].title,
      body: "Search and filter the full catalogue for sitting MPs — same rows as the public JSON API.",
    },
    byMp: {
      href: cards[2].href,
      title: cards[2].title,
      body: "Start from the roster, then open each parliamentarian’s pledge sheet with sources and status.",
    },
  };
}

/** `/promises` roster or `/promises/[slug]` — not the browse subtree. */
export function pathnameIsPromisesByMpAccountability(pathname: string): boolean {
  if (pathname === ACCOUNTABILITY_CATALOGUE_ROUTES.promisesByMp) return true;
  if (pathname.startsWith(`${ACCOUNTABILITY_CATALOGUE_ROUTES.browseAllPromises}`)) return false;
  if (pathname.startsWith(`${ACCOUNTABILITY_CATALOGUE_ROUTES.promisesByMp}/`)) return true;
  return false;
}

export function pathnameIsPromisesBrowseAccountability(pathname: string): boolean {
  return (
    pathname === ACCOUNTABILITY_CATALOGUE_ROUTES.browseAllPromises ||
    pathname.startsWith(`${ACCOUNTABILITY_CATALOGUE_ROUTES.browseAllPromises}/`)
  );
}

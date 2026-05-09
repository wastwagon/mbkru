/**
 * Accountability promise catalogue — one `CampaignPromise` dataset, three public surfaces.
 *
 * Phase 1 (here): shared routes, user-facing copy, and pathname rules so nav, account,
 * breadcrumbs, and marketing blocks stay aligned.
 * Phase 2+: add optional analytics IDs or locale-specific copy without changing hrefs.
 *
 * Government commitments are a URL preset on the single catalogue dashboard — not a separate app surface.
 */

const COMMITMENTS_CATALOGUE_PATH = "/promises/browse";

export const ACCOUNTABILITY_CATALOGUE_ROUTES = {
  browseAllPromises: COMMITMENTS_CATALOGUE_PATH,
  /** Query preset — same dashboard; editorial government-programme lens only. */
  governmentCommitments: `${COMMITMENTS_CATALOGUE_PATH}?governmentOnly=1`,
  promisesByMp: "/promises",
} as const;

/** Glossary for `/methodology#key-terms` — one place for public-facing word choices. */
export const methodologyKeyTerms: readonly { term: string; body: string }[] = [
  {
    term: "Commitment (catalogue row)",
    body: "A single editorial record: title, optional narrative, source label, and status. The same record appears in the commitment catalogue, the government-programme lens when tagged, and on a member’s sheet if linked.",
  },
  {
    term: "Government programme (tag)",
    body: "Editorial flag for rows that surface in the government-programme lens on the commitment catalogue. It is not a government seal of approval — it marks programme- or executive-typed items we follow in the same catalogue.",
  },
  {
    term: "Parliamentarians tracker",
    body: "Main navigation label for the Accountability & Electoral Watch hub at /parliament-tracker — roster, live stats, and links into the commitment catalogue. MP pledge sheets and roster browsing live under /promises and share the same active nav state.",
  },
  {
    term: "Commitment catalogue (Browse all)",
    body: "The single filterable dashboard at /promises/browse — default sitting MPs, optional government-programme lens, filters, CSV, and matching public JSON.",
  },
  {
    term: "People's Report Card (published cycle)",
    body: "A dated editorial release under Report card with narratives and scores when MBKRU publishes that batch. Years label publication windows — evidence can stack across Ghana's four-year Parliament toward informed electoral choices; not every methodology mention implies a scored cycle is already live.",
  },
  {
    term: "Accountability scorecards (programme language)",
    body: "Pre-election and engagement language used in the roadmap and methodology, including the 90-day run-up. Distinct in UI from a published PRC year until a cycle is released under Report card.",
  },
] as const;

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
  /** Homepage live sections only — avoids repeating the long explainer above two embeds. */
  promiseCardSurfaceExplainerShort:
    "Each card shows a short summary and citation line on the face; expand the card for full text, verification notes, and source buttons. Open the full tracker page below for the complete how-to read.",
  browseHeading: `${accountabilityCatalogueNavMedium.browseAll} — live`,
  browseLead:
    "Full searchable catalogue for sitting MPs — identical data to the dedicated browse page and public export.",
  /** Homepage `PromisesBrowseHomePreview` in teaser mode — one compact block next to the full government embed. */
  browseTeaserLead:
    "A short live sample of the first catalogue rows. Open the full page for search, filters, and the public CSV export.",
  /**
   * Homepage only — avoids two identical KPI strips back-to-back. Shown instead of PromiseTrackerStatsStrip
   * in the Browse-all teaser blocks when Government commitments teaser already renders the catalogue dashboard.
   */
  browseHomeOmitDuplicateKpisLead:
    "The KPI dashboard appears once above under the government-programme teaser. This block uses the full-catalogue slice — headline totals differ. Open the catalogue page for the matching snapshot, filters, and export.",
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
  /** Shown on live tracker snapshot — explains editorial DB scope vs. manifesto PDFs. */
  statsStripDatabaseScopeNote:
    "Headline totals are editorial rows in this database, not a rights-cleared full PDF dump. A larger NDC 2024 theme set can be loaded by operators when running the database seed; the live site can also add rows in admin at any time.",
  statsStripDatabaseScopeDataSourcesLink: "Data sources",
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
    "MBKRU Voice, the public commitment catalogue, report cards, and full engagement tools open as the programme enables them — see the pathway section on this page.",
  partnerApiMpsCellLinkLabel: "commitment catalogue",
  apiPromisesTableRow:
    "Tracked commitments via GET /api/promises with optional filters; JSON responses are capped — use CSV for full exports.",
  /** `/report-card` index — single cross-link block; avoids duplicating the catalogue KPI strip shown on home and browse pages. */
  reportCardCatalogueBridgeTitle: "Tracked commitments (elsewhere on the site)",
  reportCardCatalogueBridgeBody:
    "This page is for published People's Report Card cycles only. The pledge catalogue uses its own dashboards — we do not repeat them here.",
  /** `/methodology#key-terms` — H2. */
  methodologyKeyTermsSectionHeading: "Key public terms",
  methodologyKeyTermsSectionIntro:
    "These phrases appear in the menu, on data exports, and in the catalogue — use this list to read them consistently.",
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
  /** Homepage teaser (no on-page filters) — nudge to `/promises/browse`. */
  browseHomeTeaserCaption: (shown: number, total: number) =>
    `Showing ${shown} of ${total} rows from this results page. `,
  browseHomeTeaserCta: "Learn more — full list & tools",
  governmentHomeTeaserCta: "Learn more — full list & tools",
  /** Helper under constituency filter — same roster as imports; “catalogue” not “every utterance”. */
  browseConstituencyFilterHelp:
    "Uses the same constituency and MP records as parliament.gh imports — filter catalogue rows for whoever holds that seat in this database.",
  /** Admin member detail — empty list under catalogue rows. */
  adminMemberCatalogueEmpty: "No catalogue rows yet.",
  /** Stats strip KPI — sitting MPs with at least one published catalogue row in the current slice. */
  statsStripMpsWithCatalogueRowsLabel: "MPs w/ catalogue rows",
  /** Dark strip eyebrow — not a “report card” dashboard; distinguishes pledge catalogue KPIs from PRC. */
  statsStripEyebrow: "Commitment catalogue snapshot",
  /** Line before inline link to `/report-card` on the catalogue KPI strip (when public PRC is enabled). */
  statsStripPrcDisambiguation:
    "Not the People's Report Card — these numbers count catalogue pledge rows (same filters as the list). Published MP scorecards:",
  /** `PageHeader` and `<title>` on `/parliament-tracker` — same label as the Accountability menu. */
  parliamentPageDocumentTitle: "Parliamentarians tracker",
  /**
   * Legacy hub hero sentence when the H1 was the long programme name.
   * Kept for any tests or off-site copy; the hub now uses `parliamentPageDocumentTitle` as the visible H1.
   */
  parliamentPageHeaderMenuAlias: "In the main site menu, this page is called Parliamentarians tracker. ",
  /** Hub PageHeader: subtitle after the H1, naming the full programme. */
  parliamentPageHeaderFullProgrammeLead: "Accountability & Electoral Watch",
  parliamentTrackerHubOrientation:
    "Start from this hub for the MP roster, the People's Report Card entry point, and the commitment catalogue. Open Browse all commitments from here to search the full catalogue — switch the on-page lens to government-programme rows only when you need that slice.",
  /** Blurb for the pre-election scorecards tool card (links to /methodology). */
  hubAccountabilityScorecardsCardDescription:
    "The programme’s pre-election accountability scorecard roll-out (90 days before general elections), described in methodology. This is not the same as the published People's Report Card cycles — use People's Report Card in the Accountability menu for those.",
  /** Tools grid intro line — "promises" avoided as a standalone public noun. */
  parliamentTrackerToolsSubline: "Data-driven tools to connect documented commitments, report-style views, and where we publish cycles.",
  /** /report-card index — one line so visitors don't confuse PRC with pre-election scorecards. */
  reportCardIndexDisambiguation:
    "The People's Report Card (this section) is where we publish report-card cycles when they exist. Pre-election \"Accountability scorecards\" as a named programme and methodology live on Accountability methodology, not in place of the cycles list below.",
  /** Roster list — count suffix next to each MP (same language as the By MP index). */
  mpRosterListCountLabelSingular: "catalogue row",
  mpRosterListCountLabelPlural: "catalogue rows",
} as const;

export type AccountabilityCatalogueCard = {
  href: string;
  title: string;
  description: string;
};

/**
 * Member account “Public accountability” — catalogue + roster (no duplicate government vs browse URLs).
 */
export function getAccountabilityCatalogueCards(): AccountabilityCatalogueCard[] {
  return [
    {
      href: ACCOUNTABILITY_CATALOGUE_ROUTES.browseAllPromises,
      title: "Commitment catalogue",
      description:
        "One dashboard — search and filter tracked pledges for sitting MPs (default), export CSV / JSON, or switch to the government-programme editorial lens.",
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
  catalogue: { href: string; title: string; body: string };
  byMp: { href: string; title: string; body: string };
} {
  const cards = getAccountabilityCatalogueCards();
  return {
    catalogue: {
      href: cards[0].href,
      title: cards[0].title,
      body: cards[0].description,
    },
    byMp: {
      href: cards[1].href,
      title: cards[1].title,
      body: cards[1].description,
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

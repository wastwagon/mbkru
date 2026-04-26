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

/** Glossary for `/methodology#key-terms` — one place for public-facing word choices. */
export const methodologyKeyTerms: readonly { term: string; body: string }[] = [
  {
    term: "Commitment (catalogue row)",
    body: "A single editorial record: title, optional narrative, source label, and status. The same record appears in Browse all, Government commitments (when tagged), and on a member’s sheet if linked.",
  },
  {
    term: "Government programme (tag)",
    body: "Editorial flag for rows that also appear on the Government commitments page. It is not a government seal of approval — it marks programme- or executive-typed items we follow in the same catalogue.",
  },
  {
    term: "Parliament tracker",
    body: "The name we use in the main navigation for the Accountability & Electoral Watch hub — roster, tool links, and how the programme fits together.",
  },
  {
    term: "Browse all commitments",
    body: "The wide, filterable view of the catalogue (default: sitting MPs). Same underlying rows as other surfaces; filters and exports mirror the public JSON/CSV with the same meaning.",
  },
  {
    term: "People's Report Card (published cycle)",
    body: "A published year under the Report card menu with narrative and scores when MBKRU has released a cycle. Not every methodology concept on this page implies a live scored year is already published.",
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
    "A short live preview of the first catalogue rows. Open the full page for search, filters, and the public CSV export.",
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
    `Previewing ${shown} of ${total} in this first page of results. `,
  browseHomeTeaserCta: "Open Browse all for live filters, search, and CSV export.",
  /** Helper under constituency filter — same roster as imports; “catalogue” not “every utterance”. */
  browseConstituencyFilterHelp:
    "Uses the same constituency and MP records as parliament.gh imports — filter catalogue rows for whoever holds that seat in this database.",
  /** Admin member detail — empty list under catalogue rows. */
  adminMemberCatalogueEmpty: "No catalogue rows yet.",
  /** Stats strip KPI — sitting MPs with at least one published catalogue row in the current slice. */
  statsStripMpsWithCatalogueRowsLabel: "MPs w/ catalogue rows",
  /** `PageHeader` and `<title>` on `/parliament-tracker` — same label as the main site menu. */
  parliamentPageDocumentTitle: "Parliament tracker",
  /**
   * Legacy hub hero sentence when the H1 was the long programme name.
   * Kept for any tests or off-site copy; the hub now uses `parliamentPageDocumentTitle` as the visible H1.
   */
  parliamentPageHeaderMenuAlias: "In the main site menu, this page is called Parliament tracker. ",
  /** Hub PageHeader: subtitle after the H1, naming the full programme. */
  parliamentPageHeaderFullProgrammeLead: "Accountability & Electoral Watch",
  parliamentTrackerHubOrientation:
    "Start from this hub for the MP roster, the People's Report Card entry point, and catalogue tools. For programme- and executive-tagged rows only, use Government commitments; for the full filterable list tied to sitting MPs, use Browse all commitments.",
  /** Blurb for the pre-election scorecards tool card (links to /methodology). */
  hubAccountabilityScorecardsCardDescription:
    "The programme’s pre-election accountability scorecard roll-out (90 days before general elections), described in methodology. This is not the same as the published People's Report Card cycles — use Report card in the menu for those.",
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

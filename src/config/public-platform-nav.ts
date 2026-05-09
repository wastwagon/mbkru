/**
 * Public site navigation — single source of truth for header dropdowns, footer “Our Platform”,
 * footer “Useful links” + legal row, About / homepage quick links, **`sitemap.ts`** static paths,
 * and **`/account`** sidebar explore links.
 * Promise catalogue hrefs and medium labels come from **`accountability-catalogue-destinations.ts`**
 * so nav, account tiles, and metadata stay aligned.
 *
 * Keeps `NEXT_PUBLIC_PLATFORM_PHASE` / feature gates aligned everywhere users discover tools
 * (see `docs/ARCHITECTURE.md` §5).
 *
 * Import from client or server components; pass `getPublicPlatformPhase()` or
 * `getServerPlatformPhase()` so server-rendered HTML matches client hydration.
 */

import { ACCOUNTABILITY_CATALOGUE_ROUTES } from "./accountability-catalogue-destinations";
import type { PlatformPhase } from "./platform";
import { platformFeatures } from "./platform";

export type PublicNavLink = {
  href: string;
  label: string;
  /** When set, treat any path under this prefix as active (header). Use an array if multiple roots apply (e.g. hub + MP routes). */
  activeWhenPathStartsWith?: string | string[];
  /** With prefix matching from `href`, suppress active state under this path (e.g. catalogue browse vs MP slug routes). */
  activeExcludePathStartsWith?: string;
  /** When set, every key must match the current URL search string for the item to appear active. */
  activeQuery?: Record<string, string>;
};

/** Participate — citizen voice, engagement, and related channels (header group). */
export function getParticipateNavLinks(phase: PlatformPhase): PublicNavLink[] {
  const links: PublicNavLink[] = [
    { href: "/citizens-voice", label: "Voice" },
    { href: "/situational-alerts", label: "Engagement" },
  ];
  if (platformFeatures.citizensVoicePlatform(phase)) {
    links.push({ href: "/petitions", label: "Petitions", activeWhenPathStartsWith: "/petitions" });
    links.push({
      href: "/citizens-voice/causes",
      label: "Public causes",
      activeWhenPathStartsWith: "/citizens-voice/causes",
    });
  }
  if (platformFeatures.citizensVoicePlatform(phase) && platformFeatures.publicVoiceStatistics(phase)) {
    links.push({ href: "/transparency", label: "Voice stats" });
  }
  if (platformFeatures.electionObservatory(phase)) {
    links.push({
      href: "/election-observation",
      label: "Election",
      activeWhenPathStartsWith: "/election-observation",
    });
  }
  if (platformFeatures.communities(phase)) {
    links.push({ href: "/communities", label: "Communities" });
  }
  return links;
}

/**
 * Accountability — three citizen-facing pillars (government lens, parliamentarians hub & MP routes, published PRC).
 * Full catalogue (`/promises/browse`) remains reachable from the parliamentarians hub and deep links; it is not a fourth top-nav label.
 */
export function getAccountabilityNavLinks(phase: PlatformPhase): PublicNavLink[] {
  const links: PublicNavLink[] = [];

  if (platformFeatures.parliamentTrackerData(phase)) {
    links.push({
      href: ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments,
      label: "Government commitment tracker",
      activeWhenPathStartsWith: "/promises/browse",
      activeQuery: { governmentOnly: "1" },
    });
  }

  links.push({
    href: "/parliament-tracker",
    label: "Parliamentarians tracker",
    ...(platformFeatures.parliamentTrackerData(phase)
      ? {
          activeWhenPathStartsWith: ["/parliament-tracker", "/promises"],
          activeExcludePathStartsWith: "/promises/browse",
        }
      : { activeWhenPathStartsWith: "/parliament-tracker" }),
  });

  if (platformFeatures.publicReportCard(phase)) {
    links.push({
      href: "/report-card",
      label: "People's Report Card",
      activeWhenPathStartsWith: "/report-card",
    });
  }

  return links;
}

/** Guidance — legal, forums, whistleblowing (header group or flat links). */
export function getGuidanceNavLinks(phase: PlatformPhase): PublicNavLink[] {
  const links: PublicNavLink[] = [];
  if (platformFeatures.legalEmpowermentDesk(phase)) {
    links.push({ href: "/legal-empowerment", label: "Legal" });
  }
  if (platformFeatures.townHallDirectory(phase)) {
    links.push({ href: "/town-halls", label: "Forums" });
    links.push({ href: "/debates", label: "Debates" });
  }
  if (platformFeatures.whistleblowerGuidance(phase)) {
    links.push({ href: "/whistleblowing", label: "Whistleblowing" });
  }
  return links;
}

/** News & resources (header dropdown). */
export function getDiscoverNavLinks(phase: PlatformPhase): PublicNavLink[] {
  const links: PublicNavLink[] = [
    { href: "/news", label: "News", activeWhenPathStartsWith: "/news" },
    { href: "/resources", label: "Resources", activeWhenPathStartsWith: "/resources" },
    { href: "/diaspora", label: "Diaspora support" },
  ];
  if (platformFeatures.partnerJsonProgramme(phase)) {
    links.push({ href: "/partner-api", label: "Partner data", activeWhenPathStartsWith: "/partner-api" });
  }
  return links;
}

/**
 * Footer “Our Platform” column — same gates as the header, ordered for a typical citizen journey:
 * hear about MBKRU → report/track → petitions & causes → transparency → wider engagement →
 * accountability datasets → guidance tools.
 */
export function getFooterPlatformFlowLinks(phase: PlatformPhase): PublicNavLink[] {
  const links: PublicNavLink[] = [];

  links.push({ href: "/citizens-voice", label: "Voice" });

  if (platformFeatures.citizensVoicePlatform(phase)) {
    links.push({ href: "/citizens-voice/submit", label: "Submit a report" });
    links.push({ href: "/track-report", label: "Track a report" });
    links.push({ href: "/petitions", label: "Petitions" });
    links.push({ href: "/citizens-voice/causes", label: "Public causes" });
  }
  if (platformFeatures.citizensVoicePlatform(phase) && platformFeatures.publicVoiceStatistics(phase)) {
    links.push({ href: "/transparency", label: "Voice stats" });
  }

  links.push({ href: "/situational-alerts", label: "Engagement" });

  if (platformFeatures.electionObservatory(phase)) {
    links.push({ href: "/election-observation", label: "Election observation" });
  }
  if (platformFeatures.communities(phase)) {
    links.push({ href: "/communities", label: "Communities" });
  }

  if (platformFeatures.parliamentTrackerData(phase)) {
    links.push({
      href: ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments,
      label: "Government commitment tracker",
    });
  }

  links.push({ href: "/parliament-tracker", label: "Parliamentarians tracker" });

  if (platformFeatures.publicReportCard(phase)) {
    links.push({ href: "/report-card", label: "People's Report Card" });
  }
  if (platformFeatures.legalEmpowermentDesk(phase)) {
    links.push({ href: "/legal-empowerment", label: "Legal" });
  }
  if (platformFeatures.townHallDirectory(phase)) {
    links.push({ href: "/town-halls", label: "Forums" });
    links.push({ href: "/debates", label: "Debates" });
  }
  if (platformFeatures.whistleblowerGuidance(phase)) {
    links.push({ href: "/whistleblowing", label: "Whistleblowing" });
  }

  return links;
}

/**
 * Footer “Useful links” column — stable org and reference URLs. Keep hrefs aligned with
 * `getPublicSitemapStaticPaths` so anything linked here is discoverable to crawlers when published.
 */
export function getFooterOrganizationLinks(phase: PlatformPhase): PublicNavLink[] {
  const links: PublicNavLink[] = [
    { href: "/methodology", label: "Accountability methodology" },
    { href: "/about", label: "About" },
    { href: "/news", label: "News" },
    { href: "/diaspora", label: "Diaspora support" },
    { href: "/diaspora/feedback", label: "Diaspora feedback" },
    { href: "/resources", label: "Resources" },
    { href: "/faq", label: "FAQ" },
    { href: "/data-sources", label: "Data sources" },
    { href: "/partners", label: "Partners & Supporters" },
  ];
  if (platformFeatures.partnerJsonProgramme(phase)) {
    const idx = links.findIndex((l) => l.href === "/data-sources");
    if (idx >= 0) {
      links.splice(idx + 1, 0, { href: "/partner-api", label: "Partner data & API" });
    } else {
      links.push({ href: "/partner-api", label: "Partner data & API" });
    }
  }
  return links;
}

/** Footer legal row — trust pages; paths mirror `getPublicSitemapStaticPaths`. */
export function getFooterLegalLinks(): PublicNavLink[] {
  return [
    { href: "/accessibility", label: "Accessibility" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Use" },
  ];
}

/**
 * About page banner pills (Phase 2+) — mirrors the same feature gates; methodology stays on-page as context.
 */
export function getAboutPhaseQuickLinks(phase: PlatformPhase): PublicNavLink[] {
  const links: PublicNavLink[] = [];

  if (platformFeatures.citizensVoicePlatform(phase)) {
    links.push({ href: "/citizens-voice/submit", label: "Submit a report" });
    links.push({ href: "/track-report", label: "Track a report" });
  }
  if (platformFeatures.citizensVoicePlatform(phase) && platformFeatures.publicVoiceStatistics(phase)) {
    links.push({ href: "/transparency", label: "Voice statistics" });
  }
  if (platformFeatures.parliamentTrackerData(phase)) {
    links.push({
      href: ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments,
      label: "Government commitment tracker",
    });
  }

  links.push({ href: "/parliament-tracker", label: "Parliamentarians tracker" });

  if (platformFeatures.publicReportCard(phase)) {
    links.push({ href: "/report-card", label: "People's Report Card" });
  }
  links.push({ href: "/methodology", label: "Methodology" });
  if (platformFeatures.legalEmpowermentDesk(phase)) {
    links.push({ href: "/legal-empowerment", label: "Legal" });
  }
  if (platformFeatures.townHallDirectory(phase)) {
    links.push({ href: "/town-halls", label: "Forums" });
    links.push({ href: "/debates", label: "Debates" });
  }
  if (platformFeatures.whistleblowerGuidance(phase)) {
    links.push({ href: "/whistleblowing", label: "Whistleblowing" });
  }
  if (platformFeatures.communities(phase)) {
    links.push({ href: "/communities", label: "Communities" });
  }
  if (platformFeatures.electionObservatory(phase)) {
    links.push({ href: "/election-observation", label: "Election observation" });
  }

  return links;
}

/**
 * Static public URLs for `src/app/sitemap.ts` — same phase gates as navigation so crawlers
 * only see routes that exist for this build.
 */
export function getPublicSitemapStaticPaths(phase: PlatformPhase): string[] {
  const routes: string[] = [
    "",
    "/about",
    "/citizens-voice",
    "/situational-alerts",
    "/parliament-tracker",
    "/methodology",
    "/news",
    "/news/diaspora-17th-region-2025",
    "/diaspora",
    "/diaspora/feedback",
    "/resources",
    "/partners",
    "/faq",
    "/data-sources",
    "/contact",
    "/accessibility",
    "/privacy",
    "/terms",
  ];

  if (platformFeatures.electionObservatory(phase)) {
    routes.push("/election-observation");
  }
  if (platformFeatures.parliamentTrackerData(phase)) {
    routes.push("/promises", "/promises/browse");
  }
  if (platformFeatures.publicReportCard(phase)) {
    routes.push("/report-card");
  }
  if (platformFeatures.legalEmpowermentDesk(phase)) {
    routes.push("/legal-empowerment");
  }
  if (platformFeatures.townHallDirectory(phase)) {
    routes.push("/town-halls", "/debates");
  }
  if (platformFeatures.citizensVoicePlatform(phase)) {
    routes.push("/citizens-voice/submit", "/track-report", "/petitions", "/petitions/new", "/citizens-voice/causes");
    if (platformFeatures.electionObservatory(phase)) {
      routes.push("/citizens-voice/submit/election");
    }
  }
  if (platformFeatures.citizensVoicePlatform(phase) && platformFeatures.publicVoiceStatistics(phase)) {
    routes.push("/transparency");
  }
  if (platformFeatures.communities(phase)) {
    routes.push("/communities");
  }
  if (platformFeatures.whistleblowerGuidance(phase)) {
    routes.push("/whistleblowing");
  }
  if (platformFeatures.partnerJsonProgramme(phase)) {
    routes.push("/partner-api");
  }

  return routes;
}

/** `/account` sidebar — links back to Voice intake (Phase 2+). */
export function getAccountSidebarVoiceLinks(phase: PlatformPhase): PublicNavLink[] {
  const out: PublicNavLink[] = [];
  if (!platformFeatures.citizensVoicePlatform(phase)) return out;
  out.push({ href: "/citizens-voice/submit", label: "Submit a report" });
  out.push({ href: "/track-report", label: "Track a report" });
  if (platformFeatures.publicVoiceStatistics(phase)) {
    out.push({ href: "/transparency", label: "Voice statistics" });
  }
  return out;
}

/**
 * `/account` sidebar — public accountability & guidance (member context; “Legal desk” label kept).
 */
export function getAccountSidebarExploreLinks(phase: PlatformPhase): PublicNavLink[] {
  const out: PublicNavLink[] = [];
  if (platformFeatures.parliamentTrackerData(phase)) {
    out.push({
      href: ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments,
      label: "Government commitment tracker",
    });
  }
  out.push({ href: "/parliament-tracker", label: "Parliamentarians tracker" });
  if (platformFeatures.publicReportCard(phase)) {
    out.push({ href: "/report-card", label: "People's Report Card" });
  }
  out.push({ href: "/methodology", label: "Methodology" });
  if (platformFeatures.partnerJsonProgramme(phase)) {
    out.push({ href: "/partner-api", label: "Partner data & API" });
  }
  if (platformFeatures.legalEmpowermentDesk(phase)) {
    out.push({ href: "/legal-empowerment", label: "Legal desk" });
  }
  if (platformFeatures.townHallDirectory(phase)) {
    out.push({ href: "/town-halls", label: "Forums" });
    out.push({ href: "/debates", label: "Debates" });
  }
  if (platformFeatures.whistleblowerGuidance(phase)) {
    out.push({ href: "/whistleblowing", label: "Whistleblowing" });
  }
  if (platformFeatures.communities(phase)) {
    out.push({ href: "/communities", label: "Communities" });
  }
  if (platformFeatures.citizensVoicePlatform(phase)) {
    out.push({ href: "/petitions", label: "Petitions" });
    out.push({ href: "/citizens-voice/causes", label: "Public causes" });
  }
  if (platformFeatures.electionObservatory(phase)) {
    out.push({ href: "/election-observation", label: "Election observation" });
  }
  return out;
}

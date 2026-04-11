/**
 * Public site navigation — single source of truth for header dropdowns, footer “Our Platform”,
 * About / homepage quick links, **`sitemap.ts`** static paths, and **`/account`** sidebar explore links.
 * Keeps `NEXT_PUBLIC_PLATFORM_PHASE` / feature gates aligned everywhere users discover tools
 * (see `docs/ARCHITECTURE.md` §5).
 *
 * Import from client or server components; pass `getPublicPlatformPhase()` or
 * `getServerPlatformPhase()` so server-rendered HTML matches client hydration.
 */

import type { PlatformPhase } from "./platform";
import { platformFeatures } from "./platform";

export type PublicNavLink = {
  href: string;
  label: string;
  /** When set, treat any path under this prefix as active (header). */
  activeWhenPathStartsWith?: string;
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

/** Accountability — parliament, commitments, promises, report card (header group or single link). */
export function getAccountabilityNavLinks(phase: PlatformPhase): PublicNavLink[] {
  const links: PublicNavLink[] = [{ href: "/parliament-tracker", label: "Parliament tracker" }];
  if (platformFeatures.parliamentTrackerData(phase)) {
    links.push({ href: "/government-commitments", label: "Commitments" });
    links.push({ href: "/promises/browse", label: "Promises", activeWhenPathStartsWith: "/promises" });
  }
  if (platformFeatures.publicReportCard(phase)) {
    links.push({ href: "/report-card", label: "Report card", activeWhenPathStartsWith: "/report-card" });
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
export function getDiscoverNavLinks(): PublicNavLink[] {
  return [
    { href: "/news", label: "News", activeWhenPathStartsWith: "/news" },
    { href: "/resources", label: "Resources", activeWhenPathStartsWith: "/resources" },
    { href: "/diaspora", label: "Diaspora" },
  ];
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

  links.push({ href: "/parliament-tracker", label: "Parliament tracker" });

  if (platformFeatures.parliamentTrackerData(phase)) {
    links.push({ href: "/government-commitments", label: "Commitments" });
    links.push({ href: "/promises/browse", label: "Campaign promises" });
  }
  if (platformFeatures.publicReportCard(phase)) {
    links.push({ href: "/report-card", label: "Report card" });
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
    links.push({ href: "/promises/browse", label: "Campaign promises" });
  }
  if (platformFeatures.publicReportCard(phase)) {
    links.push({ href: "/report-card", label: "Report card" });
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
    "/diaspora",
    "/diaspora/feedback",
    "/resources",
    "/partners",
    "/faq",
    "/data-sources",
    "/contact",
    "/privacy",
    "/terms",
  ];

  if (platformFeatures.electionObservatory(phase)) {
    routes.push("/election-observation");
  }
  if (platformFeatures.parliamentTrackerData(phase)) {
    routes.push("/promises", "/promises/browse", "/government-commitments");
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
  out.push({ href: "/parliament-tracker", label: "Parliament tracker" });
  if (platformFeatures.parliamentTrackerData(phase)) {
    out.push({ href: "/government-commitments", label: "Commitments" });
    out.push({ href: "/promises/browse", label: "Campaign promises" });
  }
  if (platformFeatures.publicReportCard(phase)) {
    out.push({ href: "/report-card", label: "Report card" });
  }
  out.push({ href: "/methodology", label: "Methodology" });
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

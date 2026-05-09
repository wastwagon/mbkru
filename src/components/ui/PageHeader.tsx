"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { focusRingSmClass } from "@/lib/primary-link-styles";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  /**
   * Same as `description` — supported so older pages (or merges) that used `subtitle` still typecheck and render.
   * Prefer `description` for new code.
   */
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  /** Override last breadcrumb label (e.g. article title for /news/[slug]) */
  breadcrumbCurrentLabel?: string;
}

const PATH_BREADCRUMBS: Record<string, string> = {
  "/about": "About",
  "/news": "News",
  "/contact": "Contact",
  "/citizens-voice": "Voice",
  "/situational-alerts": "Engagement",
  "/parliament-tracker": "Parliament tracker",
  "/legal-empowerment": "Legal",
  "/town-halls": "Forums",
  "/debates": "Debates",
  "/promises": "By MP",
  "/promises/browse": "Commitment catalogue",
  "/government-commitments": "Government commitments",
  "/transparency": "Voice stats",
  "/whistleblowing": "Whistleblowing",
  "/communities": "Communities",
  "/election-observation": "Election observation",
  "/report-card": "Report card",
  "/methodology": "Methodology",
  "/data-sources": "Data sources",
  "/partner-api": "Partner data & API",
  "/resources": "Resources",
  "/faq": "FAQ",
  "/partners": "Partners & Supporters",
  "/diaspora": "Diaspora support",
  "/diaspora/feedback": "Diaspora feedback",
  "/privacy": "Privacy Policy",
  "/terms": "Terms of Use",
  "/accessibility": "Accessibility",
  "/track-report": "Track a report",
  "/login": "Sign in",
  "/register": "Register",
  "/citizens-voice/submit": "Submit a report",
  "/citizens-voice/causes": "Public causes",
  "/petitions": "Petitions",
  "/petitions/new": "Start a petition",
  "/situational-alerts/submit": "Submit engagement",
};

function buildBreadcrumbs(pathname: string, currentLabel?: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: "Home", href: "/" }];
  if (pathname === "/") return [];

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return items;

  if (segments[0] === "news" && segments.length > 1 && currentLabel) {
    items.push({ label: PATH_BREADCRUMBS["/news"] ?? "News", href: "/news" });
    items.push({ label: currentLabel });
    return items;
  }

  if (segments[0] === "promises" && segments[1] === "browse") {
    items.push({
      label: PATH_BREADCRUMBS["/promises"] ?? "By MP",
      href: "/promises",
    });
    items.push({ label: PATH_BREADCRUMBS["/promises/browse"] ?? "Commitment catalogue" });
    return items;
  }

  if (segments[0] === "promises" && segments.length > 1 && currentLabel) {
    items.push({
      label: PATH_BREADCRUMBS["/promises"] ?? "By MP",
      href: "/promises",
    });
    items.push({ label: currentLabel });
    return items;
  }

  if (segments[0] === "report-card" && segments.length > 1 && currentLabel) {
    items.push({
      label: PATH_BREADCRUMBS["/report-card"] ?? "Report card",
      href: "/report-card",
    });
    items.push({ label: currentLabel });
    return items;
  }

  if (segments[0] === "citizens-voice" && segments[1] === "submit") {
    items.push({
      label: PATH_BREADCRUMBS["/citizens-voice"] ?? "Voice",
      href: "/citizens-voice",
    });
    items.push({ label: PATH_BREADCRUMBS["/citizens-voice/submit"] ?? "Submit a report" });
    return items;
  }

  if (segments[0] === "citizens-voice" && segments[1] === "causes" && segments.length === 2) {
    items.push({
      label: PATH_BREADCRUMBS["/citizens-voice"] ?? "Voice",
      href: "/citizens-voice",
    });
    items.push({ label: PATH_BREADCRUMBS["/citizens-voice/causes"] ?? "Public causes" });
    return items;
  }

  if (segments[0] === "citizens-voice" && segments[1] === "causes" && segments.length > 2 && currentLabel) {
    items.push({
      label: PATH_BREADCRUMBS["/citizens-voice"] ?? "Voice",
      href: "/citizens-voice",
    });
    items.push({
      label: PATH_BREADCRUMBS["/citizens-voice/causes"] ?? "Public causes",
      href: "/citizens-voice/causes",
    });
    items.push({ label: currentLabel });
    return items;
  }

  if (segments[0] === "petitions" && segments.length === 1) {
    items.push({ label: PATH_BREADCRUMBS["/petitions"] ?? "Petitions" });
    return items;
  }

  if (segments[0] === "petitions" && segments[1] === "new") {
    items.push({ label: PATH_BREADCRUMBS["/petitions"] ?? "Petitions", href: "/petitions" });
    items.push({ label: PATH_BREADCRUMBS["/petitions/new"] ?? "Start a petition" });
    return items;
  }

  if (segments[0] === "petitions" && segments.length > 1 && segments[1] !== "new" && currentLabel) {
    items.push({ label: PATH_BREADCRUMBS["/petitions"] ?? "Petitions", href: "/petitions" });
    items.push({ label: currentLabel });
    return items;
  }

  if (segments[0] === "situational-alerts" && segments[1] === "submit") {
    items.push({
      label: PATH_BREADCRUMBS["/situational-alerts"] ?? "Engagement",
      href: "/situational-alerts",
    });
    items.push({ label: PATH_BREADCRUMBS["/situational-alerts/submit"] ?? "Submit engagement" });
    return items;
  }

  if (segments[0] === "diaspora" && segments[1] === "feedback") {
    items.push({ label: PATH_BREADCRUMBS["/diaspora"] ?? "Diaspora", href: "/diaspora" });
    items.push({ label: PATH_BREADCRUMBS["/diaspora/feedback"] ?? "Diaspora feedback" });
    return items;
  }

  const path = "/" + segments[0];
  const label = PATH_BREADCRUMBS[path] ?? segments[0].charAt(0).toUpperCase() + segments[0].slice(1).replace(/-/g, " ");
  items.push({ label });
  return items;
}

export function PageHeader({ title, description, subtitle, breadcrumbs, breadcrumbCurrentLabel }: PageHeaderProps) {
  const pathname = usePathname();
  const crumbs = breadcrumbs ?? buildBreadcrumbs(pathname, breadcrumbCurrentLabel);
  const blurb = description ?? subtitle;

  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] section-full bg-[var(--section-light-tertiary)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--primary)/[0.08),transparent)]" aria-hidden />
      <div className="relative mx-auto max-w-4xl px-4 py-9 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="-mx-1 mb-5 overflow-x-auto overscroll-x-contain px-1 sm:mb-6">
            <ol className="flex min-w-max flex-nowrap items-center gap-x-1.5 gap-y-1 text-[13px] sm:min-w-0 sm:flex-wrap sm:gap-x-2 sm:text-sm">
              {crumbs.map((item, i) => (
                <li key={i} className="flex shrink-0 items-center gap-x-1.5 sm:gap-x-2">
                  {i > 0 && (
                    <span className="shrink-0 text-[var(--muted-foreground)]/50" aria-hidden>
                      /
                    </span>
                  )}
                  {item.href ? (
                    <Link
                      href={item.href}
                      className={`rounded-md px-1 py-1 font-medium text-[var(--muted-foreground)] underline-offset-4 transition-colors hover:text-[var(--primary)] sm:px-0 sm:py-0.5 ${focusRingSmClass}`}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className="max-w-[min(100vw-3rem,42rem)] truncate font-semibold text-[var(--foreground)] sm:max-w-none sm:overflow-visible sm:whitespace-normal sm:text-clip"
                      aria-current="page"
                      title={item.label}
                    >
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="max-w-2xl">
          <h1 className="font-display text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl lg:text-3xl lg:leading-[1.2]">
            {title}
          </h1>
          {blurb && (
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted-foreground)] sm:text-base">
              {blurb}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

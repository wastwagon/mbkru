"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
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
  "/promises": "Campaign promises",
  "/promises/browse": "Campaign promises",
  "/government-commitments": "Commitments",
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
  "/diaspora": "Diaspora — 17th Region",
  "/diaspora/feedback": "Diaspora feedback",
  "/privacy": "Privacy Policy",
  "/terms": "Terms of Use",
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

  if (segments[0] === "promises" && segments.length > 1 && currentLabel) {
    items.push({
      label: PATH_BREADCRUMBS["/promises"] ?? "Campaign promises",
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

export function PageHeader({ title, description, breadcrumbs, breadcrumbCurrentLabel }: PageHeaderProps) {
  const pathname = usePathname();
  const crumbs = breadcrumbs ?? buildBreadcrumbs(pathname, breadcrumbCurrentLabel);

  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] section-full bg-[var(--section-light-tertiary)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--primary)/[0.08),transparent)]" aria-hidden />
      <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-2 text-sm">
              {crumbs.map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  {i > 0 && (
                    <span className="text-[var(--muted-foreground)]/60" aria-hidden>
                      /
                    </span>
                  )}
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-[var(--foreground)]" aria-current="page">
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
          {description && (
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted-foreground)] sm:text-base">
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

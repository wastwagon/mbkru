import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { MpCatalogueBrowseCard } from "@/components/accountability/MpCatalogueBrowseCard";
import { AccountabilityDisclaimerCallout } from "@/components/legal/AccountabilityDisclaimerCallout";
import { PageHeader } from "@/components/ui/PageHeader";
import { pageHeaderPresets } from "@/lib/page-header-presets";
import {
  ACCOUNTABILITY_CATALOGUE_ROUTES,
  accountabilityCatalogueNavMedium,
  accountabilityProse,
} from "@/config/accountability-catalogue-destinations";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";
import { getCachedPromisesIndexMembers } from "@/lib/server/accountability-cache";
import { isPromisesBrowseEnabled } from "@/lib/reports/accountability-pages";

export const dynamic = "force-dynamic";

/** Allow slower roster queries behind gateways (e.g. Vercel); ignored on platforms that don’t support it. */
export const maxDuration = 60;

export const metadata: Metadata = {
  title: accountabilityCatalogueNavMedium.byMp,
  description: "Track documented commitments from MPs and ministers — sources and status in one place.",
};

export default async function PromisesIndexPage() {
  if (!isPromisesBrowseEnabled() || !isDatabaseConfigured()) notFound();

  const members = await getCachedPromisesIndexMembers();

  const preset = pageHeaderPresets.accountability;

  return (
    <div>
      <PageHeader
        title={accountabilityCatalogueNavMedium.byMp}
        description="Documented commitments we are tracking. Each row links to sources and current status. This is not a legal finding — see our methodology for how we work."
        eyebrow={preset.eyebrow}
        heroImage={preset.heroImage}
        heroImageAlt={preset.heroImageAlt}
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <AccountabilityDisclaimerCallout variant="promiseCatalogue" className="mb-6" />
          <p className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm leading-relaxed text-[var(--foreground-secondary)]">
            Independent commitment tracking for sitting parliamentarians — sourced pledges with verification notes, not
            official Hansard.{" "}
            <Link href="/methodology" className={primaryNavLinkClass}>
              Methodology
            </Link>
          </p>
          <p className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-center text-sm text-[var(--foreground-secondary)]">
            <Link href={ACCOUNTABILITY_CATALOGUE_ROUTES.browseAllPromises} className={primaryNavLinkClass}>
              {accountabilityCatalogueNavMedium.browseAll}
            </Link>
            <span className="text-[var(--foreground-secondary)]/50" aria-hidden>
              ·
            </span>
            <Link href={ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments} className={primaryNavLinkClass}>
              {accountabilityCatalogueNavMedium.government}
            </Link>
            <span className="text-[var(--foreground-secondary)]/50" aria-hidden>
              ·
            </span>
            <Link href="/parliament-tracker" className={primaryNavLinkClass}>
              Accountability hub
            </Link>
          </p>

          {members.length === 0 ? (
            <p className="mt-10 text-center text-sm text-[var(--foreground-secondary)]">
              {accountabilityProse.promisesIndexEmptyState}
            </p>
          ) : (
            <>
              <h2 className="mt-8 text-sm font-semibold text-[var(--foreground)]">
                MPs &amp; ministers in catalogue ({members.length})
              </h2>
              <ul className="mt-4 space-y-3">
                {members.map((m) => (
                  <li key={m.id}>
                    <MpCatalogueBrowseCard
                      slug={m.slug}
                      name={m.name}
                      role={m.role}
                      party={m.party}
                      constituencyName={m.constituency?.name ?? null}
                      promiseCount={m._count.promises}
                      portraitPath={m.portraitPath}
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

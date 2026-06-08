import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PromiseEvidenceCard } from "@/components/accountability/PromiseEvidenceCard";
import { MpPerformanceIntakeList } from "@/components/accountability/MpPerformanceIntakeList";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  ACCOUNTABILITY_CATALOGUE_ROUTES,
  accountabilityCatalogueNavMedium,
  accountabilityProse,
} from "@/config/accountability-catalogue-destinations";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { formatMediumDate } from "@/lib/format-submission-datetime";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";
import { getCachedPromisesMemberPublic } from "@/lib/server/accountability-cache";
import { loadMpPerformanceIntakes } from "@/lib/server/promises-member-sheet-load";
import { isPromisesBrowseEnabled } from "@/lib/reports/accountability-pages";

export const dynamic = "force-dynamic";

export const maxDuration = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isPromisesBrowseEnabled() || !isDatabaseConfigured()) {
    return { title: accountabilityCatalogueNavMedium.byMp };
  }
  const member = await getCachedPromisesMemberPublic(slug.toLowerCase());
  return {
    title: member ? `${member.name} — ${accountabilityCatalogueNavMedium.byMp}` : accountabilityCatalogueNavMedium.byMp,
  };
}

export default async function PromisesByMemberPage({ params }: Props) {
  if (!isPromisesBrowseEnabled() || !isDatabaseConfigured()) notFound();

  const { slug } = await params;
  const member = await getCachedPromisesMemberPublic(slug.toLowerCase());

  if (!member) notFound();

  const mpPerformanceReports = await loadMpPerformanceIntakes(member.id);

  return (
    <div>
      <PageHeader
        title={member.name}
        description={`${member.role}${member.party ? ` · ${member.party}` : ""}${member.constituency ? ` · ${member.constituency.name}` : ""}${accountabilityProse.memberSheetMetaSuffix}`}
        breadcrumbCurrentLabel={member.name}
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--foreground-secondary)]">
            <Link href={ACCOUNTABILITY_CATALOGUE_ROUTES.promisesByMp} className={primaryNavLinkClass}>
              {accountabilityProse.mpRosterBackLink}
            </Link>
          </p>

          <p className="mt-4 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm leading-relaxed text-[var(--foreground-secondary)]">
            MP commitment sheet — verified catalogue rows below, plus Citizen Voice intakes filed by residents. Not a legal
            finding.{" "}
            <Link href="/methodology" className={primaryNavLinkClass}>
              Methodology
            </Link>
          </p>

          <p className="mt-4 hidden flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--foreground-secondary)] sm:flex">
            <Link href={ACCOUNTABILITY_CATALOGUE_ROUTES.browseAllPromises} className={primaryNavLinkClass}>
              {accountabilityCatalogueNavMedium.browseAll}
            </Link>
            <span className="text-[var(--foreground-secondary)]/50" aria-hidden>
              ·
            </span>
            <Link href="/report-card" className={primaryNavLinkClass}>
              Report card
            </Link>
            <span className="text-[var(--foreground-secondary)]/50" aria-hidden>
              ·
            </span>
            <Link href="/parliament-tracker" className={primaryNavLinkClass}>
              Parliament tracker
            </Link>
          </p>

          <div className="mt-8">
            <MpPerformanceIntakeList reports={mpPerformanceReports} />
          </div>

          {member.promises.length === 0 ? (
            <p className="mt-8 rounded-2xl border border-[var(--border)] bg-white px-4 py-6 text-sm text-[var(--foreground-secondary)]">
              No catalogue commitments are published for this MP yet. Voice intakes above are filed by residents;
              catalogue rows appear when editors publish verified commitments.
            </p>
          ) : (
            <>
              <h2 className="mt-10 text-sm font-semibold text-[var(--foreground)]">
                Catalogue commitments ({member.promises.length})
              </h2>
              <ul className="mt-4 space-y-4">
                {member.promises.map((p) => (
                  <li key={p.id} className="space-y-1.5">
                    <PromiseEvidenceCard
                      title={p.title}
                      description={p.description}
                      status={p.status}
                      blockedReason={p.blockedReason}
                      sourceLabel={p.sourceLabel}
                      sourceDate={p.sourceDate}
                      sourceUrl={p.sourceUrl}
                      verificationNotes={p.verificationNotes}
                      manifestoPageRef={p.manifestoPageRef}
                      electionCycle={p.electionCycle}
                      partySlug={p.partySlug}
                      policySector={p.policySector}
                      manifestoDocument={
                        p.manifestoDocument
                          ? {
                              title: p.manifestoDocument.title,
                              sourceUrl: p.manifestoDocument.sourceUrl,
                            }
                          : null
                      }
                    />
                    <p className="px-1 text-[11px] text-[var(--foreground-secondary)]">
                      Updated {formatMediumDate(p.updatedAt)}
                    </p>
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

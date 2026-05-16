import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PromiseEvidenceCard } from "@/components/accountability/PromiseEvidenceCard";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  ACCOUNTABILITY_CATALOGUE_ROUTES,
  accountabilityCatalogueNavMedium,
  accountabilityProse,
} from "@/config/accountability-catalogue-destinations";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";
import { getCachedPromisesMemberPublic } from "@/lib/server/accountability-cache";
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

  const mpPerformanceReports = await prisma.citizenReport.findMany({
    where: {
      parliamentMemberId: member.id,
      kind: "MP_PERFORMANCE",
      status: { not: "ARCHIVED" },
    },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: {
      id: true,
      title: true,
      trackingCode: true,
      createdAt: true,
      discussionEnabled: true,
    },
  });

  return (
    <div>
      <PageHeader
        title={member.name}
        description={`${member.role}${member.party ? ` · ${member.party}` : ""}${member.constituency ? ` · ${member.constituency.name}` : ""}${accountabilityProse.memberSheetMetaSuffix}`}
        breadcrumbCurrentLabel={member.name}
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--muted-foreground)]">
            <Link href={ACCOUNTABILITY_CATALOGUE_ROUTES.promisesByMp} className={primaryNavLinkClass}>
              {accountabilityProse.mpRosterBackLink}
            </Link>
          </p>

          {mpPerformanceReports.length > 0 ? (
            <div className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                Citizen Voice — MP performance intakes
              </h2>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Recent MBKRU Voice submissions filed against this MP (staff triage; not verified allegations). Open{" "}
                <Link href="/parliament-tracker" className={primaryNavLinkClass}>
                  Parliament tracker
                </Link>{" "}
                for the roster and catalogue context.
              </p>
              <ul className="mt-4 space-y-3">
                {mpPerformanceReports.map((r) => (
                  <li key={r.id} className="border-b border-[var(--border)]/80 pb-3 last:border-0 last:pb-0">
                    <p className="font-medium text-[var(--foreground)]">{r.title}</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {r.discussionEnabled ? (
                        <>
                          <Link
                            href={`/citizens-voice/discussions/${encodeURIComponent(r.id)}`}
                            className={primaryNavLinkClass}
                          >
                            Open discussion
                          </Link>
                          {" · "}
                        </>
                      ) : (
                        <>
                          Track{" "}
                          <Link href={`/track-report?code=${encodeURIComponent(r.trackingCode)}`} className={primaryNavLinkClass}>
                            {r.trackingCode}
                          </Link>
                          {" · "}
                        </>
                      )}
                      {r.createdAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {member.promises.length === 0 ? (
            <p className="mt-8 rounded-xl border border-[var(--border)] bg-white px-4 py-6 text-sm text-[var(--muted-foreground)]">
              No catalogue commitments are published for this MP yet. Voice intakes above are filed by residents;
              catalogue rows appear when editors publish verified commitments.
            </p>
          ) : null}

          <ul className="mt-8 space-y-6">
            {member.promises.map((p) => (
              <li key={p.id} className="space-y-2">
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
                <p className="px-1 text-[11px] text-[var(--muted-foreground)]">
                  Updated {p.updatedAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

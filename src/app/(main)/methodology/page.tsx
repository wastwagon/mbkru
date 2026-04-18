import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  ACCOUNTABILITY_CATALOGUE_ROUTES,
  accountabilityCatalogueNavMedium,
  accountabilityProse,
} from "@/config/accountability-catalogue-destinations";
import {
  isPartnerApiTermsPageEnabled,
  isPromisesBrowseEnabled,
  isReportCardPublicEnabled,
} from "@/lib/reports/accountability-pages";

export const metadata: Metadata = {
  title: "Accountability methodology",
  description: accountabilityProse.methodologyPageMetaDescription,
};

export default async function MethodologyPage() {
  const showPromises = isPromisesBrowseEnabled();
  const showReportCard = isReportCardPublicEnabled();
  const showPartnerApi = isPartnerApiTermsPageEnabled();

  return (
    <div>
      <PageHeader
        title="Accountability methodology"
        description="MBKRU combines public data, documented commitments, and careful editorial judgement. We do not replace official regulators or electoral bodies."
      />

      <section className="section-spacing section-full bg-white">
        <div className="mx-auto max-w-3xl px-4 text-[var(--foreground)] sm:px-6 lg:px-8">
          {showPromises || showReportCard ? (
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--muted-foreground)]">
              {showPromises ? (
                <>
                  <Link
                    href={ACCOUNTABILITY_CATALOGUE_ROUTES.promisesByMp}
                    className="font-medium text-[var(--primary)] hover:underline"
                  >
                    {accountabilityCatalogueNavMedium.byMp}
                  </Link>
                  <span aria-hidden className="text-[var(--muted-foreground)]/50">
                    ·
                  </span>
                  <Link
                    href={ACCOUNTABILITY_CATALOGUE_ROUTES.browseAllPromises}
                    className="font-medium text-[var(--primary)] hover:underline"
                  >
                    {accountabilityCatalogueNavMedium.browseAll}
                  </Link>
                  <span aria-hidden className="text-[var(--muted-foreground)]/50">
                    ·
                  </span>
                  <Link
                    href={ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments}
                    className="font-medium text-[var(--primary)] hover:underline"
                  >
                    {accountabilityCatalogueNavMedium.government}
                  </Link>
                </>
              ) : null}
              {showPromises && showReportCard ? (
                <span aria-hidden className="text-[var(--muted-foreground)]/50">
                  ·
                </span>
              ) : null}
              {showReportCard ? (
                <Link href="/report-card" className="font-medium text-[var(--primary)] hover:underline">
                  People&apos;s Report Card
                </Link>
              ) : null}
            </p>
          ) : null}
          <h2 className="mt-8 font-display text-xl font-bold">Principles</h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-[var(--muted-foreground)]">
            <li>
              <strong className="text-[var(--foreground)]">Evidence-led:</strong> claims about promises or performance
              cite sources (manifestos, Hansard-style records, budgets, or on-the-record statements).
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Non-partisan process:</strong> teams document facts and
              status changes; political commentary is separate from the dataset.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Corrections:</strong> when we get something wrong, we fix
              the record and note material updates where practical.
            </li>
          </ul>

          <h2 className="mt-12 font-display text-xl font-bold">
            {accountabilityProse.methodologyCatalogueSectionHeading}
          </h2>
          <p className="mt-4 text-[var(--muted-foreground)]">{accountabilityProse.methodologyPromiseTrackingBody}</p>

          <h2 className="mt-12 font-display text-xl font-bold">Score-style views (People&apos;s Report Card)</h2>
          <p className="mt-4 text-[var(--muted-foreground)]">
            Future scorecards will summarise multiple dimensions (e.g. accessibility, follow-through on commitments,
            use of public resources) using published methodologies. Dimensions are inspired by international
            transparency and parliamentary openness frameworks, then adapted to Ghanaian institutions and data
            availability — not copied wholesale.
          </p>
          <p className="mt-4 text-[var(--muted-foreground)]">
            Scores are explanatory, not legal findings. They complement — and never substitute for — official
            oversight by bodies such as CHRAJ, the Auditor-General, or the Electoral Commission.
          </p>

          <h2 id="claims-and-citations" className="mt-10 font-display text-xl font-bold">
            Claims, citations &amp; limitations
          </h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-[var(--muted-foreground)]">
            <li>
              <strong className="text-[var(--foreground)]">{accountabilityProse.methodologyClaimsBulletStrong}</strong>{" "}
              are tracked as editorial catalogue rows with sources (manifesto, speech, official URL) where our QA requires
              them — not findings by
              courts or the Electoral Commission.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Report card metrics</strong> are explanatory; they complement
              statutory oversight and never substitute for it.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Voice and situational channels</strong> triage citizen input
              for programme accountability — not legal advice or a government hotline.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Bulk data changes</strong> (imports, retags) follow internal
              dry-run and sign-off before we market them as refreshed public datasets.
            </li>
          </ul>

          <p className="mt-12 text-sm text-[var(--muted-foreground)]">
            {showPromises || showReportCard ? (
              <>
                When enabled for this deployment, partners can pull the same MP roster, public commitment catalogue, and
                published
                report-card cycles through read-only exports. Requests are rate-limited and responses may be cached briefly
                between refreshes.{" "}
                {showPartnerApi ? (
                  <>
                    <Link href="/partner-api" className="font-medium text-[var(--primary)] hover:underline">
                      Partner data &amp; API
                    </Link>{" "}
                    summarises endpoints, attribution, and fair-use expectations for dashboards and newsrooms.
                  </>
                ) : (
                  "Contact us for partner terms before production embeds."
                )}
              </>
            ) : (
              "Optional public data feeds follow the same phase rules as the rest of this site — programme staff can confirm what is enabled for your deployment."
            )}
          </p>

          <p className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <Link href="/whistleblowing" className="font-medium text-[var(--primary)] hover:underline">
              Whistleblowing guidance
            </Link>
            <Link href="/parliament-tracker" className="font-medium text-[var(--primary)] hover:underline">
              ← Accountability &amp; Electoral Watch
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

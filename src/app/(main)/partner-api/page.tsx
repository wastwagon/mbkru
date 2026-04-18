import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/ui/PageHeader";
import {
  ACCOUNTABILITY_CATALOGUE_ROUTES,
  accountabilityProse,
} from "@/config/accountability-catalogue-destinations";
import {
  isPartnerApiTermsPageEnabled,
  isPromisesBrowseEnabled,
  isReportCardPublicEnabled,
} from "@/lib/reports/accountability-pages";

export const metadata: Metadata = {
  title: "Partner data & API",
  description:
    "How media, CSOs, and civic technologists may use MBKRU read-only JSON and CSV exports — attribution, caching, rate limits, and limitations.",
};

export default function PartnerApiPage() {
  if (!isPartnerApiTermsPageEnabled()) notFound();

  const showMpsPromises = isPromisesBrowseEnabled();
  const showReportCard = isReportCardPublicEnabled();

  return (
    <div>
      <PageHeader
        title="Partner data &amp; API"
        description={accountabilityProse.partnerApiPageIntro}
      />

      <section className="section-spacing section-full bg-white">
        <div className="mx-auto max-w-3xl px-4 text-[var(--foreground)] sm:px-6 lg:px-8">
          <p className="rounded-lg border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
            <strong className="font-semibold">Draft — programme copy.</strong> Counsel should review before you cite this
            page as contractual “terms” in MOUs or press releases. Technical detail for engineers lives in the repository
            under <code className="rounded bg-white/80 px-1.5 py-0.5 text-[13px]">docs/PARTNER_API.md</code>.
          </p>

          <h2 className="mt-10 font-display text-xl font-bold">What is available</h2>
          <p className="mt-4 text-[var(--muted-foreground)]">
            When your deployment runs <strong className="text-[var(--foreground)]">Phase 2 or higher</strong>, MBKRU
            exposes <strong className="text-[var(--foreground)]">GET</strong> JSON and UTF-8 CSV exports. Each handler
            checks feature flags and returns <code className="text-[13px]">404</code> or{" "}
            <code className="text-[13px]">503</code> when data or the database is unavailable — design integrations to
            degrade gracefully.
          </p>

          <div className="mt-6 overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
              <thead className="bg-[var(--section-light)] text-[var(--foreground)]">
                <tr>
                  <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">Path</th>
                  <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-[var(--muted-foreground)]">
                <tr>
                  <td className="border-b border-[var(--border)] px-3 py-2 font-mono text-[13px] text-[var(--foreground)]">
                    /api/mps
                  </td>
                  <td className="border-b border-[var(--border)] px-3 py-2">
                    Active MP/minister roster (when{" "}
                    {showMpsPromises ? (
                      <Link
                        href={ACCOUNTABILITY_CATALOGUE_ROUTES.browseAllPromises}
                        className="font-medium text-[var(--primary)] hover:underline"
                      >
                        {accountabilityProse.partnerApiMpsCellLinkLabel}
                      </Link>
                    ) : (
                      "parliament data"
                    )}{" "}
                    is enabled for this build).
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-[var(--border)] px-3 py-2 font-mono text-[13px] text-[var(--foreground)]">
                    /api/promises
                  </td>
                  <td className="border-b border-[var(--border)] px-3 py-2">
                    {accountabilityProse.apiPromisesTableRow}
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-[var(--border)] px-3 py-2 font-mono text-[13px] text-[var(--foreground)]">
                    /api/report-card/[year]
                  </td>
                  <td className="border-b border-[var(--border)] px-3 py-2">
                    Published People&apos;s Report Card cycle when{" "}
                    {showReportCard ? (
                      <Link href="/report-card" className="font-medium text-[var(--primary)] hover:underline">
                        the report card
                      </Link>
                    ) : (
                      "the report card"
                    )}{" "}
                    is public for this build.
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-[var(--border)] px-3 py-2 font-mono text-[13px] text-[var(--foreground)]">
                    /api/export/mps-csv
                  </td>
                  <td className="border-b border-[var(--border)] px-3 py-2">CSV roster (same feature gate as JSON MPs).</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono text-[13px] text-[var(--foreground)]">/api/export/promises-csv</td>
                  <td className="px-3 py-2">Full promise export with the same filter semantics as JSON (separate rate bucket).</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            <code className="rounded bg-[var(--section-light)] px-1.5 py-0.5 text-[13px]">GET /api/health</code> reports
            capability flags for monitoring — it is not a dataset export.
          </p>

          <h2 className="mt-10 font-display text-xl font-bold">Caching and traffic</h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-[var(--muted-foreground)]">
            <li>
              Successful responses advertise <strong className="text-[var(--foreground)]">Cache-Control</strong> suitable
              for shared caches; respect those headers and avoid hammering origin.
            </li>
            <li>
              Expect <strong className="text-[var(--foreground)]">429 Too Many Requests</strong> when rate limits apply —
              back off and retry with exponential delay.
            </li>
            <li>
              After editors publish updates, we use cache revalidation so partners often see fresh data without waiting for
              the full edge TTL.
            </li>
          </ul>

          <h2 className="mt-10 font-display text-xl font-bold">Attribution and accuracy</h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-[var(--muted-foreground)]">
            <li>
              <strong className="text-[var(--foreground)]">Attribute MBKRU</strong> when you display derived tables,
              charts, or excerpts.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Do not</strong> imply endorsement by MBKRU, Parliament, or
              government bodies.
            </li>
            <li>
              Surface <strong className="text-[var(--foreground)]">methodology</strong> and update context where you can;
              datasets are compiled for civic accountability and may be corrected after editorial or legal review.
            </li>
            <li>
              Data is provided <strong className="text-[var(--foreground)]">as-is</strong>, without warranty — partners
              should not treat exports as sole evidence in litigation or regulatory filings without independent verification.
            </li>
          </ul>

          <h2 className="mt-10 font-display text-xl font-bold">Versioning</h2>
          <p className="mt-4 text-[var(--muted-foreground)]">
            URLs today do not include a version segment. Before breaking response shapes, we expect to introduce explicit
            versioning (for example <code className="text-[13px]">/api/v1/...</code> aliases or{" "}
            <code className="text-[13px]">Accept</code> negotiation) with a deprecation window — watch release notes and{" "}
            <code className="text-[13px]">docs/PARTNER_API.md</code> in the repository.
          </p>

          <h2 className="mt-10 font-display text-xl font-bold">Get in touch</h2>
          <p className="mt-4 text-[var(--muted-foreground)]">
            For traffic expectations, attribution assets, or a formal partnership conversation, use our{" "}
            <Link href="/contact" className="font-medium text-[var(--primary)] hover:underline">
              Contact
            </Link>{" "}
            page and choose a partnership-oriented enquiry where the form allows it.
          </p>

          <p className="mt-10 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <Link href="/methodology" className="font-medium text-[var(--primary)] hover:underline">
              Accountability methodology
            </Link>
            <Link href="/methodology#claims-and-citations" className="font-medium text-[var(--primary)] hover:underline">
              Claims &amp; citations
            </Link>
            <Link href="/data-sources" className="font-medium text-[var(--primary)] hover:underline">
              Data sources
            </Link>
            <Link href="/terms" className="font-medium text-[var(--primary)] hover:underline">
              Site terms of use
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

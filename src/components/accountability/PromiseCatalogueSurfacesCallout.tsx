import Link from "next/link";

import {
  ACCOUNTABILITY_CATALOGUE_ROUTES,
  accountabilityCatalogueNavMedium,
} from "@/config/accountability-catalogue-destinations";
import { primaryLinkClass } from "@/lib/primary-link-styles";
import { isPartnerApiTermsPageEnabled, isReportCardPublicEnabled } from "@/lib/reports/accountability-pages";

type Props = {
  /** Which catalogue preset this page rendered with. */
  catalogueLens: "full" | "government";
};

/**
 * Single commitment catalogue (`/promises/browse`) — copy reflects full vs government-programme preset.
 */
export function PromiseCatalogueSurfacesCallout({ catalogueLens }: Props) {
  const showPartnerPage = isPartnerApiTermsPageEnabled();
  const showPeopleReportCard = isReportCardPublicEnabled();
  return (
    <aside
      className="mx-auto mt-6 max-w-3xl rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-4 text-sm leading-relaxed text-[var(--muted-foreground)] shadow-sm sm:px-5"
      aria-label="How this page relates to the public accountability catalogue"
    >
      <p className="font-medium text-[var(--foreground)]">One pledge database</p>
      {catalogueLens === "government" ? (
        <p className="mt-2">
          This preset shows only editorial <strong className="text-[var(--foreground)]">government-programme</strong>{" "}
          rows — the same underlying records as MP pledge sheets when a member is linked, with one shared status. Open{" "}
          <Link href={ACCOUNTABILITY_CATALOGUE_ROUTES.browseAllPromises} className={`${primaryLinkClass} font-semibold`}>
            full catalogue
          </Link>{" "}
          for every sitting-MP row and all filters. Methodology:{" "}
          <Link href="/methodology" className={`${primaryLinkClass} font-semibold`}>
            Accountability methodology
          </Link>
          .
        </p>
      ) : (
        <p className="mt-2">
          By default this lists commitments we track for <strong className="text-[var(--foreground)]">active MPs</strong>{" "}
          (plus your filters). Use the{" "}
          <Link href={ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments} className={`${primaryLinkClass} font-semibold`}>
            {accountabilityCatalogueNavMedium.government}
          </Link>{" "}
          preset for programme- and executive-tagged rows only — same catalogue, narrower lens.
        </p>
      )}
      <details className="mt-2 rounded-lg border border-dashed border-[var(--border)] bg-[var(--section-light)]/50 px-3 py-2 text-[13px] text-[var(--muted-foreground)]">
        <summary className="cursor-pointer font-medium text-[var(--foreground)]">Partners &amp; developers</summary>
        <p className="mt-2">
          Filtered data is available as JSON via{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-[12px] text-[var(--foreground)]">GET /api/promises</code>{" "}
          (see{" "}
          {showPartnerPage ? (
            <Link href="/partner-api" className={`${primaryLinkClass} font-medium`}>
              Partner data
            </Link>
          ) : (
            <Link href="/data-sources" className={`${primaryLinkClass} font-medium`}>
              Data sources
            </Link>
          )}
          ). CSV export mirrors the filters on this page.
        </p>
      </details>
      {showPeopleReportCard ? (
        <p className="mt-3 border-t border-[var(--border)] pt-3 text-[13px] leading-relaxed">
          <strong className="text-[var(--foreground)]">People&apos;s Report Card</strong> — published MP narratives and
          scores are on{" "}
          <Link href="/report-card" className={`${primaryLinkClass} font-semibold`}>
            Report card
          </Link>
          . This page is tracked pledge rows only, not that scorecard layer.
        </p>
      ) : null}
    </aside>
  );
}

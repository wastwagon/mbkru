import Link from "next/link";

import {
  ACCOUNTABILITY_CATALOGUE_ROUTES,
  accountabilityCatalogueNavMedium,
} from "@/config/accountability-catalogue-destinations";
import { primaryLinkClass } from "@/lib/primary-link-styles";
import { isPartnerApiTermsPageEnabled } from "@/lib/reports/accountability-pages";

type Props = {
  /** Which surface the reader is on — copy points to the sibling view. */
  variant: "government" | "browse";
};

/**
 * Short on-page explainer: one catalogue in the database, two public default filters.
 */
export function PromiseCatalogueSurfacesCallout({ variant }: Props) {
  const showPartnerPage = isPartnerApiTermsPageEnabled();
  return (
    <aside
      className="mx-auto mt-6 max-w-3xl rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-4 text-sm leading-relaxed text-[var(--muted-foreground)] shadow-sm sm:px-5"
      aria-label="How this page relates to the public accountability catalogue"
    >
      {variant === "government" ? (
        <p>
          This page shows only rows tagged as <strong className="text-[var(--foreground)]">government programmes</strong>{" "}
          in our editorial system — the same underlying records as MP pledge sheets when a member is linked, with one
          shared status. For the full searchable list for sitting MPs, open{" "}
          <Link href={ACCOUNTABILITY_CATALOGUE_ROUTES.browseAllPromises} className={`${primaryLinkClass} font-semibold`}>
            {accountabilityCatalogueNavMedium.browseAll}
          </Link>
          . Methodology:{" "}
          <Link href="/methodology" className={`${primaryLinkClass} font-semibold`}>
            Accountability methodology
          </Link>
          .
        </p>
      ) : (
        <>
          <p>
            By default this page lists commitments we track for <strong className="text-[var(--foreground)]">active MPs</strong>{" "}
            (plus your filters). Rows tagged as government programmes also appear on{" "}
            <Link href={ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments} className={`${primaryLinkClass} font-semibold`}>
              {accountabilityCatalogueNavMedium.government}
            </Link>{" "}
            — same data, national programme lens. CSV export matches these filters; expand below for the public JSON
            endpoint.
          </p>
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
              ). Rate limits and cache headers match the public programme.
            </p>
          </details>
        </>
      )}
    </aside>
  );
}

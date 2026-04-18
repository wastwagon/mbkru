import Link from "next/link";

import {
  ACCOUNTABILITY_CATALOGUE_ROUTES,
  accountabilityCatalogueNavMedium,
} from "@/config/accountability-catalogue-destinations";

type Props = {
  /** Which surface the reader is on — copy points to the sibling view. */
  variant: "government" | "browse";
};

/**
 * Short on-page explainer: one catalogue in the database, two public default filters.
 */
export function PromiseCatalogueSurfacesCallout({ variant }: Props) {
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
          <Link href={ACCOUNTABILITY_CATALOGUE_ROUTES.browseAllPromises} className="font-semibold text-[var(--primary)] hover:underline">
            {accountabilityCatalogueNavMedium.browseAll}
          </Link>
          . Methodology:{" "}
          <Link href="/methodology" className="font-semibold text-[var(--primary)] hover:underline">
            Accountability methodology
          </Link>
          .
        </p>
      ) : (
        <p>
          By default this page lists commitments we track for <strong className="text-[var(--foreground)]">active MPs</strong>{" "}
          (plus your filters). Rows tagged as government programmes also appear on{" "}
          <Link
            href={ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments}
            className="font-semibold text-[var(--primary)] hover:underline"
          >
            {accountabilityCatalogueNavMedium.government}
          </Link>{" "}
          — same data, national programme lens. Exports and{" "}
          <code className="rounded bg-[var(--section-light)] px-1 text-[13px] text-[var(--foreground)]">GET /api/promises</code>{" "}
          mirror these filters.
        </p>
      )}
    </aside>
  );
}

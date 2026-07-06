import Link from "next/link";

import { GhanaRegionsReportHeatMap } from "@/components/transparency/GhanaRegionsReportHeatMap";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";
import { isPublicVoiceStatisticsEnabled } from "@/lib/reports/accountability-pages";
import { getCitizenReportAnalytics } from "@/lib/server/citizen-report-analytics";

type Props = {
  regionSlug: string;
  regionName: string;
};

/** Regional Voice volume map — reuses `/transparency` heat map with this region highlighted. */
export async function RegionVoiceActivitySection({ regionSlug, regionName }: Props) {
  if (!isPublicVoiceStatisticsEnabled() || !isDatabaseConfigured()) return null;

  const analytics = await getCitizenReportAnalytics(12);
  const regionRow = analytics.byRegion.find((r) => r.regionSlug === regionSlug);
  const regionCount = regionRow?.count ?? 0;

  return (
    <section className="section-spacing pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm leading-relaxed text-[var(--foreground-secondary)]">
          <span className="font-semibold text-[var(--foreground)]">{regionName}</span> has{" "}
          <span className="font-semibold tabular-nums text-[var(--primary)]">{regionCount}</span> tagged Voice report
          {regionCount === 1 ? "" : "s"} in the last {analytics.windowMonths} months (training/demo rows excluded in
          production). Compare with other regions on the map or open{" "}
          <Link href="/transparency" className={primaryNavLinkClass}>
            full transparency stats
          </Link>
          .
        </div>
        <GhanaRegionsReportHeatMap regions={analytics.byRegion} highlightSlug={regionSlug} />
      </div>
    </section>
  );
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { VoiceStatisticsDashboard } from "@/components/transparency/VoiceStatisticsDashboard";
import { PageHeader } from "@/components/ui/PageHeader";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { pageHeaderPresets } from "@/lib/page-header-presets";
import { isPublicVoiceStatisticsEnabled } from "@/lib/reports/accountability-pages";
import { getCitizenReportAnalytics } from "@/lib/server/citizen-report-analytics";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Voice statistics",
  description:
    "Aggregate MBKRU Voice reporting statistics — counts by kind, status, and region. No personal data or report text.",
};

export default async function TransparencyPage() {
  if (!isPublicVoiceStatisticsEnabled() || !isDatabaseConfigured()) notFound();

  const analytics = await getCitizenReportAnalytics(12);
  const preset = pageHeaderPresets.transparency;

  return (
    <div>
      <PageHeader
        title="Voice statistics"
        description="Aggregated, non-identifying counts from reports received through MBKRU Voice and related channels. Trends, regional heat map, and workflow breakdown — updated on each page load."
        breadcrumbCurrentLabel="Transparency"
        eyebrow={preset.eyebrow}
        heroImage={preset.heroImage}
        heroImageAlt={preset.heroImageAlt}
        lastUpdated={analytics.generatedAt}
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16 pt-10">
        <VoiceStatisticsDashboard analytics={analytics} />
      </section>
    </div>
  );
}

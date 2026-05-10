import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RegionDetailContent } from "@/components/regions/RegionDetailContent";
import { RegionReportCardsSection } from "@/components/regions/RegionReportCardsSection";
import { RegionModalEngagementLinks } from "@/components/ui/RegionModalEngagementLinks";
import { PageHeader } from "@/components/ui/PageHeader";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { ghanaRegionSlugFromDisplayName } from "@/lib/geo/ghana-region-slug";
import { isReportCardPublicEnabled } from "@/lib/reports/accountability-pages";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";
import { ghanaRegionsData } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export const maxDuration = 120;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    year?: string;
    q?: string;
    page?: string;
    vq?: string;
    vpage?: string;
    vkind?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = raw.trim().toLowerCase();
  const staticRegion = ghanaRegionsData.find((r) => ghanaRegionSlugFromDisplayName(r.name) === slug);
  if (!staticRegion) {
    return { title: "Region" };
  }
  return {
    title: `${staticRegion.name} · Regional hub`,
    description: `${staticRegion.name} — population, MBKRU engagement, regional chat, and People's Report Card activity scoped to this region.`,
  };
}

export default async function RegionHubPage({ params, searchParams }: Props) {
  const { slug: raw } = await params;
  const slug = raw.trim().toLowerCase();
  if (!slug) notFound();

  const staticRegion = ghanaRegionsData.find((r) => ghanaRegionSlugFromDisplayName(r.name) === slug);
  if (!staticRegion) notFound();

  const dbRegion =
    isDatabaseConfigured() ?
      await prisma.region.findUnique({
        where: { slug },
        select: { id: true, name: true },
      })
    : null;

  const reportBrowseEnabled = isReportCardPublicEnabled() || isCitizensVoiceEnabled();

  return (
    <div>
      <PageHeader
        title={staticRegion.name}
        description={`Regional capital ${staticRegion.capital}. Explore MBKRU engagement plans, connect with others in this region, and browse People&apos;s Report Card items scoped here.`}
      />

      <section className="section-spacing section-full bg-[var(--section-light)] pb-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-8 text-sm text-[var(--muted-foreground)]">
            <Link href="/about#key-operational-pillars" className={primaryNavLinkClass}>
              ← Ghana regions map
            </Link>
          </nav>
          <RegionDetailContent region={staticRegion} />
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 pb-12 sm:px-6 lg:px-8">
        <RegionModalEngagementLinks regionSlug={slug} />
      </div>

      {dbRegion && reportBrowseEnabled ? (
        <RegionReportCardsSection
          regionSlug={slug}
          regionId={dbRegion.id}
          regionName={dbRegion.name}
          searchParams={searchParams}
        />
      ) : null}

      {dbRegion && !reportBrowseEnabled ? (
        <section className="section-spacing pb-16">
          <div className="mx-auto max-w-3xl px-4 text-center text-sm text-[var(--muted-foreground)] sm:px-6 lg:px-8">
            People&apos;s Report Card browse is not enabled on this deployment. Open{" "}
            <Link href="/about#key-operational-pillars" className={primaryNavLinkClass}>
              regional context
            </Link>{" "}
            above for MBKRU plans in {staticRegion.name}.
          </div>
        </section>
      ) : null}

      {!dbRegion ? (
        <section className="section-spacing pb-16">
          <div className="mx-auto max-w-3xl px-4 text-center text-sm text-[var(--muted-foreground)] sm:px-6 lg:px-8">
            Regional Report Card filters need this region in the database (run migrations / seed). Static facts and hub links
            above still apply.
          </div>
        </section>
      ) : null}
    </div>
  );
}

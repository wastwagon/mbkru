import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RegionCommunitiesSpotlight } from "@/components/regions/RegionCommunitiesSpotlight";
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
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-6 text-sm text-[var(--foreground-secondary)]">
            <Link href="/about#key-operational-pillars" className={primaryNavLinkClass}>
              ← Ghana regions map
            </Link>
          </nav>
          <p className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm leading-relaxed text-[var(--foreground-secondary)]">
            Independent civic monitoring scoped to {staticRegion.name} — Voice reports, Report Card scores, and community
            spaces linked to traditional areas. Not an official government channel.{" "}
            <Link href="/methodology" className={primaryNavLinkClass}>
              Methodology
            </Link>
          </p>
          <p className="mt-4 hidden flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--foreground-secondary)] sm:flex">
            <Link href="/parliament-tracker" className={primaryNavLinkClass}>
              Parliament tracker
            </Link>
            <span className="text-[var(--foreground-secondary)]/50" aria-hidden>
              ·
            </span>
            <Link href="/communities" className={primaryNavLinkClass}>
              Communities
            </Link>
            <span className="text-[var(--foreground-secondary)]/50" aria-hidden>
              ·
            </span>
            <Link href="/citizens-voice" className={primaryNavLinkClass}>
              MBKRU Voice
            </Link>
          </p>
          <div className="mt-8">
            <RegionDetailContent region={staticRegion} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-8 px-4 pb-12 sm:px-6 lg:px-8">
        {dbRegion ? (
          <RegionCommunitiesSpotlight regionSlug={slug} regionName={staticRegion.name} />
        ) : null}
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
          <div className="mx-auto max-w-3xl px-4 text-center text-sm text-[var(--foreground-secondary)] sm:px-6 lg:px-8">
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
          <div className="mx-auto max-w-3xl px-4 text-center text-sm text-[var(--foreground-secondary)] sm:px-6 lg:px-8">
            Regional Report Card filters need this region in the database (run migrations / seed). Static facts and hub links
            above still apply.
          </div>
        </section>
      ) : null}
    </div>
  );
}

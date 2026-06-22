"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo } from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { sectionRevealTransition } from "@/lib/motion-reveal";
import { primaryLinkClass, primaryNavLinkClass } from "@/lib/primary-link-styles";
import { buildHomeHeroGlanceStats } from "@/lib/home-hero-glance-stats";
import { formatPublishedNewsCount, newsArchiveLinkLabel } from "@/lib/public-news-copy";
import type { PublicNewsItem } from "@/lib/public-news-catalog";
import { HomeDataProvenanceRibbon } from "@/components/home/HomeDataProvenanceRibbon";
import { HomeHeroSlider } from "@/components/home/HomeHeroSlider";
import { HomeTrustStrip } from "@/components/home/HomeTrustStrip";
import { HomeParticipateHub } from "@/components/home/HomeParticipateHub";
import { AccountabilityHomePreview } from "@/components/home/AccountabilityHomePreview";
import { FindYourRepresentative } from "@/components/accountability/FindYourRepresentative";
import type { RepresentativeSearchRow } from "@/components/accountability/FindYourRepresentative";
import { OperationalPillarsRegionsSection } from "@/components/operational-pillars/OperationalPillarsRegionsSection";
import type { HomeAtAGlanceData } from "@/lib/home-at-a-glance-types";
import type { GovernmentCommitmentsHomePreview as GovernmentCommitmentsHomePreviewData } from "@/lib/home-government-preview-types";

export type HomePageNewsItem = PublicNewsItem;

export function HomePageClient({
  newsCatalog,
  accountabilityPreview,
  atAGlance,
  mpRoster = [],
  showMpSearch = false,
}: {
  newsCatalog: PublicNewsItem[];
  accountabilityPreview: GovernmentCommitmentsHomePreviewData | null;
  atAGlance: HomeAtAGlanceData;
  mpRoster?: RepresentativeSearchRow[];
  showMpSearch?: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const totalNewsCount = newsCatalog.length;
  const heroNews = newsCatalog.slice(0, 2);
  const heroNewsSlugs = new Set(heroNews.map((p) => p.slug));
  const newsBeyondHero = newsCatalog.filter((p) => !heroNewsSlugs.has(p.slug));
  const glanceStats = useMemo(
    () => buildHomeHeroGlanceStats(atAGlance, accountabilityPreview?.stats, totalNewsCount),
    [atAGlance, accountabilityPreview?.stats, totalNewsCount],
  );

  return (
    <div>
      <HomeHeroSlider
        newsForSlides={heroNews}
        totalNewsCount={totalNewsCount}
        glanceStats={glanceStats}
      />

      <HomeTrustStrip />

      <HomeDataProvenanceRibbon />

      <HomeParticipateHub data={atAGlance} showLiveHighlights={false} showLiveTools />

      {showMpSearch ? (
        <section className="section-spacing section-full border-t border-[var(--border)] bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FindYourRepresentative rows={mpRoster} variant="prominent" />
          </div>
        </section>
      ) : null}

      {accountabilityPreview ? <AccountabilityHomePreview data={accountabilityPreview} /> : null}

      <OperationalPillarsRegionsSection showPillars={false} id="ghana-regions" />

      {newsBeyondHero.length > 0 ? (
        <section className="section-spacing section-full border-t border-[var(--border)] bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px 0px" }}
              transition={sectionRevealTransition(reducedMotion, 0.04)}
              className="flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-between"
            >
              <div>
                <span className="inline-block rounded bg-[var(--primary)]/10 px-3 py-1.5 text-sm font-medium text-[var(--primary)]">
                  Latest
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
                  More news
                </h2>
                <p className="mt-2 text-sm text-[var(--foreground-secondary)]">
                  {newsBeyondHero.length} of {totalNewsCount} {totalNewsCount === 1 ? "story" : "stories"} on the
                  newsroom — {heroNews.length} also in the hero above.
                </p>
              </div>
              <Link
                href="/news"
                className={`${primaryNavLinkClass} shrink-0 gap-2 text-sm font-semibold hover:text-[var(--primary-dark)]`}
              >
                {newsArchiveLinkLabel(totalNewsCount)}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {newsBeyondHero.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px 0px" }}
                  transition={sectionRevealTransition(reducedMotion, i * 0.05)}
                  whileHover={reducedMotion ? undefined : { y: -2 }}
                >
                  <Link
                    href={article.href}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:border-[var(--primary)]/20 hover:shadow-[var(--shadow-card-hover)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <span className="text-xs font-medium text-[var(--foreground-secondary)]">{article.dateLabel}</span>
                      <h3 className="mt-1 font-display text-base font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] sm:text-lg">
                        {article.title}
                      </h3>
                      {article.excerpt ? (
                        <p className="mt-2 line-clamp-2 flex-1 text-sm text-[var(--foreground-secondary)]">
                          {article.excerpt}
                        </p>
                      ) : null}
                      <span className="mt-3 text-sm font-semibold text-[var(--primary)]">Read more →</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ) : totalNewsCount > 0 ? (
        <section className="border-t border-[var(--border)] bg-[var(--section-light)]/50 py-8">
          <p className="text-center text-sm text-[var(--foreground-secondary)]">
            All {totalNewsCount} {totalNewsCount === 1 ? "story is" : "stories are"} featured in the hero.{" "}
            <Link href="/news" className={primaryLinkClass}>
              {newsArchiveLinkLabel(totalNewsCount)}
            </Link>
          </p>
        </section>
      ) : (
        <section className="border-t border-[var(--border)] bg-[var(--section-light)]/50 py-8">
          <p className="text-center text-sm text-[var(--foreground-secondary)]">
            {formatPublishedNewsCount(0)} — updates will appear in the hero and on the{" "}
            <Link href="/news" className={primaryLinkClass}>
              News
            </Link>{" "}
            page when published.
          </p>
        </section>
      )}
    </div>
  );
}

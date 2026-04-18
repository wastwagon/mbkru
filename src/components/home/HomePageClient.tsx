"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { HomeHeroSlider } from "@/components/home/HomeHeroSlider";
import { LivePlatformStrip } from "@/components/home/LivePlatformStrip";
import { getPublicPlatformPhase, platformFeatures } from "@/config/platform";
import { homepageEngagementPathways, mbkruStrategicContent } from "@/lib/site-content";
import { GovernmentCommitmentsHomePreview } from "@/components/home/GovernmentCommitmentsHomePreview";
import { HomeDataProvenanceRibbon } from "@/components/home/HomeDataProvenanceRibbon";
import { HomeParticipateHub } from "@/components/home/HomeParticipateHub";
import { PromisesBrowseHomePreview } from "@/components/home/PromisesBrowseHomePreview";
import { OperationalPillarsRegionsSection } from "@/components/operational-pillars/OperationalPillarsRegionsSection";
import type { HomeAtAGlanceData } from "@/lib/home-at-a-glance-types";
import type { GovernmentCommitmentsHomePreview as GovernmentCommitmentsHomePreviewData } from "@/lib/home-government-preview-types";
import type { PromisesBrowseHomePreview as PromisesBrowseHomePreviewData } from "@/lib/home-promises-browse-preview-types";
export type HomePageNewsItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  image: string;
  dateLabel: string;
};

function HomeProgrammePathwaysSection({ phase }: { phase: ReturnType<typeof getPublicPlatformPhase> }) {
  const items = homepageEngagementPathways.filter((item) => {
    if (item.href === "/communities" && !platformFeatures.communities(phase)) return false;
    if (item.href === "/town-halls" && !platformFeatures.townHallDirectory(phase)) return false;
    return true;
  });

  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item, i) => (
        <motion.div
          key={item.href}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.06 }}
        >
          <Link
            href={item.href}
            className="group flex h-full flex-col rounded-xl border border-[var(--border)] bg-white p-6 text-left shadow-[var(--shadow-card)] transition-all duration-300 hover:border-[var(--primary)]/20 hover:shadow-[var(--shadow-card-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/20"
          >
            <span className="inline-block w-fit rounded-lg bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
              {item.tag}
            </span>
            <h3 className="mt-3 font-display text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)]">
              {item.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted-foreground)]">{item.description}</p>
            <span className="mt-4 text-sm font-semibold text-[var(--primary)]">
              Open
              <span aria-hidden className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

export function HomePageClient({
  cmsPosts,
  governmentPreview,
  promisesBrowsePreview,
  atAGlance,
}: {
  cmsPosts: HomePageNewsItem[];
  governmentPreview: GovernmentCommitmentsHomePreviewData | null;
  promisesBrowsePreview: PromisesBrowseHomePreviewData | null;
  atAGlance: HomeAtAGlanceData;
}) {
  const phase = getPublicPlatformPhase();

  return (
    <div>
      {/* Hero — 3-slide carousel: brand + two latest news (or news placeholders) */}
      <HomeHeroSlider newsForSlides={cmsPosts.slice(0, 2)} />

      <LivePlatformStrip />

      <HomeDataProvenanceRibbon />

      {/* Who we are — short intro; full story on About (matches Participate / pathways density) */}
      <section
        id="executive-summary"
        className="section-full border-b border-[var(--border)] bg-gradient-to-b from-[var(--section-light)] to-white py-10 sm:py-12"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
              {mbkruStrategicContent.legalName}
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
              {mbkruStrategicContent.homepageWhoWeAreHeading}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
              {mbkruStrategicContent.homepageWhoWeAreLead}
            </p>
            <p className="mt-4 text-sm text-[var(--muted-foreground)]">
              Executive summary, vision, mission, and pillars are on{" "}
              <Link href="/about#executive-summary" className="font-semibold text-[var(--primary)] hover:underline">
                About
              </Link>
              .
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button href="/about">About MBKRU</Button>
              <Button href="/contact" variant="outline">
                Get in touch
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <HomeParticipateHub data={atAGlance} showLiveHighlights={false} />

      {governmentPreview ? <GovernmentCommitmentsHomePreview data={governmentPreview} /> : null}

      {promisesBrowsePreview ? <PromisesBrowseHomePreview data={promisesBrowsePreview} /> : null}

      <OperationalPillarsRegionsSection />

      {/* Programme pathways — stakeholder entry points (replaces quarter roadmap cards on the homepage) */}
      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="inline-block rounded bg-[var(--primary)]/10 px-3 py-1.5 text-sm font-medium text-[var(--primary)]">
              Explore
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl lg:text-4xl">
              Programme pathways
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[var(--muted-foreground)]">
              Jump straight into Voice, accountability tools, provenance, methodology, and partnerships. These cards are
              navigation — not a delivery calendar.
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-[var(--muted-foreground)]">
              Key operational pillars and the regional map are above. For the full programme story and long-range
              planning narrative, read{" "}
              <Link href="/about" className="font-medium text-[var(--primary)] hover:underline">
                About
              </Link>{" "}
              (including the same pillars section at{" "}
              <Link href="/about#key-operational-pillars" className="font-medium text-[var(--primary)] hover:underline">
                #key-operational-pillars
              </Link>
              ). Quarter-by-quarter milestones for funders remain in programme documentation referenced from About and
              Data sources.
            </p>
          </motion.div>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-[var(--muted-foreground)]">
            Need a conversation?{" "}
            <Link href="/contact" className="font-medium text-[var(--primary)] hover:underline">
              Contact
            </Link>{" "}
            the coordination desk.
          </p>
          {phase >= 3 ? (
            <p className="mx-auto mt-4 max-w-2xl rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/[0.06] px-4 py-3 text-center text-sm leading-relaxed text-[var(--foreground)]">
              <span className="font-semibold">This site is running Phase 3 of our public roll-out</span>{" "}
              <span className="text-[var(--muted-foreground)]">
                — so election observation, communities, petitions, and full accountability browsing can appear here when
                enabled. That is independent of any printed programme calendar your team keeps for board reporting.
              </span>
            </p>
          ) : phase === 2 ? (
            <p className="mx-auto mt-4 max-w-2xl rounded-xl border border-[var(--border)] bg-white/80 px-4 py-3 text-center text-sm leading-relaxed text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--foreground)]">Phase 2 build</span> — Voice, accounts, and
              accountability data can be live on this site while programme communications still use their own planning
              calendar.
            </p>
          ) : null}
          <HomeProgrammePathwaysSection phase={phase} />
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button href="/about" variant="outline">
              Full programme on About
            </Button>
            <Button href="/contact">
              Contact the team
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </div>
        </div>
      </section>

      {/* News — only published CMS posts (passed from server) */}
      <section className="section-spacing section-full bg-white">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <span className="inline-block rounded bg-[var(--primary)]/10 px-3 py-1.5 text-sm font-medium text-[var(--primary)]">
              Latest
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
              News
            </h2>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Press releases and advocacy updates from MBKRU.
            </p>
          </motion.div>
          {cmsPosts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--section-light)]/60 px-6 py-16 text-center">
              <p className="text-[var(--muted-foreground)]">No published news posts yet.</p>
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                The{" "}
                <Link href="/news" className="font-medium text-[var(--primary)] hover:underline">
                  News
                </Link>{" "}
                page will list updates once editors publish from Admin → Posts.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="group"
              >
                <Link href={`/news/${cmsPosts[0].slug}`} className="block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <Image
                      src={cmsPosts[0].image}
                      alt={cmsPosts[0].title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
                      <span className="mb-2 text-sm font-medium text-[var(--accent-gold)]">{cmsPosts[0].dateLabel}</span>
                      <h3 className="font-display text-xl font-bold leading-tight text-white sm:text-2xl">
                        {cmsPosts[0].title}
                      </h3>
                      {cmsPosts[0].excerpt ? (
                        <p className="mt-2 line-clamp-2 text-sm text-white/90">{cmsPosts[0].excerpt}</p>
                      ) : null}
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--accent-gold)]">
                        Read more
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
              <div className="flex flex-col gap-6">
                {cmsPosts.slice(1, 3).map((article, i) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={`/news/${article.slug}`}
                      className="group flex flex-col rounded-xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:border-[var(--primary)]/20 hover:shadow-[var(--shadow-card-hover)] sm:flex-row sm:gap-6"
                    >
                      <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-lg sm:h-32 sm:w-40">
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, 160px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-[var(--muted-foreground)]">{article.dateLabel}</span>
                        <h3 className="mt-1 font-display text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)]">
                          {article.title}
                        </h3>
                        {article.excerpt ? (
                          <p className="mt-2 line-clamp-2 text-sm text-[var(--muted-foreground)]">{article.excerpt}</p>
                        ) : null}
                        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)]">
                          Learn more
                          <svg
                            className="h-4 w-4 transition-transform group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
                {cmsPosts.length < 2 ? (
                  <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--section-light)]/50 p-8 text-center text-sm text-[var(--muted-foreground)]">
                    More posts will appear here once published.
                  </div>
                ) : null}
              </div>
            </div>
          )}
          <div className="mt-8 text-center">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-dark)]"
            >
              View all news & updates
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

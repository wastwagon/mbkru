"use client";

import { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { HomeHeroSlider } from "@/components/home/HomeHeroSlider";
import { LivePlatformStrip } from "@/components/home/LivePlatformStrip";
import { getPublicPlatformPhase, platformFeatures } from "@/config/platform";
import {
  homepageEngagementPathways,
  images,
  mbkruStrategicContent,
  pillarImages,
} from "@/lib/site-content";
import { RegionsViz } from "@/components/ui/RegionsViz";
import { GovernmentCommitmentsHomePreview } from "@/components/home/GovernmentCommitmentsHomePreview";
import { HomeDataProvenanceRibbon } from "@/components/home/HomeDataProvenanceRibbon";
import { HomeParticipateHub } from "@/components/home/HomeParticipateHub";
import { HomePromisesBrowseDashboard } from "@/components/home/HomePromisesBrowseDashboard";
import type { GovernmentCommitmentsHomePreview as GovernmentCommitmentsHomePreviewData } from "@/lib/home-government-preview-types";
import type { HomeAtAGlanceData } from "@/lib/home-at-a-glance-types";

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
  atAGlance,
}: {
  cmsPosts: HomePageNewsItem[];
  governmentPreview: GovernmentCommitmentsHomePreviewData | null;
  atAGlance: HomeAtAGlanceData;
}) {
  const phase = getPublicPlatformPhase();
  const parliamentLive = platformFeatures.parliamentTrackerData(phase);

  const pillars = useMemo(
    () => [
      {
        letter: "A",
        title: "Digital Platform — MBKRU Voice",
        items: [
          "Secure membership portal (mbkru.org.gh)",
          "Personal dashboard",
          "Geo-tagged complaints",
          "Public statistics",
        ],
        href: "/citizens-voice",
        image: pillarImages[0].image,
        alt: pillarImages[0].alt,
      },
      {
        letter: "B",
        title: "Physical Engagement Network",
        items: ["Quarterly Town Hall Meetings", "Regional Public Forums", "Annual National People's Assembly"],
        href: platformFeatures.townHallDirectory(phase) ? "/town-halls" : "/situational-alerts",
        image: pillarImages[1].image,
        alt: pillarImages[1].alt,
      },
      {
        letter: "C",
        title: "Legal Empowerment Desk",
        items: ["Volunteer and partnered lawyers", "CHRAJ, police, courts guidance", "FOI requests", "Pro-bono referrals"],
        href: platformFeatures.legalEmpowermentDesk(phase) ? "/legal-empowerment" : "/about",
        image: pillarImages[2].image,
        alt: pillarImages[2].alt,
      },
      {
        letter: "D",
        title: "Accountability & Electoral Watch",
        items: [
          "People's Report Cards",
          "Campaign promise tracking",
          "Accountability Scorecards",
          "Citizen petition mechanism",
        ],
        href: "/parliament-tracker",
        image: pillarImages[3].image,
        alt: pillarImages[3].alt,
      },
      {
        letter: "E",
        title: "Direct Presidential Interface",
        items: ["Monthly Citizens' Brief", "Quarterly Presidential Listening Sessions", "Dedicated liaison office"],
        href: "/about",
        image: pillarImages[4].image,
        alt: pillarImages[4].alt,
      },
    ],
    [phase],
  );

  return (
    <div>
      {/* Hero — 3-slide carousel: brand + two latest news (or news placeholders) */}
      <HomeHeroSlider newsForSlides={cmsPosts.slice(0, 2)} />

      <LivePlatformStrip />

      <HomeDataProvenanceRibbon />

      <HomeParticipateHub data={atAGlance} />

      {/* Executive summary + Vision & Mission — same narrative order as About / programme doc */}
      <section
        id="executive-summary"
        className="section-full border-b border-[var(--border)] bg-[var(--section-light)] py-8 sm:py-10 lg:py-12"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-10">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[4/3] max-h-[22rem] overflow-hidden rounded-2xl shadow-lg lg:max-h-none lg:min-h-[20rem]"
            >
              <Image
                src={images.hero}
                alt="Citizens in discussion — illustrative photography"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="min-w-0"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                {mbkruStrategicContent.legalName}
              </p>
              <h2 className="mt-2 font-display text-xl font-bold text-[var(--foreground)] sm:text-2xl lg:text-3xl">
                Executive summary
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted-foreground)] sm:text-base">
                {mbkruStrategicContent.executiveSummaryParagraphs[0]}
              </p>
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                <Link href="/about#executive-summary" className="font-semibold text-[var(--primary)] hover:underline">
                  Continue on About
                </Link>{" "}
                for the full executive summary, restorative justice context, and pillar detail.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">Vision</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">{mbkruStrategicContent.vision}</p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">Mission</p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-[var(--foreground)]">
                    {mbkruStrategicContent.mission}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button href="/about" variant="primary">
                  Full programme on About
                </Button>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--primary)]/40"
                >
                  Get in Touch
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {governmentPreview ? <GovernmentCommitmentsHomePreview data={governmentPreview} /> : null}

      <HomePromisesBrowseDashboard />

      {/* Key Operational Pillars — dark section, zigzag glassmorphism cards */}
      <section className="relative section-spacing section-full overflow-hidden bg-[var(--section-dark)]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--section-dark)_0%,rgba(6,42,61,0.95)_50%,var(--section-dark)_100%)]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl xl:text-4xl">
              Key Operational Pillars
            </h2>
            <p className="mt-3 text-sm text-white/80">
              A direct bridge between citizens and government. Accountability, transparency, and citizen voice.
            </p>
          </motion.div>
          {/* Row 1 = 3 cards, Row 2 = 2 cards — all left-aligned */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-5">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={pillar.href}
                  className="group flex gap-4 rounded-xl border border-white/20 bg-white/5 p-4 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-[var(--accent-warm)]/50 hover:bg-white/10 sm:p-5"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-display text-lg font-bold ${i % 2 === 0 ? "text-[var(--accent-gold)]" : "text-[var(--accent-warm)]"}`}>
                    {pillar.letter}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="flex flex-wrap items-center gap-2 font-display text-base font-semibold text-white group-hover:text-[var(--accent-gold)] sm:text-lg">
                      <span>{pillar.title}</span>
                      {pillar.letter === "D" && parliamentLive ? (
                        <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-200">
                          Live data
                        </span>
                      ) : null}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/90">
                      {pillar.items.slice(0, 2).join(". ")}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          {/* 16 Regions data viz */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 lg:mt-10"
          >
            <RegionsViz />
          </motion.div>
        </div>
      </section>

      {/* Core objectives (document §4) + accountability bridge */}
      <section className="section-spacing section-full bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">Core objectives</p>
              <h2 className="mt-2 font-display text-lg font-bold text-[var(--foreground)] sm:text-xl lg:text-2xl">
                What we are building toward
              </h2>
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                Five concrete objectives — full wording on{" "}
                <Link href="/about#core-objectives" className="font-medium text-[var(--primary)] hover:underline">
                  About
                </Link>
                .
              </p>
              <ol className="mt-6 space-y-4 border-l-2 border-[var(--primary)]/25 pl-5">
                {mbkruStrategicContent.coreObjectives.map((obj, i) => (
                  <li key={i} className="text-sm leading-relaxed text-[var(--foreground)] sm:text-base">
                    <span className="font-display font-bold text-[var(--primary)]">{i + 1}. </span>
                    {obj}
                  </li>
                ))}
              </ol>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:sticky lg:top-24"
            >
              <h2 className="font-display text-lg font-bold text-[var(--foreground)] sm:text-xl lg:text-2xl">
                Accountability in practice
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
                {mbkruStrategicContent.homepageAccountabilityTeaser}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {parliamentLive ? (
                  <>
                    <Button href="/government-commitments" variant="primary">
                      Government commitments
                    </Button>
                    <Button href="/promises" variant="outline">
                      By MP
                    </Button>
                  </>
                ) : (
                  <Button href="/parliament-tracker" variant="primary">
                    Accountability hub
                  </Button>
                )}
                <Button href="/methodology" variant="outline">
                  Methodology
                </Button>
                <Button href="/about" variant="outline">
                  About
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Platform — citizen-centric advice (from About) */}
      <section className="section-spacing section-full bg-[var(--section-light-cream)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-base font-bold text-[var(--foreground)] sm:text-lg lg:text-xl lg:leading-tight">
                Our Platform Provides Citizen-Centric Advice to All Ghanaians
              </h2>
              <p className="mt-4 text-[var(--muted-foreground)] leading-relaxed">
                MBKRU connects citizens to national leadership through transparent channels for voice, tracking, and
                accountability. Coordinators, partners, and programme detail are summarised on{" "}
                <Link href="/about" className="font-semibold text-[var(--primary)] hover:underline">
                  About
                </Link>{" "}
                and across pillar pages.
              </p>
              <Button href="/citizens-voice" className="mt-6">
                Explore Our Platform
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8"
            >
              <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">Explore further</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                Pillar-by-pillar copy and links live on About; start here for the busiest public routes.
              </p>
              <ul className="mt-5 space-y-3 text-sm font-medium text-[var(--foreground)]">
                <li>
                  <Link href="/about" className="text-[var(--primary)] hover:underline">
                    About — pillars &amp; objectives
                  </Link>
                </li>
                <li>
                  <Link href="/citizens-voice" className="text-[var(--primary)] hover:underline">
                    MBKRU Voice
                  </Link>
                </li>
                {parliamentLive ? (
                  <li>
                    <Link href="/government-commitments" className="text-[var(--primary)] hover:underline">
                      Government commitments
                    </Link>
                  </li>
                ) : null}
                <li>
                  <Link href="/parliament-tracker" className="text-[var(--primary)] hover:underline">
                    Parliament tracker
                  </Link>
                </li>
                <li>
                  <Link href="/methodology" className="text-[var(--primary)] hover:underline">
                    Methodology
                  </Link>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

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
              For the full programme story, pillars, and long-range planning narrative, read{" "}
              <Link href="/about" className="font-medium text-[var(--primary)] hover:underline">
                About
              </Link>
              . Quarter-by-quarter milestones for funders remain in programme documentation referenced from About and
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

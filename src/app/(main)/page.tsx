"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { LivePlatformHeroChips, LivePlatformStrip } from "@/components/home/LivePlatformStrip";
import { RoadmapModal, type RoadmapPhase } from "@/components/ui/RoadmapModal";
import { getPublicPlatformPhase, platformFeatures } from "@/config/platform";
import { images, pillarImages, roadmapPlaceholders, heroContent, newsPlaceholders } from "@/lib/placeholders";
import { RegionsViz } from "@/components/ui/RegionsViz";
import { ObjectivesCarousel } from "@/components/ui/ObjectivesCarousel";

const trustStats = [
  { value: "5", label: "Operational Pillars" },
  { value: "16", label: "Regions of Ghana" },
  { value: "100%", label: "Non-Partisan" },
  { value: "SDG 1", label: "Poverty Eradication" },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

function RoadmapSection() {
  const [selectedPhase, setSelectedPhase] = useState<(typeof roadmapPlaceholders)[number] | null>(null);
  return (
    <>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
        {roadmapPlaceholders.map((item, i) => (
          <motion.button
            key={item.period + item.title}
            type="button"
            onClick={() => setSelectedPhase(item)}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="group flex flex-col rounded-xl border border-[var(--border)] bg-white p-6 text-left shadow-[var(--shadow-card)] transition-all duration-300 hover:border-[var(--primary)]/20 hover:shadow-[var(--shadow-card-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/20"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-lg bg-[var(--accent-gold)]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--accent-gold)]">
                {item.period}
              </span>
              {"phase" in item && (
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    item.status === "complete" ? "bg-green-100 text-green-800" : "bg-[var(--primary)]/10 text-[var(--primary)]"
                  }`}
                >
                  {item.phase} {item.status === "complete" ? "✓" : ""}
                </span>
              )}
            </div>
            <h3 className="mt-3 font-display text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)]">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
              {item.description}
            </p>
            {"items" in item && item.items && item.items.length > 0 && (
              <ul className="mt-4 flex-1 space-y-1.5 border-t border-[var(--border)] pt-4">
                {item.items.slice(0, 3).map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2 text-xs text-[var(--muted-foreground)]">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden />
                    <span>{bullet}</span>
                  </li>
                ))}
                {item.items.length > 3 && (
                  <li className="pt-1 text-xs font-medium text-[var(--primary)]">
                    +{item.items.length - 3} more · click for full details
                  </li>
                )}
              </ul>
            )}
          </motion.button>
        ))}
      </div>
      <RoadmapModal
        phase={selectedPhase as RoadmapPhase | null}
        onClose={() => setSelectedPhase(null)}
      />
    </>
  );
}

export default function Home() {
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

  const objectives = useMemo(
    () => [
      {
        title: "Restorative Justice & Reparations",
        description:
          "Equitable reparations for historical injustice, transforming resources into tangible benefits for communities.",
        href: "/about",
      },
      {
        title: "Accountability & Electoral Watch",
        description: "People's Report Cards, campaign promise tracking, and citizen petition mechanisms for recall.",
        href: parliamentLive ? "/promises" : "/parliament-tracker",
      },
      {
        title: "Direct Presidential Interface",
        description:
          "Monthly Citizens' Brief, Quarterly Presidential Listening Sessions, and dedicated liaison with the Presidency.",
        href: "/about",
      },
    ],
    [parliamentLive],
  );

  const platformHighlightCards = useMemo(
    () => [
      {
        icon: (
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v9m0 0v-9m0 0V5a7 7 0 0114 0v6z"
            />
          </svg>
        ),
        title: "Citizen Voice",
        description:
          "Secure national membership portal connecting every Ghanaian directly to the Presidency. Personal dashboards, geo-tagged complaints, and live public statistics.",
        href: "/citizens-voice",
      },
      {
        icon: (
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        ),
        title: "Physical Engagement",
        description:
          "Quarterly Town Hall Meetings, Regional Public Forums, and Annual National People's Assembly — bringing citizens face-to-face with decision-makers.",
        href: platformFeatures.townHallDirectory(phase) ? "/town-halls" : "/situational-alerts",
      },
      {
        icon: (
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        ),
        title: "Accountability Watch",
        description:
          "People's Report Cards, campaign promise tracking, and Accountability Scorecards. Citizen petition mechanisms for recall of non-performing officials.",
        href: "/parliament-tracker",
      },
      {
        icon: (
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
            />
          </svg>
        ),
        title: "Legal Empowerment",
        description:
          "Volunteer lawyers, step-by-step guidance for CHRAJ, police, courts. Template letters, FOI requests, and referrals to pro-bono and legal aid organizations.",
        href: platformFeatures.legalEmpowermentDesk(phase) ? "/legal-empowerment" : "/about",
      },
    ],
    [phase],
  );

  return (
    <div>
      {/* Hero — content right-aligned in glass containers */}
      <section className="relative -mt-[8.5rem] min-h-[55vh] overflow-hidden pt-[8.5rem]">
        <div className="absolute inset-0">
          <Image
            src={images.hero}
            alt="Community and civic engagement — placeholder"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--section-dark)]/98 via-[var(--section-dark)]/90 to-[var(--section-dark)]/85" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--section-dark)]/85 via-transparent to-[var(--section-dark)]/50" />
          <div className="absolute left-4 right-4 top-[8.25rem] h-px bg-gradient-to-r from-transparent via-[var(--accent-gold)]/40 to-transparent sm:left-6 sm:right-6 lg:left-8 lg:right-8" aria-hidden />
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-col items-start px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          {/* Main content card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-xl rounded-2xl border border-white/20 bg-white/5 p-5 shadow-xl backdrop-blur-md sm:p-6 lg:max-w-lg"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-gold)]/50 bg-[var(--accent-gold)]/15 px-3.5 py-1 text-xs font-medium tracking-wide text-[var(--accent-gold-bright)]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-gold)]" />
              MBKRU
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-2 font-logo text-lg font-bold leading-[1.2] tracking-tight text-white sm:text-xl lg:text-2xl xl:text-3xl"
            >
              {heroContent.tagline.split("President")[0]}
              <span className="text-[var(--accent-gold-bright)]">President</span>
              {heroContent.tagline.split("President")[1]}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-1.5 text-sm font-medium text-white/95 sm:text-base"
            >
              {heroContent.subhead}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-1 text-xs font-medium text-[var(--accent-gold-bright)]"
            >
              {heroContent.motto}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-4 flex flex-wrap gap-3"
            >
              <Button
                href="/contact"
                variant="primary"
                className="inline-flex items-center gap-2 bg-white text-[var(--section-dark)] hover:bg-white/90"
              >
                Get in Touch
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/50 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:border-white hover:bg-white/10"
              >
                Learn More
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
            <LivePlatformHeroChips />
          </motion.div>
          {/* Stats container */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="mt-4 flex flex-wrap items-center justify-start gap-x-6 gap-y-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 backdrop-blur-md sm:gap-x-8 sm:px-5"
          >
            {trustStats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-start">
                <span className="font-display text-lg font-bold tabular-nums text-white sm:text-xl">
                  {stat.value}
                </span>
                <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/70 sm:text-xs">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <LivePlatformStrip />

      {/* About — editorial layout: asymmetric grid (55/45) */}
      <section className="section-full bg-[var(--section-light)] py-10 sm:py-12 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-6 lg:grid-cols-[0.85fr_1fr] lg:gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative max-w-full lg:max-w-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg">
                <Image
                  src={images.hero}
                  alt="Citizens and community engagement — placeholder"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block rounded bg-[var(--primary)]/10 px-3 py-1.5 text-sm font-medium text-[var(--primary)]">
                About Us
              </span>
              <h2 className="mt-2 font-display text-lg font-bold text-[var(--foreground)] sm:text-xl lg:text-2xl">
                Guiding Ghana with purposeful strategic objectives
              </h2>
              <blockquote className="mt-3 border-l-4 border-[var(--accent-gold)] pl-5 font-logo text-lg font-semibold italic leading-relaxed text-[var(--foreground)] sm:text-xl">
                Restorative justice, accountability, and direct citizen voice at every level of governance.
              </blockquote>
              <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed text-[15px] sm:text-base">
                My Brother&apos;s Keeper Restoration United (MBKRU) proposes to transform itself into Ghana&apos;s premier
                independent, non-partisan citizens&apos; platform that connects ordinary Ghanaians directly to the highest
                levels of government.
              </p>
              <div className="mt-5">
                <Button href="/about" variant="primary">
                  Learn About Us
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

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
            <h2 className="font-display text-xl font-bold text-white sm:text-2xl lg:text-3xl">
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

      {/* How it works / Objectives — carousel + fixed content */}
      <section className="section-spacing section-full bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <ObjectivesCarousel objectives={objectives} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:sticky lg:top-24"
            >
              <span className="inline-block rounded bg-[var(--primary)]/10 px-3 py-1.5 text-sm font-medium text-[var(--primary)]">
                Our Commitment
              </span>
              <h2 className="mt-4 font-display text-lg font-bold text-[var(--foreground)] sm:text-xl lg:text-2xl">
                Strategic objectives for citizen empowerment
              </h2>
              <p className="mt-6 text-[var(--muted-foreground)] leading-relaxed">
                By building a transparent, technology-enabled communication bridge between the Presidency, Ministers,
                Parliament, and the people, MBKRU will ensure that elected officials are held strictly accountable to
                the promises they make and the needs of the citizens they serve.
              </p>
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
                MBKRU connects ordinary citizens directly to the highest levels of government. Our platform offers transparent, technology-enabled channels for filing complaints, tracking responses, and holding elected officials accountable to their promises.
              </p>
              <p className="mt-4 text-[var(--muted-foreground)] leading-relaxed">
                Our team of dedicated coordinators and partners brings experience across governance, legal empowerment, and citizen engagement. You can trust us to provide accurate, timely, and effective support for your concerns.
              </p>
              <Button href="/citizens-voice" className="mt-6">
                Explore Our Platform
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </motion.div>
            <div className="space-y-4">
              {platformHighlightCards.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    href={card.href}
                    className="group flex gap-4 rounded-xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-card)] transition-all duration-[400ms] hover:shadow-[var(--shadow-card-hover)]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                      {card.icon}
                    </div>
                    <div>
                      <h3 className="font-display text-base font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] sm:text-lg">
                        {card.title}
                      </h3>
                      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                        {card.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap / Timeline — placeholder */}
      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="inline-block rounded bg-[var(--primary)]/10 px-3 py-1.5 text-sm font-medium text-[var(--primary)]">
              What&apos;s Next
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl lg:text-4xl">
              Our Roadmap
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[var(--muted-foreground)]">
              Key milestones toward Ghana 2028 election. Accountability Scorecards published 90 days before.
            </p>
          </motion.div>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-[var(--muted-foreground)]">
            Client approval enables completing all phases on schedule. Click any card for full details.
          </p>
          <RoadmapSection />
          <div className="mt-10 text-center">
            <Button href="/contact">
              Discuss Phase Approval
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </div>
        </div>
      </section>

      {/* News & Updates — publications preview (featured left, 2 previews right) */}
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
              News & Updates
            </h2>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Press releases and advocacy updates from MBKRU.
            </p>
          </motion.div>
          <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-10">
            {/* Featured article — left */}
            {(() => {
              const featured = newsPlaceholders.find((n) => n.featured) ?? newsPlaceholders[0];
              return (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Link href={`/news/${featured.slug}`} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                      <Image
                        src={featured.image}
                        alt={featured.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
                        <span className="mb-2 text-sm font-medium text-[var(--accent-gold)]">{featured.date}</span>
                        <h3 className="font-display text-xl font-bold leading-tight text-white sm:text-2xl">
                          {featured.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm text-white/90">
                          {featured.excerpt}
                        </p>
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
              );
            })()}
            {/* 2 preview cards — right section */}
            <div className="flex flex-col gap-6">
              {newsPlaceholders
                .filter((n) => !n.featured)
                .slice(0, 2)
                .map((article, i) => (
                  <motion.div
                    key={article.slug}
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
                        <span className="text-sm font-medium text-[var(--muted-foreground)]">{article.date}</span>
                        <h3 className="mt-1 font-display text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)]">
                          {article.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm text-[var(--muted-foreground)]">
                          {article.excerpt}
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)]">
                          Learn more
                          <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
            </div>
          </div>
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

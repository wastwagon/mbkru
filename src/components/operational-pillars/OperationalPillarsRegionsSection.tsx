"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { RegionsViz } from "@/components/ui/RegionsViz";
import { accountabilityProse } from "@/config/accountability-catalogue-destinations";
import { getPublicPlatformPhase, platformFeatures } from "@/config/platform";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { sectionRevealTransition } from "@/lib/motion-reveal";

/**
 * Key operational pillars (A–E) + 16 regions map — rendered on About (`#key-operational-pillars`).
 */
export function OperationalPillarsRegionsSection() {
  const phase = getPublicPlatformPhase();
  const parliamentLive = platformFeatures.parliamentTrackerData(phase);
  const reducedMotion = usePrefersReducedMotion();

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
      },
      {
        letter: "B",
        title: "Physical Engagement Network",
        items: ["Quarterly Town Hall Meetings", "Regional Public Forums", "Annual National People's Assembly"],
        href: platformFeatures.townHallDirectory(phase) ? "/town-halls" : "/situational-alerts",
      },
      {
        letter: "C",
        title: "Legal Empowerment Desk",
        items: ["Volunteer and partnered lawyers", "CHRAJ, police, courts guidance", "FOI requests", "Pro-bono referrals"],
        href: platformFeatures.legalEmpowermentDesk(phase) ? "/legal-empowerment" : "/about",
      },
      {
        letter: "D",
        title: "Accountability & Electoral Watch",
        items: [
          "People's Report Cards",
          accountabilityProse.pillarHomeBullet,
          "Accountability Scorecards",
          "Citizen petition mechanism",
        ],
        href: "/parliament-tracker",
      },
      {
        letter: "E",
        title: "Direct Presidential Interface",
        items: ["Monthly Citizens' Brief", "Quarterly Presidential Listening Sessions", "Dedicated liaison office"],
        href: "/about",
      },
    ],
    [phase],
  );

  return (
    <section
      id="key-operational-pillars"
      className="relative section-spacing section-full overflow-hidden bg-[var(--section-dark)]"
    >
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,var(--section-dark)_0%,rgba(6,42,61,0.95)_50%,var(--section-dark)_100%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-48px 0px" }}
          transition={sectionRevealTransition(reducedMotion)}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl xl:text-4xl">
            Key Operational Pillars
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-[15px]">
            A direct bridge between citizens and government. Accountability, transparency, and citizen voice.
          </p>
        </motion.div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-12 lg:grid-cols-3 lg:gap-6">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={reducedMotion ? false : { opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-32px 0px" }}
              transition={sectionRevealTransition(reducedMotion, i * 0.06)}
              whileHover={reducedMotion ? undefined : { y: -3 }}
              whileTap={reducedMotion ? undefined : { scale: 0.99 }}
            >
              <Link
                href={pillar.href}
                className="group flex gap-4 rounded-xl border border-white/20 bg-white/5 p-4 shadow-lg backdrop-blur-md transition-[border-color,background-color,transform,box-shadow] duration-300 ease-out hover:border-[var(--accent-warm)]/50 hover:bg-white/10 sm:p-5"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-display text-lg font-bold ${i % 2 === 0 ? "text-[var(--accent-gold)]" : "text-[var(--accent-warm)]"}`}
                >
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
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px 0px" }}
          transition={sectionRevealTransition(reducedMotion, 0.06)}
          className="mt-10 lg:mt-12"
        >
          <RegionsViz />
        </motion.div>
      </div>
    </section>
  );
}

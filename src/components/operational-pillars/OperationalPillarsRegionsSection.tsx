"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getPublicPlatformPhase, platformFeatures } from "@/config/platform";
import { RegionsViz } from "@/components/ui/RegionsViz";

/**
 * Key operational pillars (A–E) + 16 regions map — rendered on About (`#key-operational-pillars`).
 */
export function OperationalPillarsRegionsSection() {
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
          "Campaign promise tracking",
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
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 lg:mt-10"
        >
          <RegionsViz />
        </motion.div>
      </div>
    </section>
  );
}

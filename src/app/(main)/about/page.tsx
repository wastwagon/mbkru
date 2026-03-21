import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { images, pillarImages, leadershipPlaceholders, registrationPlaceholder, advisoryPlaceholders, heroContent } from "@/lib/placeholders";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "My Brother's Keeper Restoration United (MBKRU) — Restorative justice and sustainable development in Ghana.",
};

const acronyms = [
  { abbr: "MBKRU", full: "My Brother's Keeper Restoration United" },
  { abbr: "MDCE", full: "Metropolitan/Municipal/District Chief Executive" },
  { abbr: "MP", full: "Member of Parliament" },
  { abbr: "CHRAJ", full: "Commission on Human Rights and Administrative Justice" },
  { abbr: "FOI", full: "Freedom of Information" },
  { abbr: "SDG 1", full: "Sustainable Development Goal 1 (No Poverty)" },
  { abbr: "NGO", full: "Non-Governmental Organization" },
];

const stats = [
  {
    value: "5",
    suffix: "+",
    label: "Operational Pillars",
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    value: "16",
    suffix: "+",
    label: "Regions of Ghana",
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0h.5a2.5 2.5 0 002.5-2.5V3.935M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    value: "100",
    suffix: "%",
    label: "Non-Partisan",
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    value: "SDG 1",
    suffix: "",
    label: "Poverty Eradication",
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
];

const coreObjectives = [
  "Establish a permanent, two-way communication channel between citizens and the Presidency.",
  "Create binding mechanisms that compel elected officials to respond to citizen complaints within defined timeframes.",
  "Provide free or low-cost legal navigation support to members facing bureaucratic injustice.",
  "Systematically monitor and publicly report on the performance of elected officials and government programs.",
  "Influence electoral outcomes by giving citizens credible, data-driven information on candidates' records and commitments.",
];

const pillars = [
  {
    title: "Digital Platform — MBKRU Voice",
    description: "Secure national membership portal connecting every Ghanaian directly to the Presidency. Personal dashboards, geo-tagged complaints, and live public statistics.",
    image: pillarImages[0].image,
    alt: pillarImages[0].alt,
    href: "/citizens-voice",
  },
  {
    title: "Physical Engagement Network",
    description: "Quarterly Town Hall Meetings, Regional Public Forums, and Annual National People's Assembly — bringing citizens face-to-face with decision-makers across all 16 regions.",
    image: pillarImages[1].image,
    alt: pillarImages[1].alt,
    href: "/situational-alerts",
  },
  {
    title: "Legal Empowerment Desk",
    description: "Panel of volunteer lawyers, step-by-step guidance for CHRAJ, police, and courts. Template letters, FOI requests, and referrals to pro-bono and legal aid organizations.",
    image: pillarImages[2].image,
    alt: pillarImages[2].alt,
    href: "/about",
  },
  {
    title: "Accountability & Electoral Watch",
    description: "People's Report Cards, real-time campaign promise tracking, and Accountability Scorecards. Citizen petition mechanisms for recall of non-performing officials.",
    image: pillarImages[3].image,
    alt: pillarImages[3].alt,
    href: "/parliament-tracker",
  },
  {
    title: "Direct Presidential Interface",
    description: "Monthly Citizens' Brief to the Presidency, Quarterly Presidential Listening Sessions, and a dedicated liaison office for MBKRU matters at the highest level.",
    image: pillarImages[4].image,
    alt: pillarImages[4].alt,
    href: "/citizens-voice",
  },
];

export default function AboutPage() {
  return (
    <div>
      <PageHeader
        title="About MBKRU"
        description={`My Brother's Keeper Restoration United — ${heroContent.tagline}. ${heroContent.motto}`}
      />

      {/* Section 1: Executive Summary — who we are (lead with overview) */}
      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-10">
            <div className="lg:order-1">
              <Badge variant="primary">Overview</Badge>
              <h2 className="mt-1.5 font-display text-lg font-bold text-[var(--foreground)] sm:text-xl lg:text-2xl">
                Executive Summary
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[var(--muted-foreground)]">
                My Brother&apos;s Keeper Restoration United (MBKRU) proposes to transform itself into Ghana&apos;s premier independent, non-partisan citizens&apos; platform that connects ordinary Ghanaians—especially the poor, rural, urban, and youth populations—directly to the highest levels of government.
              </p>
              <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)]">
                By building a transparent, technology-enabled communication bridge between the Presidency, Ministers, Parliament, and the people, MBKRU will ensure that elected officials are held strictly accountable to the promises they make and the needs of the citizens they serve.
              </p>
              <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)]">
                The ultimate goal is the systematic reduction and eventual eradication of extreme poverty in Ghana through sustained citizen pressure, real-time grievance redress, legal empowerment, and electoral accountability.
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[var(--shadow-card)] lg:order-2">
              <Image
                src={images.platform}
                alt="Citizens and community"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Our Mission — restorative justice & conduit role */}
      <section className="section-spacing section-full bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-10">
            <div>
              <Badge variant="warm">Mission</Badge>
              <h2 className="mt-1.5 font-display text-lg font-bold text-[var(--foreground)] sm:text-xl lg:text-2xl">
                Restorative Justice & Sustainable Development
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[var(--muted-foreground)]">
                To advance restorative justice and sustainable development in Ghana by facilitating equitable reparations for historical injustice, including the transatlantic slave trade and colonial exploitation. Through transparent governance, community empowerment, and strategic partnerships, we commit to transforming reparative resources into tangible benefits that uplift affected communities, preserve cultural heritage, and foster economic resilience for future generations.
              </p>
              <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)]">
                We serve as the official, trusted conduit between the President of the Republic and the ordinary people of Ghana, giving voice to the voiceless, protecting the vulnerable, and enforcing accountability at every level of governance.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-3">
                {stats.map(({ value, suffix, label, icon }) => (
                  <div
                    key={label}
                    className="rounded-lg border border-[var(--border)] bg-white p-2.5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:border-[var(--primary)]/20 hover:shadow-[var(--shadow-card)] sm:p-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--primary)]/10 text-[var(--primary)]">
                        {icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-lg font-bold tabular-nums leading-tight text-[var(--foreground)] sm:text-xl">
                          {value}
                          <span className="text-[var(--primary)]">{suffix}</span>
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-[var(--muted-foreground)]">{label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative isolate aspect-[4/3] overflow-hidden rounded-2xl shadow-[var(--shadow-card)]">
              <Image
                src={images.aboutMission}
                alt="Community and heritage"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Motto + Tagline + Core Objectives — premium combined layout */}
      <section className="relative section-spacing section-full overflow-hidden bg-[var(--section-dark)]">
        <div className="absolute inset-0 bg-[linear-gradient(160deg,var(--section-dark)_0%,rgba(212,160,23,0.15)_40%,var(--section-dark)_100%)]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-left">
            <blockquote className="font-logo text-base font-semibold italic leading-relaxed text-white/95 sm:text-lg">
              &ldquo;{heroContent.motto}.&rdquo;
            </blockquote>
            <Badge variant="outline" className="mt-1.5">Our Motto</Badge>
            <Badge variant="outlineGold" className="mt-5">Our Commitment</Badge>
            <h2 className="mt-2.5 font-display text-base font-bold text-white sm:text-lg lg:text-xl">
              Advocate for the Disenfranchised • Watchdog for Accountability • Catalyst for Poverty Eradication
            </h2>
            <p className="mt-2 text-xs text-white/80">
              Core objectives that guide our platform and partnerships
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
            {coreObjectives.map((obj, i) => (
              <div
                key={i}
                className="group relative flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:border-[var(--accent-warm)]/50 hover:bg-white/10 sm:p-5"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-display text-lg font-bold ${i % 2 === 0 ? "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]" : "bg-[var(--accent-warm)]/25 text-[var(--accent-warm)]"}`}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <p className="text-sm leading-relaxed text-white/90">
                  {obj}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Our Platform Pillars — how we deliver */}
      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="gold">How We Deliver</Badge>
            <h2 className="mt-3 font-display text-xl font-bold text-[var(--foreground)] sm:text-2xl lg:text-3xl">
              Our Platform Pillars
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
              MBKRU connects ordinary citizens directly to the highest levels of government through five operational pillars.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10">
            {pillars.map((pillar) => (
              <Link
                key={pillar.title}
                href={pillar.href}
                className="group relative flex overflow-visible rounded-xl bg-white p-4 shadow-[var(--shadow-card)] transition-all duration-[400ms] ease-in-out hover:shadow-[var(--shadow-card-hover)] sm:p-5"
              >
                <div className="flex-1 pr-4">
                  <h3 className="font-display text-base font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] sm:text-lg">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                    {pillar.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] transition-colors group-hover:text-[var(--primary-dark)]">
                    Learn More
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
                <div className="relative -mr-6 flex shrink-0 sm:-mr-8 lg:-mr-10">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-lg sm:h-24 sm:w-24 lg:h-28 lg:w-28">
                    <Image
                      src={pillar.image}
                      alt={pillar.alt}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Membership & Funding (two-column cards) */}
      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
              <h2 className="font-display text-lg font-bold text-[var(--foreground)] sm:text-xl">
                Membership & Governance
              </h2>
              <ul className="mt-3 space-y-1.5 text-[var(--muted-foreground)]">
                <li>• Open to all Ghanaian citizens of good character</li>
                <li>• No political party affiliation required or allowed at leadership level (strict non-partisanship)</li>
                <li>• National Executive Board elected by members every three years</li>
                <li>• Regional and District Coordinators</li>
                <li>• Fully transparent finances published quarterly</li>
              </ul>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
              <h2 className="font-display text-lg font-bold text-[var(--foreground)] sm:text-xl">
                Funding Model (Proposed)
              </h2>
              <ul className="mt-3 space-y-1.5 text-[var(--muted-foreground)]">
                <li>• Membership dues (symbolic GH¢10–20 per year)</li>
                <li>• Grants from development partners focused on governance and citizen engagement</li>
                <li>• Corporate social responsibility contributions (accountability & anti-poverty programs)</li>
                <li>• International foundations supporting democratic accountability</li>
              </ul>
            </div>
          </div>

          {/* Registration status — placeholder */}
          <div className="mt-8 rounded-xl border-2 border-[var(--primary)]/20 bg-[var(--muted)] p-4 sm:p-5">
            <h2 className="font-display text-lg font-bold text-[var(--foreground)] sm:text-xl">
              Registration Status
            </h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {registrationPlaceholder.status} — {registrationPlaceholder.number}. Regulated by {registrationPlaceholder.regulator}. Registered {registrationPlaceholder.date}.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6b: Leadership / Team */}
      <section className="section-spacing section-full bg-[var(--section-light-cream)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="primary">Our Team</Badge>
            <h2 className="mt-3 font-display text-xl font-bold text-[var(--foreground)] sm:text-2xl lg:text-3xl">
              Leadership
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
              The people behind MBKRU&apos;s mission for citizen voice and accountability.
            </p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {leadershipPlaceholders.map((person) => (
              <div
                key={person.role}
                className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-card-hover)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={person.image}
                    alt={`Photo of ${person.name}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">{person.name}</h3>
                  <p className="mt-1 text-sm font-medium text-[var(--primary)]">{person.role}</p>
                  <p className="mt-3 text-sm text-[var(--muted-foreground)]">{person.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6c: Advisory / Endorsements */}
      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-xl font-bold text-[var(--foreground)] sm:text-2xl">
              Advisory & Endorsements
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
              Voices in support of MBKRU&apos;s mission.
            </p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {advisoryPlaceholders.map((item, i) => (
              <blockquote
                key={i}
                className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6"
              >
                <p className="font-logo text-lg italic leading-relaxed text-[var(--foreground)]">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <footer className="mt-4 text-sm font-semibold text-[var(--primary)]">— {item.author}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7: Conclusion + Expected Impact — editorial flow */}
      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-xl font-bold text-[var(--foreground)] sm:text-2xl">
            Conclusion
          </h2>
          <p className="mt-4 text-[var(--muted-foreground)] leading-relaxed">
            Ghana&apos;s greatest untapped resource is the collective voice and energy of its people. For too long that voice has been fragmented, ignored, or drowned out. My Brother&apos;s Keeper Restoration United stands ready to organize that voice, amplify it, protect it, and channel it directly to the Presidency and every elected official.
          </p>
          <p className="mt-4 text-[var(--muted-foreground)] leading-relaxed">
            We believe that when the people and their leaders are in constant, structured, and accountable conversation, poverty cannot survive.
          </p>
          <p className="mt-4 font-semibold text-[var(--foreground)]">
            MBKRU is not another non-governmental organization (NGO). It is the People&apos;s Permanent Platform at the table of power.
          </p>
          <p className="mt-4 text-[var(--muted-foreground)]">
            We respectfully submit this concept for consideration and partnership with the Government of Ghana, civil society, development partners, and—most importantly—the citizens of our beloved country.
          </p>

          <div className="mt-10 rounded-xl border border-[var(--border)] bg-white/80 p-5 sm:p-6">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-[var(--foreground)]">
              Expected Impact
            </h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-2 text-sm text-[var(--muted-foreground)]">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-warm)]" />
                Drastic reduction in unresolved citizen complaints against government agencies
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-warm)]" />
                Measurable improvement in public service delivery (health, education, roads, water, sanitation)
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-warm)]" />
                Increased voter turnout and informed voting
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-warm)]" />
                Greater trust between government and citizens
              </li>
              <li className="flex gap-2 sm:col-span-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-warm)]" />
                Faster progress toward poverty eradication targets (SDG 1)
              </li>
            </ul>
          </div>

          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl">
            <Image
              src={images.about}
              alt="People and community"
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        </div>
      </section>

      {/* Section 9: Acronyms — enhanced quick reference */}
      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[var(--primary)]/20 bg-white/60 p-6 shadow-[var(--shadow-card)] sm:p-8">
            <Badge variant="primary">Quick Reference</Badge>
            <h2 className="mt-3 font-display text-xl font-bold text-[var(--foreground)] sm:text-2xl">
              Acronyms Used
            </h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              All acronyms have been fully spelled out on first use throughout the document.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {acronyms.map(({ abbr, full }) => (
                <div
                  key={abbr}
                  className="group flex items-start gap-4 rounded-xl border border-[var(--border)] bg-white px-4 py-3.5 shadow-sm transition-all duration-300 hover:border-[var(--primary)]/30 hover:shadow-[var(--shadow-card)]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 font-display text-sm font-bold text-[var(--primary)] transition-colors group-hover:bg-[var(--primary)]/20">
                    {abbr.slice(0, 2)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block font-semibold text-[var(--primary)]">{abbr}</span>
                    <span className="mt-0.5 block text-sm leading-snug text-[var(--muted-foreground)]">{full}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

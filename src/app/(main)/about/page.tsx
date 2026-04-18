import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AboutPlatformLinks } from "@/components/about/AboutPlatformLinks";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  ACCOUNTABILITY_CATALOGUE_ROUTES,
  accountabilityCatalogueNavMedium,
  accountabilityCatalogueNavShort,
} from "@/config/accountability-catalogue-destinations";
import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { images, mbkruStrategicContent, pillarImages, heroContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "About",
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
    description:
      "People's Report Cards, a public commitment catalogue with live filters, and Accountability Scorecards. Citizen petition mechanisms for recall of non-performing officials.",
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

export default async function AboutPage() {
  const phase = getServerPlatformPhase();
  const parliamentLive = platformFeatures.parliamentTrackerData(phase);

  return (
    <div>
      <PageHeader
        title="About MBKRU"
        description={`My Brother's Keeper Restoration United — ${heroContent.tagline}. ${heroContent.motto}`}
      />

      <AboutPlatformLinks />

      {/* Section 1: Executive Summary — who we are (lead with overview) */}
      <section id="executive-summary" className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-10">
            <div className="lg:order-1">
              <Badge variant="primary">Overview</Badge>
              <h2 className="mt-1.5 font-display text-lg font-bold text-[var(--foreground)] sm:text-xl lg:text-2xl">
                Executive Summary
              </h2>
              {mbkruStrategicContent.executiveSummaryParagraphs.map((para, i) => (
                <p key={i} className={`text-base leading-relaxed text-[var(--muted-foreground)] ${i > 0 ? "mt-4" : "mt-3"}`}>
                  {para}
                </p>
              ))}
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

      {/* Section 2: Vision & Mission — programme document order */}
      <section className="section-spacing section-full bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-10">
            <div>
              <Badge variant="primary">Vision</Badge>
              <h2 className="mt-1.5 font-display text-lg font-bold text-[var(--foreground)] sm:text-xl lg:text-2xl">
                The Ghana we work toward
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[var(--muted-foreground)]">{mbkruStrategicContent.vision}</p>
            </div>
            <div>
              <Badge variant="warm">Mission</Badge>
              <h2 className="mt-1.5 font-display text-lg font-bold text-[var(--foreground)] sm:text-xl lg:text-2xl">
                Restorative justice &amp; the presidential conduit
              </h2>
              <p className="mt-3 text-base font-medium leading-relaxed text-[var(--foreground)]">
                {mbkruStrategicContent.mission}
              </p>
              <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)]">
                {mbkruStrategicContent.missionRestorativeContext}
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
          </div>
          <div className="relative mx-auto mt-10 aspect-[21/9] max-w-4xl overflow-hidden rounded-2xl shadow-[var(--shadow-card)]">
            <Image
              src={images.aboutMission}
              alt="Community and heritage"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
        </div>
      </section>

      {/* Section 3: Motto + pillar tagline (objectives listed below on white) */}
      <section
        id="motto-pillar-intro"
        className="relative section-spacing section-full overflow-hidden bg-[var(--section-dark)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(160deg,var(--section-dark)_0%,rgba(212,160,23,0.15)_40%,var(--section-dark)_100%)]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-left">
            <blockquote className="font-logo text-base font-semibold italic leading-relaxed text-white/95 sm:text-lg">
              &ldquo;{heroContent.motto}.&rdquo;
            </blockquote>
            <Badge variant="outline" className="mt-1.5">Our Motto</Badge>
            <Badge variant="outlineGold" className="mt-5">Our Commitment</Badge>
            <h2 className="mt-2.5 font-display text-base font-bold text-white sm:text-lg lg:text-xl">
              {mbkruStrategicContent.pillarTagline}
            </h2>
            <p className="mt-2 text-xs text-white/80">
              Core objectives that guide our platform and partnerships — detailed list follows.
            </p>
          </div>
        </div>
      </section>

      {/* Core objectives + accountability (moved from homepage) */}
      <section id="core-objectives" className="section-spacing section-full bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">Core objectives</p>
              <h2 className="mt-2 font-display text-lg font-bold text-[var(--foreground)] sm:text-xl lg:text-2xl">
                What we are building toward
              </h2>
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                Five concrete objectives that anchor the programme document and this site.
              </p>
              <ol className="mt-6 space-y-4 border-l-2 border-[var(--primary)]/25 pl-5">
                {mbkruStrategicContent.coreObjectives.map((obj, i) => (
                  <li key={i} className="text-sm leading-relaxed text-[var(--foreground)] sm:text-base">
                    <span className="font-display font-bold text-[var(--primary)]">{i + 1}. </span>
                    {obj}
                  </li>
                ))}
              </ol>
            </div>
            <div className="lg:sticky lg:top-24">
              <h2 className="font-display text-lg font-bold text-[var(--foreground)] sm:text-xl lg:text-2xl">
                Accountability in practice
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
                {mbkruStrategicContent.homepageAccountabilityTeaser}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {parliamentLive ? (
                  <>
                    <Button href={ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments} variant="primary">
                      {accountabilityCatalogueNavMedium.government}
                    </Button>
                    <Button href={ACCOUNTABILITY_CATALOGUE_ROUTES.promisesByMp} variant="outline">
                      {accountabilityCatalogueNavShort.byMp}
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
                <Button href="#platform-pillars" variant="outline">
                  Platform pillars
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our platform + explore further (moved from homepage) */}
      <section className="section-spacing section-full bg-[var(--section-light-cream)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-10">
            <div>
              <h2 className="font-display text-base font-bold text-[var(--foreground)] sm:text-lg lg:text-xl lg:leading-tight">
                Our Platform Provides Citizen-Centric Advice to All Ghanaians
              </h2>
              <p className="mt-4 text-[var(--muted-foreground)] leading-relaxed">
                MBKRU connects citizens to national leadership through transparent channels for voice, tracking, and
                accountability. Coordinators, partners, and programme detail continue on this page and across pillar
                pages.
              </p>
              <Button href="/citizens-voice" className="mt-6">
                Explore Our Platform
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
              <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">Explore further</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                Pillar-by-pillar copy and links live below; start here for the busiest public routes.
              </p>
              <ul className="mt-5 space-y-3 text-sm font-medium text-[var(--foreground)]">
                <li>
                  <Link href="#platform-pillars" className="text-[var(--primary)] hover:underline">
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
                    <Link
                      href={ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments}
                      className="text-[var(--primary)] hover:underline"
                    >
                      {accountabilityCatalogueNavMedium.government}
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
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Our Platform Pillars — how we deliver */}
      <section id="platform-pillars" className="section-spacing section-full bg-[var(--section-light)]">
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

          <div className="mt-8 rounded-xl border-2 border-[var(--primary)]/20 bg-[var(--muted)] p-4 sm:p-5">
            <h2 className="font-display text-lg font-bold text-[var(--foreground)] sm:text-xl">
              Registration Status
            </h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Formal registration details are being finalised. The registration number will be listed here when issued,
              under the applicable Ghanaian regulator (for example Registrar General or Department of Social Welfare).
              Effective date to be confirmed.
            </p>
          </div>
        </div>
      </section>

      <section className="section-spacing section-full bg-[var(--section-light-cream)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="primary">Our Team</Badge>
            <h2 className="mt-3 font-display text-xl font-bold text-[var(--foreground)] sm:text-2xl lg:text-3xl">
              Leadership
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
              Public names, roles, and bios will be published when the roster is confirmed. We do not display stand-in
              profiles.
            </p>
          </div>
          <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-white/80 px-6 py-12 text-center text-sm text-[var(--muted-foreground)]">
            No leadership listings published yet.
          </div>
        </div>
      </section>

      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-xl font-bold text-[var(--foreground)] sm:text-2xl">
              Advisory & Endorsements
            </h2>
            <p className="mx-auto mt-4 text-left text-[var(--muted-foreground)] leading-relaxed">
              Formal endorsements and advisory quotes will appear here only when relationships are confirmed. We do not
              show sample quotations or unverified attributions.
            </p>
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

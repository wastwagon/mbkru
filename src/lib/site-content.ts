/**
 * MBKRU site content & bundled UI data
 *
 * Central place for illustrative imagery (`public/images/`), hero/brand copy, contact strings,
 * programme roadmap data (About / docs), homepage pathway cards, FAQ entries, and regional reference data.
 * Replace filenames here when production assets and verified text are ready.
 */

/** Wide civic / outdoor scene (1200×678) */
const IMG_WIDE_CIVIC =
  "604200028a3cf7a32efee05f918b846dcbed5db41a396098a4edc9f260a9ccd2-1200x678.webp";

/** Path under `public/images/` */
function pub(file: string) {
  return `/images/${file}`;
}

/**
 * Illustrative imagery — semantic categories for pages and cards (local assets)
 */
export const images = {
  /** Hero, CTA sections — broad civic / outdoor Ghana */
  hero: pub(IMG_WIDE_CIVIC),
  heroThumb: pub(IMG_WIDE_CIVIC),

  /** About, mission — heritage and culture */
  about: pub("130207142157-ghana-tourism-akan-dance.jpg"),
  aboutMission: pub("130207142157-ghana-tourism-akan-dance.jpg"),

  /** Platform preview — citizens and public engagement */
  platform: pub("191129141031-01-ghana-citizens-year-of-return.jpg"),

  /** Pillar A — Digital platform, connectivity */
  digital: pub("FQ4-3QqXMAAFN2d.jpeg.webp"),
  digitalThumb: pub("FQ4-3QqXMAAFN2d.jpeg.webp"),

  /** Pillar B — Festivals and large gatherings */
  community: pub("Afrochella_Festival_2019_1.jpg"),
  communityThumb: pub("Afrochella_Festival_2019_1.jpg"),

  /** Pillar C — Legal, justice */
  legal: pub("cf68ddd9c6f144d6f1181fe8d38ffd79.jpg"),
  legalThumb: pub("cf68ddd9c6f144d6f1181fe8d38ffd79.jpg"),

  /** Pillar D — Accountability, press, governance */
  accountability: pub("IMG_AIF65_Blame-Ekoue_003-2.jpg"),
  accountabilityThumb: pub("IMG_AIF65_Blame-Ekoue_003-2.jpg"),

  /** Pillar E — Diaspora bridge, leadership listening */
  leadership: pub("Ghana_Black_Americans_66881.jpg.avif"),
  leadershipThumb: pub("Ghana_Black_Americans_66881.jpg.avif"),

  /** Partners — collaboration */
  partnership: pub("32a127dcb0d1b5945184124693744fe2.jpg"),

  /** Diaspora / “17th Region” — Ghana and global Ghanaian community */
  diaspora: pub("Ghana_Black_Americans_66881.jpg.avif"),
  diasporaSummit: pub("Afrochella_Festival_2019_1.jpg"),

  /** News — media, press */
  news: pub("IMG_AIF65_Blame-Ekoue_003-2.jpg"),

  /** Resources — documents, research */
  resources: pub("cf68ddd9c6f144d6f1181fe8d38ffd79.jpg"),

  /** Landscape — wide outdoor / civic */
  landscape: pub(IMG_WIDE_CIVIC),
} as const;

/** Footer engagement gallery — 9 distinct images for 3×3 grid */
export const footerGalleryImages = [
  pub("Afrochella_Festival_2019_1.jpg"),
  pub("130207142157-ghana-tourism-akan-dance.jpg"),
  pub(IMG_WIDE_CIVIC),
  pub("191129141031-01-ghana-citizens-year-of-return.jpg"),
  pub("Ghana_Black_Americans_66881.jpg.avif"),
  pub("FQ4-3QqXMAAFN2d.jpeg.webp"),
  pub("32a127dcb0d1b5945184124693744fe2.jpg"),
  pub("cf68ddd9c6f144d6f1181fe8d38ffd79.jpg"),
  pub("IMG_AIF65_Blame-Ekoue_003-2.jpg"),
] as const;

/** Alt text for `footerGalleryImages` (same order) — accessibility */
export const footerGalleryAlts = [
  "Crowd at Afrochella festival celebrating Ghanaian music and culture",
  "Traditional Akan dancers in kente at a public heritage event",
  "Wide outdoor civic scene in Ghana",
  "Ghana citizens at a Year of Return heritage gathering",
  "Ghanaian diaspora and community connection",
  "Crowd at a public event in Ghana",
  "Community gathering in Ghana",
  "Formal civic or institutional setting in Ghana",
  "Press or public affairs photography in Ghana",
] as const;

/**
 * Pillar image map — for homepage and About page
 */
export const pillarImages = [
  { id: "digital", image: images.digitalThumb, alt: "Digital connectivity and public events in Ghana" },
  { id: "community", image: images.communityThumb, alt: "Festival crowd and cultural celebration in Ghana" },
  { id: "legal", image: images.legalThumb, alt: "Justice and legal empowerment" },
  { id: "accountability", image: images.accountabilityThumb, alt: "Accountability, press, and governance" },
  { id: "leadership", image: images.leadershipThumb, alt: "Diaspora and citizen engagement with leadership" },
] as const;

/**
 * Strategic narrative — board / programme document (Executive summary, Vision, Mission, Core objectives).
 * Homepage and About import from here so messaging stays aligned.
 */
export const mbkruStrategicContent = {
  legalName: "My Brother's Keeper Restoration United (MBKRU)",
  pillarTagline:
    "Advocate for the Disenfranchised • Watchdog for Accountability • Catalyst for Poverty Eradication",
  /** Homepage — one scannable line; vision, mission, and full narrative on About. */
  homepageWhoWeAreHeading: "Who we are",
  homepageWhoWeAreLead:
    "An independent, non-partisan citizens' platform connecting Ghanaians to accountable governance — through voice, legal navigation, and public data.",
  /** Full programme overview — all three paragraphs render on About; homepage no longer repeats them. */
  executiveSummaryParagraphs: [
    "My Brother's Keeper Restoration United (MBKRU) proposes to transform itself into Ghana's premier independent, non-partisan citizens' platform that connects ordinary Ghanaians—especially the poor, rural, urban, and youth populations—directly to the highest levels of government.",
    "By building a transparent, technology-enabled communication bridge between the Presidency, Ministers, Parliament, and the people, MBKRU will ensure that elected officials are held strictly accountable to the commitments they make and the needs of the citizens they serve.",
    "The ultimate goal is the systematic reduction and eventual eradication of extreme poverty in Ghana through sustained advocacy and public engagement, real-time grievance redress, legal empowerment, and electoral accountability.",
  ],
  /** Homepage — accountability column points readers to About + tracker surfaces. */
  homepageAccountabilityTeaser:
    "The full bridge narrative, restorative justice context, and five objectives are on About. Tracked pledges and methodology update with each deployment phase.",
  vision:
    "A Ghana where no citizen feels powerless, where government listens, responds, and delivers, and where poverty is treated as a national emergency rather than an acceptable condition.",
  mission:
    "To serve as the official, trusted conduit between the President of the Republic and the ordinary people of Ghana, giving voice to the voiceless, protecting the vulnerable, and enforcing accountability at every level of governance.",
  missionRestorativeContext:
    "To advance restorative justice and sustainable development in Ghana by facilitating equitable reparations for historical injustice, including the transatlantic slave trade and colonial exploitation. Through transparent governance, community empowerment, and strategic partnerships, we commit to transforming reparative resources into tangible benefits that uplift affected communities, preserve cultural heritage, and foster economic resilience for future generations.",
  coreObjectives: [
    "Establish a permanent, two-way communication channel between citizens and the Presidency.",
    "Create binding mechanisms that compel elected officials to respond to citizen complaints within defined timeframes.",
    "Provide free or low-cost legal navigation support to members facing bureaucratic injustice.",
    "Systematically monitor and publicly report on the performance of elected officials and government programs.",
    "Influence electoral outcomes by giving citizens credible, data-driven information on candidates' records and commitments.",
  ],
} as const;

/**
 * Hero / brand content — from MBKRU Advocates.pages (source docs)
 * Single source of truth for tagline, motto, subhead
 */
export const heroContent = {
  /** Official tagline — MBKRU Advocates.pages */
  tagline: "A Direct Voice Between the President and the People of Ghana",
  /** Three pillars tagline — same as `mbkruStrategicContent.pillarTagline` */
  subhead: mbkruStrategicContent.pillarTagline,
  /** Official motto — MBKRU Advocates.pages */
  motto: "For the People, By the People, With the People",
} as const;

function publicContactPhone(): string {
  if (typeof process === "undefined") return "";
  return process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() ?? "";
}

/**
 * Contact, social, and legal strings — TopBar, Footer, Contact, Privacy
 */
export const content = {
  /** Contact — TopBar (hidden until set), Footer, Contact page */
  phone: publicContactPhone(),
  email: "info@mbkruadvocates.org",
  address: "Accra, Ghana",
  officeDetails:
    "National programme based in Accra. A public visit address and hours will be published when our walk-in desk opens.",
  contactDetails:
    "Email info@mbkruadvocates.org — we aim to respond within two business days. When an official phone line is published, it will appear in the top bar and here.",

  /** Social — replace # with real URLs (or set NEXT_PUBLIC_* in .env) */
  social: {
    facebook: "#",
    linkedin: "#",
    twitter: "#",
  },

  /** Gold top bar — short line next to social icons */
  topBarTagline: "100% non-partisan · Citizen accountability",

  /** Legal */
  privacyContact: "info@mbkruadvocates.org",
} as const;

export type TopBarSocialIcon = "facebook" | "linkedin" | "twitter";

/** Resolve social URLs for the top bar: env → coded http URL → /contact */
export function getTopBarSocialLinks(): {
  href: string;
  label: string;
  icon: TopBarSocialIcon;
  external: boolean;
}[] {
  function resolve(envKey: string, coded: string): { href: string; external: boolean } {
    if (typeof process !== "undefined") {
      const v = process.env[envKey]?.trim();
      if (v && v.startsWith("http")) return { href: v, external: true };
    }
    if (coded.startsWith("http")) return { href: coded, external: true };
    return { href: "/contact", external: false };
  }

  return [
    { label: "Facebook", icon: "facebook", ...resolve("NEXT_PUBLIC_FACEBOOK_URL", content.social.facebook) },
    { label: "LinkedIn", icon: "linkedin", ...resolve("NEXT_PUBLIC_LINKEDIN_URL", content.social.linkedin) },
    { label: "X (Twitter)", icon: "twitter", ...resolve("NEXT_PUBLIC_TWITTER_URL", content.social.twitter) },
  ];
}

/**
 * Starter news slugs — align with `prisma/seed.mjs` upserts; CMS is the live source of truth.
 */
export const starterNewsArticles = [
  {
    slug: "mbkru-website-launch",
    title: "MBKRU Launches Website for Citizen Voice",
    excerpt: "My Brother's Keeper Restoration United (MBKRU) announces the launch of its official website, marking a new chapter in connecting ordinary Ghanaians directly to the Presidency and holding elected officials accountable.",
    date: "12 Mar 2026",
    image: images.news,
    featured: true,
  },
  {
    slug: "why-mbkru",
    title: "Why MBKRU? Restorative Justice & Citizen Voice",
    excerpt: "Ghana's greatest untapped resource is the collective voice of its people. MBKRU exists to organize, amplify, and channel that voice directly to the highest levels of government.",
    date: "10 Mar 2026",
    image: images.about,
    featured: false,
  },
  {
    slug: "our-approach",
    title: "Five Pillars for Accountability",
    excerpt: "From digital platforms to Town Hall Meetings, legal empowerment to People's Report Cards — how MBKRU will build a transparent bridge between citizens and government.",
    date: "8 Mar 2026",
    image: images.platform,
    featured: false,
  },
  {
    slug: "partnership-update",
    title: "Building Partnerships for Governance",
    excerpt: "MBKRU respectfully seeks partnership with Government, civil society, and development partners.",
    date: "5 Mar 2026",
    image: images.partnership,
    featured: false,
  },
  {
    slug: "citizen-engagement",
    title: "Town Hall Meetings & Regional Forums",
    excerpt: "Physical engagement network bringing citizens face-to-face with decision-makers across all 16 regions.",
    date: "28 Feb 2026",
    image: images.community,
    featured: false,
  },
] as const;

/** FAQ entries for the public FAQ page */
export const faqContent = [
  {
    question: "Who can join MBKRU?",
    answer: "Any Ghanaian citizen of good character, 18 years or older, can become a member. No political party affiliation is required or allowed at the leadership level. MBKRU is strictly non-partisan.",
  },
  {
    question: "How do I report an issue or file a complaint?",
    answer:
      "When member accounts are live on this site, create an account, sign in, and submit through MBKRU Voice from your account page or the Voice submit flow. While the site stays in Phase 1 (information and previews only), use the contact form or the early-access options on the Citizens Voice page.",
  },
  {
    question: "Is MBKRU affiliated with any political party?",
    answer: "No. MBKRU is 100% non-partisan. We do not endorse or support any political party. Our mission is to hold all elected officials accountable regardless of party.",
  },
  {
    question: "What is the People's Report Card?",
    answer: "The People's Report Card is an annual, data-driven assessment of every Minister, Regional Minister, and Member of Parliament. It tracks documented commitments in the public catalogue versus delivery and is published 90 days before general elections.",
  },
  {
    question: "How is MBKRU funded?",
    answer: "Our proposed funding model includes membership dues (symbolic GH¢10–20 per year), grants from development partners, corporate social responsibility contributions, and support from international foundations focused on governance and accountability.",
  },
  {
    question: "When will the MBKRU Voice platform be available?",
    answer:
      "Full Voice features switch on when the programme enables member accounts and reporting on this domain (self-serve registration). Until then, use early access on the Citizens Voice page and the contact form so the team can reach you.",
  },
  {
    question: "I live abroad — can MBKRU help with a Ghana Card, passport, or citizenship?",
    answer:
      "MBKRU does not process ID or passports; we signpost to official channels. The Diaspora support page explains how to use NIA, the Ministry of Foreign Affairs, and Ghana Immigration Service, and when to get individual legal advice. For policy context on the “17th Region” framing, see the News briefing linked from that page.",
  },
  {
    question: "What is the “17th Region” and where is that explained?",
    answer:
      "It is a policy name for the global Ghanaian diaspora (alongside the sixteen regions on the map). A civic summary with public references is on the News section as the Diaspora & 17th Region briefing; the main Diaspora page focuses on practical support.",
  },
  {
    question: "Can MBKRU Voice answer questions if I am in the diaspora?",
    answer:
      "Yes. MBKRU Voice is for everyone on this site. It can guide you to our diaspora support content, accountability tools, and contact options. For fees, rules, and appointments, always confirm on official .gov.gh sites and at embassies or consulates.",
  },
] as const;

/**
 * Programme roadmap — aligned with Ghana 2028 election
 * Phase 1 complete. Phases 2–3 with modal detail. See ROADMAP_2028_ELECTION.md.
 */
export const programmeRoadmap = [
  {
    period: "Mar 2026",
    phase: "Phase 1",
    status: "complete" as const,
    title: "Website & Foundation",
    description: "Phase 1 complete. Website live with all preview pages and interactive features.",
    items: [
      "Homepage, About Us, Contact — live",
      "MBKRU Voice, Engagement, Accountability — preview pages",
      "News, Resources, Partners — skeleton + CMS-ready",
      "16 Regions interactive viz with modal data",
      "Privacy Policy, Terms of Use — legal templates",
    ],
    detailContent: `Phase 1 established MBKRU's digital presence with a professional, accessible website. All 11 Phase 1 pages are live. The 16 Regions section includes interactive modals with capital, population, area, key sectors, and MBKRU engagement notes for each region. Early Access and Tracker signup forms collect leads. No user registration or complaint submission yet — Phase 1 is preview and awareness only.`,
  },
  {
    period: "Q2 2026",
    phase: "Phase 2",
    status: "upcoming" as const,
    title: "Platform Development",
    description: "Foundation for citizen voice and accountability. Approval enables immediate start.",
    items: [
      "MBKRU Voice MVP (registration, dashboard, membership portal)",
      "Town Hall pilot — Greater Accra",
      "Complaint intake backend & geo-tagging",
      "Legal Empowerment Desk pilot",
      "Partnership outreach (CHRAJ, media)",
    ],
    detailContent: `Platform Development builds the technical and operational foundation for citizen voice. The MBKRU Voice MVP includes user registration, personal dashboard, and membership portal at mbkru.org.gh. The Town Hall pilot in Greater Accra validates the physical engagement model. Backend systems for complaint intake and geo-tagging are developed. Legal Empowerment Desk pilot establishes CHRAJ and FOI liaison. Partnership outreach to CHRAJ, media, and development partners secures support for scale.`,
  },
  {
    period: "Q3–Q4 2026",
    phase: "Phase 2",
    status: "upcoming" as const,
    title: "National Rollout",
    description: "Scale across all 16 regions. Early access to full launch.",
    items: [
      "Full MBKRU Voice launch (all regions)",
      "Town Halls: Ashanti, Western, Central, Eastern, Volta, Northern, Bono",
      "Regional Public Forums (broadcast)",
      "People's Report Card data collection starts",
      "Presidential liaison office establishment",
    ],
    detailContent: `National Rollout scales MBKRU across all 16 regions. MBKRU Voice opens to full membership. Town Halls expand to seven major regions. Regional Public Forums are broadcast live on radio, TV, and social media. Data collection for the first People's Report Card begins — tracking Ministers, Regional Ministers, and MPs. The Presidential liaison office is established to channel citizen priorities to the highest level.`,
  },
  {
    period: "Q1–Q2 2027",
    phase: "Phase 2",
    status: "upcoming" as const,
    title: "People's Report Card Year 1",
    description: "First accountability baseline. All five pillars operational.",
    items: [
      "First Report Card published (Ministers, Regional Ministers, MPs)",
      "Public commitment catalogue — 2024 baseline",
      "Annual National People's Assembly",
      "Constituency-level Town Hall expansion",
      "FOI & CHRAJ data pipeline",
    ],
    detailContent: `The first People's Report Card establishes the accountability baseline. Every Minister, Regional Minister, and MP receives a data-driven assessment. The public commitment catalogue uses 2024 manifestos as baseline. The Annual National People's Assembly convenes with selected members presenting priority issues to the President. Constituency-level Town Halls expand across Ghana. FOI and CHRAJ data pipelines support evidence-based reporting. From late 2027 through mid-2028 the programme maintains published updates (Voice statistics, catalogue revisions, and regional forum cadence) so the pre-election scorecard release is evidence-led rather than a single snapshot.`,
  },
  {
    period: "Q3 2028",
    phase: "Phase 3",
    status: "upcoming" as const,
    title: "Accountability Scorecards",
    description: "Published 90 days before Ghana 2028 election. Maximum impact.",
    items: [
      "Accountability Scorecards published (Aug–Sep 2028)",
      "Pre-election debates in every constituency (275–276 per EC seat map)",
      "National People's Assembly (election focus)",
      "Media & CSO partnerships for coverage",
      "Real-time 2028 manifesto tracking",
    ],
    detailContent: `Accountability Scorecards are published 90 days before the Ghana 2028 general election — the flagship deliverable. Pre-election debates and town halls are held nationwide; constituency counts follow the Electoral Commission (275 toward 276 seats, including Guan where applicable). The National People's Assembly focuses on election-year priorities. Media and CSO partnerships ensure broad coverage. Real-time tracking of 2028 manifestos begins as soon as parties release them. On a Phase 3 website build, MBKRU may ship election-observation intake and hardened public scorecard pages before these calendar windows — see methodology for scope.`,
  },
  {
    period: "Q4 2028",
    phase: "Phase 3",
    status: "upcoming" as const,
    title: "Ghana General Election",
    description: "MBKRU as trusted accountability reference for voters.",
    items: [
      "Ghana General Election (Nov–Dec 2028)",
      "Post-election catalogue updates begin",
      "Voter education & civic engagement",
      "Legacy: 3 Report Cards + Scorecards in public record",
    ],
    detailContent: `Ghana holds its general election in November–December 2028. MBKRU serves as a trusted, non-partisan accountability reference for voters. Post-election, catalogue updates begin for the new administration. Voter education and civic engagement continue. MBKRU's legacy: three People's Report Cards and Accountability Scorecards in the public record, establishing a new standard for citizen-led accountability in Ghana.`,
  },
] as const;

/**
 * Homepage “pathways” grid — replaces the old quarter-by-quarter roadmap cards on the home page.
 * Stakeholders get direct routes into live tools; the detailed delivery calendar stays in About and internal programme docs.
 */
export const homepageEngagementPathways = [
  {
    tag: "Voice",
    title: "Citizen reporting",
    description: "How MBKRU Voice works, what we moderate, and how to submit when your deployment enables intake.",
    href: "/citizens-voice",
  },
  {
    tag: "Accountability",
    title: "Promises & parliament",
    description: "Tracker hub, government commitments, and promise browsing — aligned with published methodology.",
    href: "/parliament-tracker",
  },
  {
    tag: "Communities",
    title: "Community spaces",
    description: "Traditional-area and Queen Mothers community pages — membership and posting rules vary by space.",
    href: "/communities",
  },
  {
    tag: "Forums",
    title: "Town halls & regional forums",
    description: "Programme town halls, constituency debates, and regional listening events with published citations.",
    href: "/town-halls",
  },
  {
    tag: "Evidence",
    title: "Data sources",
    description: "Where constituencies, MPs, and public figures are cited — and how to challenge or correct a row.",
    href: "/data-sources",
  },
  {
    tag: "Method",
    title: "Methodology",
    description: "Scoring rules, limitations, and how we separate programme narrative from live catalogue data.",
    href: "/methodology",
  },
  {
    tag: "Help",
    title: "FAQ",
    description: "Membership, Voice rollout, petitions, and common questions in plain language.",
    href: "/faq",
  },
  {
    tag: "Collaborate",
    title: "Partners & media",
    description: "Institutions, foundations, and journalists working with MBKRU on governance outcomes.",
    href: "/partners",
  },
] as const;

/**
 * 16 Regions of Ghana — data for interactive modal (Phase 1)
 * Sources: 2021 PHC, Wikipedia, EC Ghana. Regional ministers: Feb 2025 (Mahama govt). Constituencies: 2024 elections (276 total).
 */
export const ghanaRegionsData = [
  { name: "Greater Accra", capital: "Accra", population: 5455692, areaKm2: 3245, districts: 29, constituencies: 34, regionalMinister: "Hon. Mrs. Linda Obenewaa Akweley Ocloo", keySectors: "Services, Finance, Government", pillarFocus: ["A", "B", "E"], townHallStatus: "Pilot Q2 2026", mbkruVoiceStatus: "Pilot region", mbkruNote: "National headquarters. MBKRU Voice pilot. First Town Hall Q2 2026. Presidential liaison office." },
  { name: "Ashanti", capital: "Kumasi", population: 5440463, areaKm2: 24389, districts: 43, constituencies: 47, regionalMinister: "Hon. Dr. Frank Amoakohene", keySectors: "Commerce, Cocoa, Manufacturing", pillarFocus: ["A", "B", "D"], townHallStatus: "Planned Q3 2026", mbkruVoiceStatus: "Planned", mbkruNote: "Largest inland region. High engagement potential. People's Report Card pilot. Regional Public Forum planned." },
  { name: "Northern", capital: "Tamale", population: 2310939, areaKm2: 26534, districts: 16, constituencies: 18, regionalMinister: "Hon. Mr. Ali Adolf John", keySectors: "Agriculture, Shea, Livestock", pillarFocus: ["B", "D", "E"], townHallStatus: "Planned Q4 2026", mbkruVoiceStatus: "Planned", mbkruNote: "Northern hub. Presidential Listening Session candidate. SDG 1 priority. Accountability & poverty focus." },
  { name: "Western", capital: "Takoradi", population: 2060585, areaKm2: 13842, districts: 14, constituencies: 17, regionalMinister: "Hon. Mr. Joseph Nelson", keySectors: "Oil & Gas, Timber, Mining", pillarFocus: ["B", "C", "D"], townHallStatus: "Planned Q3 2026", mbkruVoiceStatus: "Planned", mbkruNote: "Coastal region. Oil & gas sector accountability. Legal Empowerment Desk expansion. Town Hall planned." },
  { name: "Eastern", capital: "Koforidua", population: 2925653, areaKm2: 19323, districts: 33, constituencies: 33, regionalMinister: "Hon. Mrs. Rita Akosua Adjei Awatey", keySectors: "Agriculture, Cocoa, Tourism", pillarFocus: ["A", "B", "C"], townHallStatus: "Planned Q4 2026", mbkruVoiceStatus: "Planned", mbkruNote: "Agricultural focus. CHRAJ liaison. Regional Public Forum planned. FOI support." },
  { name: "Volta", capital: "Ho", population: 1659040, areaKm2: 9504, districts: 18, constituencies: 18, regionalMinister: "Hon. Mr. James Gunu", keySectors: "Agriculture, Fishing, Tourism", pillarFocus: ["A", "B", "C"], townHallStatus: "Planned Q4 2026", mbkruVoiceStatus: "Planned", mbkruNote: "Eastern corridor. Legal Empowerment Desk expansion. Citizen voice pilot. Volta Basin focus." },
  { name: "Upper East", capital: "Bolgatanga", population: 1301226, areaKm2: 8842, districts: 15, constituencies: 15, regionalMinister: "Hon. Mr. Akamugri Donatus Atanga", keySectors: "Agriculture, Shea, Crafts", pillarFocus: ["B", "D", "E"], townHallStatus: "Planned 2027", mbkruVoiceStatus: "Coming soon", mbkruNote: "Upper East hub. People's Report Card pilot. Poverty eradication focus. SDG 1 priority." },
  { name: "Upper West", capital: "Wa", population: 901502, areaKm2: 18476, districts: 11, constituencies: 11, regionalMinister: "Hon. Mr. Charles Lwanga Puozuing", keySectors: "Agriculture, Shea, Livestock", pillarFocus: ["B", "D"], townHallStatus: "Planned 2027", mbkruVoiceStatus: "Coming soon", mbkruNote: "Upper West hub. Regional forum planned. SDG 1 priority. Accountability tracking." },
  { name: "Central", capital: "Cape Coast", population: 2859821, areaKm2: 9826, districts: 22, constituencies: 23, regionalMinister: "Hon. Mr. Ekow Panyin Okyere Eduamoah", keySectors: "Tourism, Fisheries, Agriculture", pillarFocus: ["A", "B", "D"], townHallStatus: "Planned Q3 2026", mbkruVoiceStatus: "Planned", mbkruNote: "Historic capital. Tourism & fisheries accountability. Town Hall planned. Citizen voice expansion." },
  { name: "Bono", capital: "Sunyani", population: 1208649, areaKm2: 11113, districts: 12, constituencies: 12, regionalMinister: "Hon. Mr. Joseph Addae Akwaboah", keySectors: "Cocoa, Timber, Agriculture", pillarFocus: ["A", "B", "D"], townHallStatus: "Planned Q4 2026", mbkruVoiceStatus: "Planned", mbkruNote: "Bono hub. Cocoa sector focus. People's Report Card. Regional Public Forum planned." },
  { name: "Bono East", capital: "Techiman", population: 1203400, areaKm2: 23248, districts: 11, constituencies: 11, regionalMinister: "Hon. Mr. Francis Owusu Antwi", keySectors: "Commerce, Agriculture, Transport", pillarFocus: ["A", "B", "D"], townHallStatus: "Planned 2027", mbkruVoiceStatus: "Coming soon", mbkruNote: "Commercial hub. Regional forum planned. Accountability tracking. Promise catalogue monitoring." },
  { name: "Ahafo", capital: "Goaso", population: 564668, areaKm2: 5196, districts: 6, constituencies: 6, regionalMinister: "Hon. Mrs. Charity Gardner", keySectors: "Mining, Cocoa, Agriculture", pillarFocus: ["B", "C", "D"], townHallStatus: "Planned 2027", mbkruVoiceStatus: "Coming soon", mbkruNote: "New region (2019). Mining sector accountability. Legal Empowerment Desk. Engagement planned." },
  { name: "Oti", capital: "Dambai", population: 747248, areaKm2: 11066, districts: 8, constituencies: 10, regionalMinister: "Hon. Mr. John Kwadwo Gyapong", keySectors: "Agriculture, Volta Basin", pillarFocus: ["A", "B"], townHallStatus: "Planned 2027", mbkruVoiceStatus: "Coming soon", mbkruNote: "New region (2019). Volta Basin focus. Town Hall expansion planned. Citizen voice pilot. Includes Guan constituency." },
  { name: "Western North", capital: "Sefwi Wiawso", population: 880921, areaKm2: 10079, districts: 9, constituencies: 9, regionalMinister: "Hon. Mr. Wilbert Petty Brentum", keySectors: "Cocoa, Timber, Mining", pillarFocus: ["B", "C", "D"], townHallStatus: "Planned 2027", mbkruVoiceStatus: "Coming soon", mbkruNote: "New region (2019). Cocoa & timber. Regional Public Forum planned. Accountability focus." },
  { name: "North East", capital: "Nalerigu", population: 658946, areaKm2: 9070, districts: 6, constituencies: 6, regionalMinister: "Hon. Mr. Ibrahim Tia", keySectors: "Agriculture, Shea", pillarFocus: ["B", "D"], townHallStatus: "Planned 2027", mbkruVoiceStatus: "Coming soon", mbkruNote: "New region (2019). Northern outreach. Engagement planned. SDG 1 focus." },
  { name: "Savannah", capital: "Damongo", population: 653266, areaKm2: 34790, districts: 7, constituencies: 7, regionalMinister: "Hon. Mr. Salisu Be-Awuribe", keySectors: "Agriculture, Livestock, Shea", pillarFocus: ["B", "D"], townHallStatus: "Planned 2027", mbkruVoiceStatus: "Coming soon", mbkruNote: "New region (2019). Largest by area. Savannah zone accountability. People's Report Card expansion." },
] as const;

/** Concept note card on Resources — PDF link when available */
export const resourcesConceptNote = {
  title: "MBKRU Concept Note",
  description: "A concise overview of our mission, five operational pillars, and proposed approach to citizen voice and accountability in Ghana.",
  fileUrl: "#",
  fileLabel: "Download PDF (coming soon)",
} as const;

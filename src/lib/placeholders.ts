/**
 * MBKRU Placeholder Configuration
 *
 * Centralized images and content placeholders for Phase 1.
 * Replace with real content when available.
 *
 * Images: Unsplash (https://unsplash.com) — free to use, no attribution required.
 * URL format: https://images.unsplash.com/photo-{id}?w={width}&q=80
 */

const UNSPLASH_BASE = "https://images.unsplash.com";

/** Build Unsplash URL with optional width */
function img(id: string, width = 1200) {
  return `${UNSPLASH_BASE}/photo-${id}?w=${width}&q=80`;
}

/**
 * Placeholder images — semantic categories for easy replacement
 */
export const images = {
  /** Hero, CTA sections — community, people, civic engagement */
  hero: img("1529156069898-49953e39b3ac", 1920),
  heroThumb: img("1529156069898-49953e39b3ac", 800),

  /** About, mission — community and heritage */
  about: img("1489392191049-fc10c97e64b6", 800),
  aboutMission: img("1489392191049-fc10c97e64b6", 800),

  /** Platform preview — citizen engagement */
  platform: img("1529156069898-49953e39b3ac", 800),

  /** Pillar A — Digital platform, technology */
  digital: img("1551434678-e076c223a692", 800),
  digitalThumb: img("1551434678-e076c223a692", 400),

  /** Pillar B — Town hall, community meetings */
  community: img("1540575467063-178a50c2df87", 800),
  communityThumb: img("1540575467063-178a50c2df87", 400),

  /** Pillar C — Legal, justice */
  legal: img("1589829545856-d10d557cf95f", 800),
  legalThumb: img("1589829545856-d10d557cf95f", 400),

  /** Pillar D — Accountability, governance */
  accountability: img("1529107386315-e1a2ed48a620", 800),
  accountabilityThumb: img("1529107386315-e1a2ed48a620", 400),

  /** Pillar E — Presidential interface, leadership */
  leadership: img("1529156069898-49953e39b3ac", 800),
  leadershipThumb: img("1529156069898-49953e39b3ac", 400),

  /** Partners — collaboration, teamwork */
  partnership: img("1522071820081-009f0129c71c", 800),

  /** News — media, press */
  news: img("1504711434969-e33886168f5c", 1200),

  /** Resources — documents, research */
  resources: img("1450101499163-c8848c71ca48", 1200),

  /** Landscape, nature — generic */
  landscape: img("1500382017468-9049fed747ef", 800),
} as const;

/** Footer engagement gallery — 9 images for 3x3 grid */
export const footerGalleryImages = [
  images.community,
  images.about,
  images.hero,
  images.platform,
  images.leadership,
  images.digital,
  images.partnership,
  images.landscape,
  images.news,
] as const;

/**
 * Pillar image map — for homepage and About page
 */
export const pillarImages = [
  { id: "digital", image: images.digitalThumb, alt: "Digital platform and technology" },
  { id: "community", image: images.communityThumb, alt: "Town hall and community meeting" },
  { id: "legal", image: images.legalThumb, alt: "Justice and legal empowerment" },
  { id: "accountability", image: images.accountabilityThumb, alt: "Accountability and governance" },
  { id: "leadership", image: images.leadershipThumb, alt: "Citizen engagement with leadership" },
] as const;

/**
 * Hero / brand content — from MBKRU Advocates.pages (source docs)
 * Single source of truth for tagline, motto, subhead
 */
export const heroContent = {
  /** Official tagline — MBKRU Advocates.pages */
  tagline: "A Direct Voice Between the President and the People of Ghana",
  /** Condensed from "Advocate for the Disenfranchised • Watchdog for Accountability • Catalyst for Poverty Eradication" */
  subhead: "Advocate • Watchdog • Catalyst",
  /** Official motto — MBKRU Advocates.pages */
  motto: "For the People, By the People, With the People",
} as const;

/**
 * Content placeholders — replace with real data
 */
export const content = {
  /** Contact — TopBar, Footer, Contact page */
  phone: "+233 XX XXX XXXX",
  email: "info@mbkruadvocates.org",
  address: "Accra, Ghana",
  officeDetails: "Office details to be added.",
  contactDetails: "Contact details to be added.",

  /** Social — replace # with real URLs */
  social: {
    facebook: "#",
    linkedin: "#",
    twitter: "#",
  },

  /** Legal */
  privacyContact: "[add contact email]",
} as const;

/**
 * News articles — placeholder for Blog2 layout
 */
export const newsPlaceholders = [
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

/**
 * Leadership / team — placeholder for About page
 */
export const leadershipPlaceholders = [
  {
    name: "[Name to be added]",
    role: "Founder / National Coordinator",
    bio: "Brief bio to be added. Experience in governance, citizen engagement, or related field.",
    image: images.leadership,
  },
  {
    name: "[Name to be added]",
    role: "Deputy Coordinator",
    bio: "Brief bio to be added.",
    image: images.community,
  },
  {
    name: "[Name to be added]",
    role: "Legal & Governance Advisor",
    bio: "Brief bio to be added.",
    image: images.legal,
  },
] as const;

/**
 * NGO registration — placeholder
 */
export const registrationPlaceholder = {
  status: "[Registration status to be added]",
  number: "[NGO registration number if applicable]",
  regulator: "[Regulatory body — e.g. Department of Social Welfare]",
  date: "[Date of registration]",
} as const;

/**
 * Advisory / endorsements — placeholder quotes
 */
export const advisoryPlaceholders = [
  {
    quote: "[Endorsement or advisory quote to be added. E.g. from a governance expert, civil society leader, or partner.]",
    author: "[Name, Title]",
  },
  {
    quote: "[Second endorsement or quote to be added.]",
    author: "[Name, Title]",
  },
] as const;

/**
 * FAQ — placeholder for Resources / FAQ page
 */
export const faqPlaceholders = [
  {
    question: "Who can join MBKRU?",
    answer: "Any Ghanaian citizen of good character, 18 years or older, can become a member. No political party affiliation is required or allowed at the leadership level. MBKRU is strictly non-partisan.",
  },
  {
    question: "How do I report an issue or file a complaint?",
    answer: "Once our MBKRU Voice digital platform (Pillar A) is launched, you will be able to register, create an account, and file geo-tagged complaints through your personal dashboard. For now, use our contact form to reach out.",
  },
  {
    question: "Is MBKRU affiliated with any political party?",
    answer: "No. MBKRU is 100% non-partisan. We do not endorse or support any political party. Our mission is to hold all elected officials accountable regardless of party.",
  },
  {
    question: "What is the People's Report Card?",
    answer: "The People's Report Card is an annual, data-driven assessment of every Minister, Regional Minister, and Member of Parliament. It tracks campaign promises versus delivery and is published 90 days before general elections.",
  },
  {
    question: "How is MBKRU funded?",
    answer: "Our proposed funding model includes membership dues (symbolic GH¢10–20 per year), grants from development partners, corporate social responsibility contributions, and support from international foundations focused on governance and accountability.",
  },
  {
    question: "When will the MBKRU Voice platform be available?",
    answer: "We are building capacity and seeking partnerships to launch the digital platform. Sign up for early access on our Citizens Voice page to be notified when registration opens.",
  },
] as const;

/**
 * Roadmap / timeline — aligned with Ghana 2028 election
 * Phase 1 complete. Phases 2–3 with modal detail. See ROADMAP_2028_ELECTION.md.
 */
export const roadmapPlaceholders = [
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
      "Campaign promise tracking — 2024 baseline",
      "Annual National People's Assembly",
      "Constituency-level Town Hall expansion",
      "FOI & CHRAJ data pipeline",
    ],
    detailContent: `The first People's Report Card establishes the accountability baseline. Every Minister, Regional Minister, and MP receives a data-driven assessment. Campaign promise tracking uses 2024 manifestos as baseline. The Annual National People's Assembly convenes with selected members presenting priority issues to the President. Constituency-level Town Halls expand across Ghana. FOI and CHRAJ data pipelines support evidence-based reporting.`,
  },
  {
    period: "Q3 2028",
    phase: "Phase 3",
    status: "upcoming" as const,
    title: "Accountability Scorecards",
    description: "Published 90 days before Ghana 2028 election. Maximum impact.",
    items: [
      "Accountability Scorecards published (Aug–Sep 2028)",
      "Pre-election debates in every constituency (275)",
      "National People's Assembly (election focus)",
      "Media & CSO partnerships for coverage",
      "Real-time 2028 manifesto tracking",
    ],
    detailContent: `Accountability Scorecards are published 90 days before the Ghana 2028 general election — the flagship deliverable. Pre-election debates and town halls are held in all 275 constituencies. The National People's Assembly focuses on election-year priorities. Media and CSO partnerships ensure broad coverage. Real-time tracking of 2028 manifestos begins as soon as parties release them. Voters have data-driven information to hold candidates accountable.`,
  },
  {
    period: "Q4 2028",
    phase: "Phase 3",
    status: "upcoming" as const,
    title: "Ghana General Election",
    description: "MBKRU as trusted accountability reference for voters.",
    items: [
      "Ghana General Election (Nov–Dec 2028)",
      "Post-election promise tracking begins",
      "Voter education & civic engagement",
      "Legacy: 3 Report Cards + Scorecards in public record",
    ],
    detailContent: `Ghana holds its general election in November–December 2028. MBKRU serves as a trusted, non-partisan accountability reference for voters. Post-election, promise tracking begins for the new administration. Voter education and civic engagement continue. MBKRU's legacy: three People's Report Cards and Accountability Scorecards in the public record, establishing a new standard for citizen-led accountability in Ghana.`,
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
  { name: "Bono East", capital: "Techiman", population: 1203400, areaKm2: 23248, districts: 11, constituencies: 11, regionalMinister: "Hon. Mr. Francis Owusu Antwi", keySectors: "Commerce, Agriculture, Transport", pillarFocus: ["A", "B", "D"], townHallStatus: "Planned 2027", mbkruVoiceStatus: "Coming soon", mbkruNote: "Commercial hub. Regional forum planned. Accountability tracking. Campaign promise monitoring." },
  { name: "Ahafo", capital: "Goaso", population: 564668, areaKm2: 5196, districts: 6, constituencies: 6, regionalMinister: "Hon. Mrs. Charity Gardner", keySectors: "Mining, Cocoa, Agriculture", pillarFocus: ["B", "C", "D"], townHallStatus: "Planned 2027", mbkruVoiceStatus: "Coming soon", mbkruNote: "New region (2019). Mining sector accountability. Legal Empowerment Desk. Engagement planned." },
  { name: "Oti", capital: "Dambai", population: 747248, areaKm2: 11066, districts: 8, constituencies: 10, regionalMinister: "Hon. Mr. John Kwadwo Gyapong", keySectors: "Agriculture, Volta Basin", pillarFocus: ["A", "B"], townHallStatus: "Planned 2027", mbkruVoiceStatus: "Coming soon", mbkruNote: "New region (2019). Volta Basin focus. Town Hall expansion planned. Citizen voice pilot. Includes Guan constituency." },
  { name: "Western North", capital: "Sefwi Wiawso", population: 880921, areaKm2: 10079, districts: 9, constituencies: 9, regionalMinister: "Hon. Mr. Wilbert Petty Brentum", keySectors: "Cocoa, Timber, Mining", pillarFocus: ["B", "C", "D"], townHallStatus: "Planned 2027", mbkruVoiceStatus: "Coming soon", mbkruNote: "New region (2019). Cocoa & timber. Regional Public Forum planned. Accountability focus." },
  { name: "North East", capital: "Nalerigu", population: 658946, areaKm2: 9070, districts: 6, constituencies: 6, regionalMinister: "Hon. Mr. Ibrahim Tia", keySectors: "Agriculture, Shea", pillarFocus: ["B", "D"], townHallStatus: "Planned 2027", mbkruVoiceStatus: "Coming soon", mbkruNote: "New region (2019). Northern outreach. Engagement planned. SDG 1 focus." },
  { name: "Savannah", capital: "Damongo", population: 653266, areaKm2: 34790, districts: 7, constituencies: 7, regionalMinister: "Hon. Mr. Salisu Be-Awuribe", keySectors: "Agriculture, Livestock, Shea", pillarFocus: ["B", "D"], townHallStatus: "Planned 2027", mbkruVoiceStatus: "Coming soon", mbkruNote: "New region (2019). Largest by area. Savannah zone accountability. People's Report Card expansion." },
] as const;

/**
 * Partner logos — placeholder (use image URLs or "Coming soon" text)
 */
export const partnerLogoPlaceholders = [
  { name: "[Partner 1]", logo: null, href: "#" },
  { name: "[Partner 2]", logo: null, href: "#" },
  { name: "[Partner 3]", logo: null, href: "#" },
] as const;

/**
 * Concept note / key document — placeholder for Resources
 */
export const conceptNotePlaceholder = {
  title: "MBKRU Concept Note",
  description: "A concise overview of our mission, five operational pillars, and proposed approach to citizen voice and accountability in Ghana.",
  fileUrl: "#",
  fileLabel: "Download PDF (coming soon)",
} as const;

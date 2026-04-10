/**
 * DB seed — runs in production Docker without tsx (`node prisma/seed.mjs`).
 * Constituencies: `prisma/data/constituencies.seed.json` — `npm run data:refresh-constituencies-seed`.
 * Full MP roster: `prisma/data/parliament-members.seed.json` (bundled; Wikipedia 2024 list). Regenerate: `npm run data:refresh-members-seed-wikipedia`.
 * Traditional-area communities: `prisma/data/communities.seed.json` (public-source citations in descriptions).
 * Town hall / forum / constituency debate programme: `TownHallEvent` after bundled constituencies (see `prisma/data/TOWN_HALL_SEED_SOURCES.txt`). Opt out: `SEED_TOWN_HALL_PROGRAMME=0`.
 * Opt out: `SEED_COMMUNITIES_DEMO=0`. Pilot posts need `SEED_MEMBER_DEMO=1`.
 * Optional admin fixtures (Voice + attachment, situational/election rows, contact, verification queue): `SEED_ENGAGEMENT_DEMOS=1` or `SEED_VOICE_DEMO=1`. Internal origin is noted in `CitizenReport.staffNotes` / contact message footer where applicable.
 * With `SEED_ENGAGEMENT_DEMOS=1`, also seeds **10 demo members** (`demo.cohort01@mbkru.local` … `demo.cohort10@mbkru.local`), member-linked Voice/Situational/Election reports (incl. whistleblow-tagged Voice), community memberships/posts, **petitions** (with **signatures** from other cohort members), a **public cause** thread (**supports** + **comments**), extra **community reply** posts, sample **notifications**, and lead captures — password: `SEED_DEMO_COHORT_PASSWORD` or `SEED_MEMBER_PASSWORD` or default `DemoCohort!change-2026`.
 * @see package.json prisma.seed
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const prisma = new PrismaClient();

/** 1×1 PNG written to public/uploads when engagement seed runs (attachment + verification file workflows). */
const SEED_DEMO_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const REGIONS_SEED = [
  { name: "Greater Accra", slug: "greater-accra" },
  { name: "Ashanti", slug: "ashanti" },
  { name: "Northern", slug: "northern" },
  { name: "Western", slug: "western" },
  { name: "Eastern", slug: "eastern" },
  { name: "Volta", slug: "volta" },
  { name: "Upper East", slug: "upper-east" },
  { name: "Upper West", slug: "upper-west" },
  { name: "Central", slug: "central" },
  { name: "Bono", slug: "bono" },
  { name: "Bono East", slug: "bono-east" },
  { name: "Ahafo", slug: "ahafo" },
  { name: "Oti", slug: "oti" },
  { name: "Western North", slug: "western-north" },
  { name: "North East", slug: "north-east" },
  { name: "Savannah", slug: "savannah" },
];

/** Starter news — same slugs as `starterNewsArticles` in `src/lib/site-content.ts` (CMS replaces static fallback). */
const POSTS_SEED = [
  {
    slug: "mbkru-website-launch",
    title: "MBKRU Launches Website for Citizen Voice",
    excerpt:
      "My Brother's Keeper Restoration United (MBKRU) announces the launch of its official website, marking a new chapter in connecting ordinary Ghanaians directly to the Presidency and holding elected officials accountable.",
    publishedAt: new Date("2026-03-12T10:00:00.000Z"),
    body: [
      "## A public home for accountability",
      "",
      "MBKRU is rolling out a transparent, mobile-friendly home for our pillars: **MBKRU Voice**, situational engagement, and the **Parliament tracker** preview. This site is the place to read updates, subscribe for news, and contact our team.",
      "",
      "## What you can do today",
      "",
      "- Browse **News** for explainers and announcements.",
      "- Use **Contact** for partnerships, press, and general enquiries.",
      "- Join early-access lists on **Citizens Voice** and **Parliament tracker** as pilots open.",
      "",
      "## Non-partisan by design",
      "",
      "We serve citizens across party lines. Editorial content and tools are built to support **verification**, **moderation**, and **respect for official channels** (including CHRAJ and the Electoral Commission) where they apply.",
    ].join("\n"),
  },
  {
    slug: "why-mbkru",
    title: "Why MBKRU? Restorative Justice & Citizen Voice",
    excerpt:
      "Ghana's greatest untapped resource is the collective voice of its people. MBKRU exists to organize, amplify, and channel that voice directly to the highest levels of government.",
    publishedAt: new Date("2026-03-10T10:00:00.000Z"),
    body: [
      "## Voice, dignity, and follow-through",
      "",
      "When citizens cannot see what happens after they speak up, trust erodes. MBKRU exists to narrow that gap: clearer pathways for input, stronger feedback loops, and public reporting that rewards facts over noise.",
      "",
      "## Restorative justice",
      "",
      "Our mission includes **restorative justice** and **sustainable development** — honouring historical harms while pressing for practical outcomes in health, education, infrastructure, and livelihoods today.",
      "",
      "## How we work",
      "",
      "We combine digital tools with physical engagement (town halls and regional forums), legal literacy, and election-cycle accountability datasets. Everything we publish aims to be **independent**, **citable**, and **useful to ordinary Ghanaians**.",
    ].join("\n"),
  },
  {
    slug: "our-approach",
    title: "Five Pillars for Accountability",
    excerpt:
      "From digital platforms to Town Hall Meetings, legal empowerment to People's Report Cards — how MBKRU will build a transparent bridge between citizens and government.",
    publishedAt: new Date("2026-03-08T10:00:00.000Z"),
    body: [
      "## One platform, five delivery lanes",
      "",
      "1. **Digital platform (MBKRU Voice)** — secure intake, status tracking, and public statistics where appropriate.",
      "2. **Physical engagement** — quarterly town halls, regional forums, and a national assembly-style gathering.",
      "3. **Legal empowerment** — templates, signposting to CHRAJ and courts, and pro-bono pathways where available.",
      "4. **Accountability & electoral watch** — promise tracking, scorecards, and petition mechanisms as we scale.",
      "5. **Presidential interface** — structured briefings and listening sessions so citizen sentiment is not lost in translation.",
      "",
      "## Phased delivery",
      "",
      "Phase 1 focuses on **trust**, **news**, and **lead capture**. Later phases add member accounts, full reporting workflows, and published datasets. Watch **News** for milestone posts.",
    ].join("\n"),
  },
  {
    slug: "partnership-update",
    title: "Building Partnerships for Governance",
    excerpt:
      "MBKRU respectfully seeks partnership with Government, civil society, and development partners.",
    publishedAt: new Date("2026-03-05T10:00:00.000Z"),
    body: [
      "## Open doors",
      "",
      "MBKRU invites **government**, **civil society**, **media**, **legal clinics**, and **development partners** to explore practical collaboration: data standards, moderation playbooks, and citizen education that reinforces — never replaces — statutory institutions.",
      "",
      "## What we need from partners",
      "",
      "- **Transparency** on timelines and responsibilities.",
      "- **Protection** for whistle-blowers and vulnerable reporters.",
      "- **Funding** aligned with non-partisan governance outcomes.",
      "",
      "## Get in touch",
      "",
      "Use the **Contact** page with enquiry type **Partnership**. We respond to serious proposals within two business days where possible.",
    ].join("\n"),
  },
  {
    slug: "citizen-engagement",
    title: "Town Hall Meetings & Regional Forums",
    excerpt:
      "Physical engagement network bringing citizens face-to-face with decision-makers across all 16 regions.",
    publishedAt: new Date("2026-02-28T10:00:00.000Z"),
    body: [
      "## Why physical still matters",
      "",
      "Digital tools scale quickly; **face-to-face dialogue** builds legitimacy. MBKRU’s network is designed to combine both: online intake and tracking, plus regional forums that meet people where they are.",
      "",
      "## All sixteen regions",
      "",
      "Ghana’s regional diversity is a strength. Our roadmap includes **coordinators**, **local agendas**, and **accessible venues** — with sign-language and local-language support as programmes mature.",
      "",
      "## Stay informed",
      "",
      "Dates and locations will be announced on **News** and via our newsletter. Sign up on the homepage to be notified when registration opens.",
    ].join("\n"),
  },
];

/**
 * Small **public** starter set: real MPs and constituencies (verify on parliament.gh),
 * manifesto PDF links only (no scraped text), and promise **themes** editors must align to page-level citations.
 * @see docs/DATA_SOURCES.md
 */
const LEGACY_FICTIONAL_MP_SLUGS = ["demo-mp-koomson", "demo-mp-adjei", "demo-mp-owusu"];
const LEGACY_FICTIONAL_CONSTITUENCY_SLUGS = ["demo-constituency-accra-north", "demo-constituency-kumasi-east"];

const STARTER_MP_SLUGS = ["bryan-acheampong", "john-dramani-mahama", "zanetor-agyeman-rawlings"];
/** Pilot cycle for report-card UI — scores null until MBKRU publishes a reviewed cycle. */
const REPORT_CARD_PILOT_YEAR = 2026;

const NDC_2024_MANIFESTO_URL =
  "https://manifesto.johnmahama.org/files/shares/2024%20Manifesto_Abridged.pdf";
/** Mirror commonly linked for 2024 NPP programme; verify against party canonical host if URL drifts. */
const NPP_2024_MANIFESTO_URL = "https://npp-usa.org/wp-content/uploads/2024/08/2024_NPP_Manifesto_Full.pdf";

async function removeLegacyFictionalAccountabilityRows() {
  const legacyMembers = await prisma.parliamentMember.findMany({
    where: { slug: { in: LEGACY_FICTIONAL_MP_SLUGS } },
    select: { id: true },
  });
  const legacyIds = legacyMembers.map((m) => m.id);
  if (legacyIds.length > 0) {
    await prisma.campaignPromise.deleteMany({ where: { memberId: { in: legacyIds } } });
    await prisma.parliamentMember.deleteMany({ where: { id: { in: legacyIds } } });
  }
  await prisma.constituency.deleteMany({
    where: { slug: { in: LEGACY_FICTIONAL_CONSTITUENCY_SLUGS } },
  });
  await prisma.reportCardCycle.deleteMany({ where: { year: 2099 } });
}

async function seedAccountabilityPublicSample() {
  const eastern = await prisma.region.findUnique({ where: { slug: "eastern" } });
  const savannah = await prisma.region.findUnique({ where: { slug: "savannah" } });
  const greaterAccra = await prisma.region.findUnique({ where: { slug: "greater-accra" } });
  if (!eastern || !savannah || !greaterAccra) {
    console.warn("seedAccountabilityPublicSample: required regions missing — run base region seed first.");
    return;
  }

  await removeLegacyFictionalAccountabilityRows();

  const cAbetifi = await prisma.constituency.upsert({
    where: { slug: "abetifi" },
    create: { name: "Abetifi", slug: "abetifi", regionId: eastern.id },
    update: { name: "Abetifi", regionId: eastern.id },
  });
  const cBole = await prisma.constituency.upsert({
    where: { slug: "bole-bamboi" },
    create: { name: "Bole Bamboi", slug: "bole-bamboi", regionId: savannah.id },
    update: { name: "Bole Bamboi", regionId: savannah.id },
  });
  const cKlottey = await prisma.constituency.upsert({
    where: { slug: "klottey-korle" },
    create: { name: "Klottey Korle", slug: "klottey-korle", regionId: greaterAccra.id },
    update: { name: "Klottey Korle", regionId: greaterAccra.id },
  });

  const mps = [
    {
      slug: STARTER_MP_SLUGS[0],
      name: "Bryan Acheampong",
      role: "MP",
      party: "NPP",
      constituencyId: cAbetifi.id,
    },
    {
      slug: STARTER_MP_SLUGS[1],
      name: "John Dramani Mahama",
      role: "MP",
      party: "NDC",
      constituencyId: cBole.id,
    },
    {
      slug: STARTER_MP_SLUGS[2],
      name: "Zanetor Agyeman-Rawlings",
      role: "MP",
      party: "NDC",
      constituencyId: cKlottey.id,
    },
  ];

  for (const m of mps) {
    await prisma.parliamentMember.upsert({
      where: { slug: m.slug },
      create: {
        name: m.name,
        slug: m.slug,
        role: m.role,
        party: m.party,
        constituencyId: m.constituencyId,
        active: true,
      },
      update: {
        name: m.name,
        role: m.role,
        party: m.party,
        constituencyId: m.constituencyId,
        active: true,
      },
    });
  }

  const members = await prisma.parliamentMember.findMany({
    where: { slug: { in: STARTER_MP_SLUGS } },
    select: { id: true, slug: true },
  });
  const bySlug = Object.fromEntries(members.map((x) => [x.slug, x.id]));

  let ndcManifesto = await prisma.manifestoDocument.findFirst({
    where: { partySlug: "ndc", electionCycle: "2024" },
  });
  if (!ndcManifesto) {
    ndcManifesto = await prisma.manifestoDocument.create({
      data: {
        title: "NDC 2024 — Resetting Ghana (manifesto PDF)",
        partySlug: "ndc",
        electionCycle: "2024",
        sourceUrl: NDC_2024_MANIFESTO_URL,
        notes:
          "Public PDF on 2024 campaign site. Editors: confirm wording and page refs against the party’s canonical publication.",
      },
    });
  } else {
    ndcManifesto = await prisma.manifestoDocument.update({
      where: { id: ndcManifesto.id },
      data: {
        title: "NDC 2024 — Resetting Ghana (manifesto PDF)",
        sourceUrl: NDC_2024_MANIFESTO_URL,
        notes:
          "Public PDF on 2024 campaign site. Editors: confirm wording and page refs against the party’s canonical publication.",
      },
    });
  }

  let nppManifesto = await prisma.manifestoDocument.findFirst({
    where: { partySlug: "npp", electionCycle: "2024" },
  });
  if (!nppManifesto) {
    nppManifesto = await prisma.manifestoDocument.create({
      data: {
        title: "NPP 2024 — manifesto (PDF)",
        partySlug: "npp",
        electionCycle: "2024",
        sourceUrl: NPP_2024_MANIFESTO_URL,
        notes:
          "Commonly linked full PDF (e.g. NPP USA chapter host). Cross-check with newpatrioticparty.org or official campaign materials if the URL changes.",
      },
    });
  } else {
    nppManifesto = await prisma.manifestoDocument.update({
      where: { id: nppManifesto.id },
      data: {
        title: "NPP 2024 — manifesto (PDF)",
        sourceUrl: NPP_2024_MANIFESTO_URL,
        notes:
          "Commonly linked full PDF (e.g. NPP USA chapter host). Cross-check with newpatrioticparty.org or official campaign materials if the URL changes.",
      },
    });
  }

  await prisma.campaignPromise.deleteMany({
    where: { memberId: { in: members.map((x) => x.id) } },
  });

  const promiseRows = [
    {
      memberSlug: STARTER_MP_SLUGS[1],
      title: "E-Levy (electronic transactions levy) — operational and revenue track",
      description:
        "MBKRU tags this as fulfilled for dashboard demonstration: the e-levy instrument was enacted and collections are in force; editorial team should cite the Finance Act / GRA guidance and NDC 2024 fiscal chapter for exact wording.",
      sourceLabel: "NDC 2024 manifesto (Resetting Ghana) + post-2024 fiscal implementation — verify citations",
      sourceUrl: NDC_2024_MANIFESTO_URL,
      manifestoDocumentId: ndcManifesto.id,
      partySlug: "ndc",
      electionCycle: "2024",
      policySector: "FISCAL",
      isGovernmentProgramme: true,
      status: "FULFILLED",
    },
    {
      memberSlug: STARTER_MP_SLUGS[1],
      title: "Betting, gaming, and sports-revenue compliance (excise / GRA track)",
      description:
        "Seeded as fulfilled for sample analytics: Ghana has moved on betting/gaming excise and compliance narratives in public finance debates. Editors: tie to NDC 2024 fiscal pledges and post-budget GRA releases.",
      sourceLabel: "NDC 2024 manifesto — verify fiscal chapter; cross-check budget statements",
      sourceUrl: NDC_2024_MANIFESTO_URL,
      manifestoDocumentId: ndcManifesto.id,
      partySlug: "ndc",
      electionCycle: "2024",
      policySector: "FISCAL",
      isGovernmentProgramme: true,
      status: "FULFILLED",
    },
    {
      memberSlug: STARTER_MP_SLUGS[2],
      title: "Okada / motorcycle transport — licensing and formalisation pathway",
      description:
        "Public debate links NDC 2024 transport themes to okada regulation. MBKRU marks in progress while licensing rules and municipal pilots evolve; cite manifesto transport section and L.I. / DVLA updates as they land.",
      sourceLabel: "NDC 2024 manifesto — transport / jobs chapter (verify PDF)",
      sourceUrl: NDC_2024_MANIFESTO_URL,
      manifestoDocumentId: ndcManifesto.id,
      partySlug: "ndc",
      electionCycle: "2024",
      policySector: "SOCIAL",
      isGovernmentProgramme: true,
      status: "IN_PROGRESS",
    },
    {
      memberSlug: STARTER_MP_SLUGS[1],
      title: "24-hour economy — productivity and jobs (NDC 2024 programme theme)",
      description:
        "Theme summarised from public NDC 2024 materials. Editors: map this row to exact manifesto wording and page/section in the linked PDF.",
      sourceLabel: "NDC 2024 manifesto (Resetting Ghana) — verify page reference",
      sourceUrl: NDC_2024_MANIFESTO_URL,
      manifestoDocumentId: ndcManifesto.id,
      partySlug: "ndc",
      electionCycle: "2024",
      policySector: "FISCAL",
      isGovernmentProgramme: true,
      status: "TRACKING",
    },
    {
      memberSlug: STARTER_MP_SLUGS[1],
      title: "Health access and NHIS sustainability (NDC 2024 theme)",
      description:
        "High-level theme for editorial follow-up against the abridged/full NDC 2024 manifesto.",
      sourceLabel: "NDC 2024 manifesto — verify section in PDF",
      sourceUrl: NDC_2024_MANIFESTO_URL,
      manifestoDocumentId: ndcManifesto.id,
      partySlug: "ndc",
      electionCycle: "2024",
      policySector: "HEALTH",
      isGovernmentProgramme: true,
      status: "TRACKING",
    },
    {
      memberSlug: STARTER_MP_SLUGS[2],
      title: "Social protection and support for vulnerable groups (NDC 2024 theme)",
      description:
        "Editors: confirm exact pledge language and citation in the official NDC 2024 document.",
      sourceLabel: "NDC 2024 manifesto — verify in PDF",
      sourceUrl: NDC_2024_MANIFESTO_URL,
      manifestoDocumentId: ndcManifesto.id,
      partySlug: "ndc",
      electionCycle: "2024",
      policySector: "GOVERNANCE",
      isGovernmentProgramme: true,
      status: "TRACKING",
    },
    {
      memberSlug: STARTER_MP_SLUGS[0],
      title: "Jobs and business growth (NPP 2024 manifesto theme)",
      description:
        "Theme aligned to public NPP 2024 programme framing. Editors: tie to exact manifesto section/page.",
      sourceLabel: "NPP 2024 manifesto PDF — verify page reference",
      sourceUrl: NPP_2024_MANIFESTO_URL,
      manifestoDocumentId: nppManifesto.id,
      partySlug: "npp",
      electionCycle: "2024",
      policySector: "FISCAL",
      isGovernmentProgramme: false,
      status: "TRACKING",
    },
    {
      memberSlug: STARTER_MP_SLUGS[0],
      title: "Digital transformation and service delivery (NPP 2024 theme)",
      description: "Editors: confirm wording against the linked NPP 2024 PDF.",
      sourceLabel: "NPP 2024 manifesto PDF — verify section",
      sourceUrl: NPP_2024_MANIFESTO_URL,
      manifestoDocumentId: nppManifesto.id,
      partySlug: "npp",
      electionCycle: "2024",
      policySector: "GOVERNANCE",
      isGovernmentProgramme: false,
      status: "IN_PROGRESS",
    },
    {
      memberSlug: STARTER_MP_SLUGS[0],
      title: "Revenue assurance and fiscal consolidation transparency (executive programme)",
      description:
        "Cross-party executive-track sample so government-commitments filters can include NPP 2024 rows. Editors: align with NPP 2024 fiscal chapter and post-budget transparency instruments.",
      sourceLabel: "NPP 2024 manifesto PDF — verify fiscal chapter",
      sourceUrl: NPP_2024_MANIFESTO_URL,
      manifestoDocumentId: nppManifesto.id,
      partySlug: "npp",
      electionCycle: "2024",
      policySector: "FISCAL",
      isGovernmentProgramme: true,
      status: "TRACKING",
    },
  ];

  for (const p of promiseRows) {
    const mid = bySlug[p.memberSlug];
    if (!mid) continue;
    await prisma.campaignPromise.create({
      data: {
        memberId: mid,
        title: p.title,
        description: p.description ?? null,
        sourceLabel: p.sourceLabel,
        sourceUrl: p.sourceUrl ?? null,
        sourceDate: p.sourceDate ? new Date(p.sourceDate) : null,
        status: p.status ?? "TRACKING",
        manifestoDocumentId: p.manifestoDocumentId ?? null,
        manifestoPageRef: p.manifestoPageRef ?? null,
        partySlug: p.partySlug ?? null,
        electionCycle: p.electionCycle ?? null,
        isGovernmentProgramme: Boolean(p.isGovernmentProgramme),
        policySector: p.policySector ?? null,
      },
    });
  }

  const cycle = await prisma.reportCardCycle.upsert({
    where: { year: REPORT_CARD_PILOT_YEAR },
    create: {
      year: REPORT_CARD_PILOT_YEAR,
      label: "People's Report Card — pilot (layout & workflow)",
      publishedAt: new Date(),
      methodology: [
        "This cycle demonstrates the published report-card layout. Roster: verify sitting MPs at https://www.parliament.gh/members .",
        "Overall scores are intentionally unset until MBKRU completes evidence review and publishes methodology-aligned metrics (see /methodology).",
        "MP examples in seed: Bryan Acheampong (Abetifi), John Dramani Mahama (Bole Bamboi), Zanetor Agyeman-Rawlings (Klottey Korle) — confirm party and constituency against parliament.gh after by-elections or roster changes.",
      ].join("\n\n"),
    },
    update: {
      label: "People's Report Card — pilot (layout & workflow)",
      publishedAt: new Date(),
      methodology: [
        "This cycle demonstrates the published report-card layout. Roster: verify sitting MPs at https://www.parliament.gh/members .",
        "Overall scores are intentionally unset until MBKRU completes evidence review and publishes methodology-aligned metrics (see /methodology).",
        "MP examples in seed: Bryan Acheampong (Abetifi), John Dramani Mahama (Bole Bamboi), Zanetor Agyeman-Rawlings (Klottey Korle) — confirm party and constituency against parliament.gh after by-elections or roster changes.",
      ].join("\n\n"),
    },
  });

  await prisma.scorecardEntry.deleteMany({ where: { cycleId: cycle.id } });

  const pendingNarrative =
    "Layout preview: no published score yet — MBKRU will populate narratives and metrics after methodology sign-off and evidence review.";

  for (const slug of STARTER_MP_SLUGS) {
    const mid = bySlug[slug];
    if (!mid) continue;
    await prisma.scorecardEntry.create({
      data: {
        cycleId: cycle.id,
        memberId: mid,
        narrative: pendingNarrative,
        overallScore: null,
        metrics: null,
      },
    });
  }

  console.log(
    "Public accountability sample seeded: MPs=3 (verify on parliament.gh), NDC+NPP 2024 manifesto links, promises=9, report-card pilot year=" +
      REPORT_CARD_PILOT_YEAR,
  );
}

/** Upsert all rows from `prisma/data/constituencies.seed.json` (bundled; no admin CSV step). */
async function seedConstituenciesFromBundledJson() {
  const jsonPath = join(__dirname, "data", "constituencies.seed.json");
  if (!existsSync(jsonPath)) {
    console.warn("constituencies.seed.json missing — skipping bulk constituencies.");
    return;
  }
  let rows;
  try {
    rows = JSON.parse(readFileSync(jsonPath, "utf8"));
  } catch (e) {
    console.error("constituencies.seed.json parse error:", e.message);
    return;
  }
  if (!Array.isArray(rows)) return;
  let upserted = 0;
  let skippedRegion = 0;
  for (const r of rows) {
    if (!r?.slug || !r?.name || !r?.region_slug) continue;
    const region = await prisma.region.findUnique({ where: { slug: r.region_slug } });
    if (!region) {
      skippedRegion++;
      continue;
    }
    await prisma.constituency.upsert({
      where: { slug: r.slug },
      create: { name: r.name, slug: r.slug, regionId: region.id },
      update: { name: r.name, regionId: region.id },
    });
    upserted++;
  }
  console.log(
    `Constituencies from bundled JSON: ${upserted} upserted` +
      (skippedRegion ? ` (${skippedRegion} rows skipped — unknown region_slug)` : "") +
      ".",
  );
}

/**
 * Optional full MP roster: `prisma/data/parliament-members.seed.json`
 * Generate: `npm run data:refresh-members-seed` (or `node scripts/json-to-parliament-members-seed.mjs <mps.json>`).
 */
async function seedParliamentMembersFromBundledJson() {
  const jsonPath = join(__dirname, "data", "parliament-members.seed.json");
  if (!existsSync(jsonPath)) return;
  let rows;
  try {
    rows = JSON.parse(readFileSync(jsonPath, "utf8"));
  } catch (e) {
    console.error("parliament-members.seed.json parse error:", e.message);
    return;
  }
  if (!Array.isArray(rows) || rows.length === 0) return;
  let upserted = 0;
  let skipped = 0;
  for (const r of rows) {
    if (!r?.slug || !r?.name || !r?.role) continue;
    const cSlug = r.constituency_slug?.trim?.() || null;
    let constituencyId = null;
    if (cSlug) {
      const c = await prisma.constituency.findUnique({ where: { slug: cSlug } });
      if (!c) {
        skipped++;
        continue;
      }
      constituencyId = c.id;
    }
    await prisma.parliamentMember.upsert({
      where: { slug: r.slug },
      create: {
        name: r.name,
        slug: r.slug,
        role: r.role,
        party: r.party?.trim?.() || null,
        constituencyId,
        active: r.active !== false,
      },
      update: {
        name: r.name,
        role: r.role,
        party: r.party?.trim?.() || null,
        constituencyId,
        active: r.active !== false,
      },
    });
    upserted++;
  }
  console.log(
    `Parliament members from bundled JSON: ${upserted} upserted` +
      (skipped ? ` (${skipped} skipped — constituency_slug not in DB)` : "") +
      ".",
  );
}

const TOWN_HALL_PROGRAMME_CITATION =
  "Programme placeholders aligned with ROADMAP_2028_ELECTION.md and website programmeRoadmap (Q2–Q4 2026). Not confirmed events — see prisma/data/TOWN_HALL_SEED_SOURCES.txt.";

/** Roadmap-aligned programme rows for /town-halls (dates TBC until partners confirm). */
async function seedTownHallProgrammeFromRoadmap() {
  const rows = [
    {
      slug: "pilot-town-hall-greater-accra-q2-2026",
      kind: "TOWN_HALL",
      title: "Town Hall pilot — Greater Accra",
      summary:
        "First regional listening session under the physical engagement pillar. Date, venue, and registration will be announced on News when partners confirm.",
      regionSlug: "greater-accra",
      programmeQuarter: "Q2 2026",
      sortOrder: 10,
    },
    {
      slug: "town-hall-ashanti-q3-2026",
      kind: "TOWN_HALL",
      title: "Town Hall — Ashanti Region",
      summary: "Planned regional session after the Greater Accra pilot (national rollout roadmap).",
      regionSlug: "ashanti",
      programmeQuarter: "Q3 2026",
      sortOrder: 20,
    },
    {
      slug: "town-hall-western-q3-2026",
      kind: "TOWN_HALL",
      title: "Town Hall — Western Region",
      summary: "Planned regional session (oil & gas and coastal accountability themes).",
      regionSlug: "western",
      programmeQuarter: "Q3 2026",
      sortOrder: 30,
    },
    {
      slug: "town-hall-central-q3-2026",
      kind: "TOWN_HALL",
      title: "Town Hall — Central Region",
      summary: "Planned regional session (tourism and fisheries themes).",
      regionSlug: "central",
      programmeQuarter: "Q3 2026",
      sortOrder: 40,
    },
    {
      slug: "town-hall-eastern-q4-2026",
      kind: "TOWN_HALL",
      title: "Town Hall — Eastern Region",
      summary: "Planned regional session (agriculture and cocoa themes).",
      regionSlug: "eastern",
      programmeQuarter: "Q4 2026",
      sortOrder: 50,
    },
    {
      slug: "town-hall-volta-q4-2026",
      kind: "TOWN_HALL",
      title: "Town Hall — Volta Region",
      summary: "Planned regional session.",
      regionSlug: "volta",
      programmeQuarter: "Q4 2026",
      sortOrder: 60,
    },
    {
      slug: "town-hall-northern-q4-2026",
      kind: "TOWN_HALL",
      title: "Town Hall — Northern Region",
      summary: "Planned regional session (Northern hub / Tamale).",
      regionSlug: "northern",
      programmeQuarter: "Q4 2026",
      sortOrder: 70,
    },
    {
      slug: "town-hall-bono-q4-2026",
      kind: "TOWN_HALL",
      title: "Town Hall — Bono Region",
      summary: "Planned regional session (Sunyani hub).",
      regionSlug: "bono",
      programmeQuarter: "Q4 2026",
      sortOrder: 80,
    },
    {
      slug: "regional-public-forums-broadcast-2026",
      kind: "REGIONAL_FORUM",
      title: "Regional Public Forums (broadcast)",
      summary:
        "Partner radio, TV, and streaming where agreed — programme design from roadmap Q3–Q4 2026 national rollout. No single venue; follow News for each forum.",
      regionSlug: null,
      programmeQuarter: "Q3–Q4 2026",
      sortOrder: 90,
    },
  ];

  let n = 0;
  for (const row of rows) {
    let regionId = null;
    if (row.regionSlug) {
      const reg = await prisma.region.findUnique({ where: { slug: row.regionSlug } });
      if (!reg) {
        console.warn(`Town hall seed: unknown region "${row.regionSlug}" for ${row.slug} — skipping.`);
        continue;
      }
      regionId = reg.id;
    }
    await prisma.townHallEvent.upsert({
      where: { slug: row.slug },
      create: {
        slug: row.slug,
        kind: row.kind,
        title: row.title,
        summary: row.summary,
        regionId,
        programmeQuarter: row.programmeQuarter,
        status: "TBC",
        sourceCitation: TOWN_HALL_PROGRAMME_CITATION,
        sortOrder: row.sortOrder,
      },
      update: {
        kind: row.kind,
        title: row.title,
        summary: row.summary,
        regionId,
        programmeQuarter: row.programmeQuarter,
        sourceCitation: TOWN_HALL_PROGRAMME_CITATION,
        sortOrder: row.sortOrder,
      },
    });
    n++;
  }
  console.log("Town hall programme rows seeded:", n, "(see prisma/data/TOWN_HALL_SEED_SOURCES.txt).");
}

const CONSTITUENCY_DEBATE_CITATION =
  "Examples toward ROADMAP_2028_ELECTION.md Q3 2028 (pre-election debates, 275 constituencies). Not scheduled events — see prisma/data/TOWN_HALL_SEED_SOURCES.txt.";

/** Sample constituency debate programme rows (requires constituencies in DB — runs after bundled constituency JSON). */
async function seedConstituencyDebateProgrammeRows() {
  const samples = [
    {
      slug: "debate-klottey-korle-programme-2028",
      constituencySlug: "klottey-korle",
      title: "Constituency debate — Klottey Korle (programme placeholder)",
      summary:
        "Illustrative row for accountability debate planning. Date, venue, and moderators TBC; follow News when MBKRU confirms a schedule.",
      programmeQuarter: "Q3 2028",
      sortOrder: 200,
    },
    {
      slug: "debate-abetifi-programme-2028",
      constituencySlug: "abetifi",
      title: "Constituency debate — Abetifi (programme placeholder)",
      summary:
        "Illustrative rural constituency row for the same national debate framework. Operational expansion requires partner and EC coordination.",
      programmeQuarter: "Q3 2028",
      sortOrder: 210,
    },
  ];

  let n = 0;
  for (const s of samples) {
    const c = await prisma.constituency.findUnique({ where: { slug: s.constituencySlug } });
    if (!c) {
      console.warn(
        `Constituency debate seed: no constituency "${s.constituencySlug}" — run constituencies JSON or starter accountability seed.`,
      );
      continue;
    }
    await prisma.townHallEvent.upsert({
      where: { slug: s.slug },
      create: {
        slug: s.slug,
        kind: "CONSTITUENCY_DEBATE",
        title: s.title,
        summary: s.summary,
        regionId: c.regionId,
        constituencyId: c.id,
        programmeQuarter: s.programmeQuarter,
        status: "TBC",
        sourceCitation: CONSTITUENCY_DEBATE_CITATION,
        sortOrder: s.sortOrder,
      },
      update: {
        kind: "CONSTITUENCY_DEBATE",
        title: s.title,
        summary: s.summary,
        regionId: c.regionId,
        constituencyId: c.id,
        programmeQuarter: s.programmeQuarter,
        sourceCitation: CONSTITUENCY_DEBATE_CITATION,
        sortOrder: s.sortOrder,
      },
    });
    n++;
  }
  if (n > 0) {
    console.log("Constituency debate programme placeholders seeded:", n);
  }
}

/** Development-only Member logins for /login and role workflows — rotate passwords before any production pilot. */
async function seedMemberDemo() {
  const accra = await prisma.region.findUnique({ where: { slug: "greater-accra" } });
  const users = [
    {
      email: (process.env.SEED_MEMBER_EMAIL || "pilot.member@mbkru.local").trim().toLowerCase(),
      password: process.env.SEED_MEMBER_PASSWORD || "PilotMember!change-me-2026",
      displayName: "Pilot Member (seed)",
      regionId: accra?.id ?? null,
    },
    {
      email: (process.env.SEED_MEMBER_2_EMAIL || "pilot.two@mbkru.local").trim().toLowerCase(),
      password: process.env.SEED_MEMBER_2_PASSWORD || process.env.SEED_MEMBER_PASSWORD || "PilotMember!change-me-2026",
      displayName: "Pilot Two (seed)",
      regionId: null,
    },
  ];

  const seen = new Set();
  for (const u of users) {
    if (!u.email || seen.has(u.email)) continue;
    seen.add(u.email);
    const password = await bcrypt.hash(u.password, 12);
    await prisma.member.upsert({
      where: { email: u.email },
      create: {
        email: u.email,
        password,
        displayName: u.displayName,
        regionId: u.regionId,
      },
      update: {
        password,
        displayName: u.displayName,
        regionId: u.regionId,
      },
    });
    console.log("Member demo upserted:", u.email);
  }
  console.warn(
    "SEED_MEMBER_DEMO: change passwords before any real pilot — credentials are in env or defaults above.",
  );
}

/** Real-world-themed communities (citations in JSON descriptions). Upsert by slug. */
async function seedCommunitiesFromBundledJson() {
  const jsonPath = join(__dirname, "data", "communities.seed.json");
  if (!existsSync(jsonPath)) {
    console.warn("communities.seed.json missing — skipping community seed.");
    return;
  }
  let rows;
  try {
    rows = JSON.parse(readFileSync(jsonPath, "utf8"));
  } catch (e) {
    console.error("communities.seed.json parse error:", e.message);
    return;
  }
  if (!Array.isArray(rows)) return;
  let n = 0;
  for (const r of rows) {
    if (!r?.slug || !r?.name || !r?.description) continue;
    const region = r.region_slug ? await prisma.region.findUnique({ where: { slug: r.region_slug } }) : null;
    if (r.region_slug && !region) {
      console.warn(`Community "${r.slug}": unknown region_slug "${r.region_slug}" — skipping.`);
      continue;
    }
    await prisma.community.upsert({
      where: { slug: r.slug },
      create: {
        slug: r.slug,
        name: r.name,
        description: r.description,
        regionId: region?.id ?? null,
        traditionalAreaName: r.traditionalAreaName?.trim?.() || null,
        joinPolicy: r.joinPolicy || "OPEN",
        visibility: r.visibility || "PUBLIC",
        status: r.status || "ACTIVE",
      },
      update: {
        name: r.name,
        description: r.description,
        regionId: region?.id ?? null,
        traditionalAreaName: r.traditionalAreaName?.trim?.() || null,
        joinPolicy: r.joinPolicy || "OPEN",
        visibility: r.visibility || "PUBLIC",
        status: r.status || "ACTIVE",
      },
    });
    n++;
  }
  console.log(`Communities from bundled JSON: ${n} upserted.`);
}

/**
 * Memberships + published posts so /communities and threads work.
 * Uses development Member accounts only; not palace-verified traditional authority.
 */
async function seedCommunityPilotInteractions() {
  const email1 = (process.env.SEED_MEMBER_EMAIL || "pilot.member@mbkru.local").trim().toLowerCase();
  const email2 = (process.env.SEED_MEMBER_2_EMAIL || "pilot.two@mbkru.local").trim().toLowerCase();
  const m1 = await prisma.member.findUnique({ where: { email: email1 } });
  const m2 = await prisma.member.findUnique({ where: { email: email2 } });
  if (!m1 || !m2) {
    console.log("Community pilot interactions skipped — pilot members not found (set SEED_MEMBER_DEMO=1).");
    return;
  }

  const aj = await prisma.community.findUnique({ where: { slug: "ajumako-traditional-council" } });
  const su = await prisma.community.findUnique({ where: { slug: "sunyani-traditional-council" } });
  if (!aj || !su) {
    console.log("Community pilot interactions skipped — seeded communities missing.");
    return;
  }

  await prisma.communityMembership.upsert({
    where: { communityId_memberId: { communityId: aj.id, memberId: m1.id } },
    create: { communityId: aj.id, memberId: m1.id, role: "QUEEN_MOTHER_VERIFIED", state: "ACTIVE" },
    update: { role: "QUEEN_MOTHER_VERIFIED", state: "ACTIVE" },
  });
  await prisma.communityMembership.upsert({
    where: { communityId_memberId: { communityId: aj.id, memberId: m2.id } },
    create: { communityId: aj.id, memberId: m2.id, role: "MEMBER", state: "ACTIVE" },
    update: { role: "MEMBER", state: "ACTIVE" },
  });
  await prisma.communityMembership.upsert({
    where: { communityId_memberId: { communityId: su.id, memberId: m1.id } },
    create: { communityId: su.id, memberId: m1.id, role: "MEMBER", state: "ACTIVE" },
    update: { role: "MEMBER", state: "ACTIVE" },
  });
  await prisma.communityMembership.upsert({
    where: { communityId_memberId: { communityId: su.id, memberId: m2.id } },
    create: { communityId: su.id, memberId: m2.id, role: "MODERATOR", state: "ACTIVE" },
    update: { role: "MODERATOR", state: "ACTIVE" },
  });

  const annBody =
    "Welcome. This space covers civic themes linked to Ajumako Traditional Area (Central Region). " +
    "The Ajumako Traditional Council publishes a Queen Mothers listing on its public website.\n\n" +
    "Source: Ajumako Traditional Council — Queen Mothers page, https://efuajumakotcouncil.com/?page=queens\n\n" +
    "MBKRU is independent and does not speak for the Council. Confirm facts with official channels.";
  const modBody =
    "Discussion for themes related to Sunyani Traditional Area (Bono Region). " +
    "University of Energy and Natural Resources (UENR) has published items on Sunyani Traditional Council leadership.\n\n" +
    "Reference: https://uenr.edu.gh/ (site search: Sunyani Traditional Council)\n\n" +
    "Confirm electoral and boundary matters with the Electoral Commission and the Council.";

  const legacyAj = await prisma.communityPost.findFirst({
    where: { communityId: aj.id, body: { startsWith: "[MBKRU seed demo | aj-ann]" } },
  });
  if (legacyAj) {
    await prisma.communityPost.update({ where: { id: legacyAj.id }, data: { body: annBody } });
  } else if (
    !(await prisma.communityPost.findFirst({
      where: { communityId: aj.id, authorMemberId: m1.id, kind: "ANNOUNCEMENT", pinned: true },
    }))
  ) {
    await prisma.communityPost.create({
      data: {
        communityId: aj.id,
        authorMemberId: m1.id,
        kind: "ANNOUNCEMENT",
        body: annBody,
        moderationStatus: "PUBLISHED",
        pinned: true,
      },
    });
  }

  const legacySu = await prisma.communityPost.findFirst({
    where: { communityId: su.id, body: { startsWith: "[MBKRU seed demo | su-mod]" } },
  });
  if (legacySu) {
    await prisma.communityPost.update({ where: { id: legacySu.id }, data: { body: modBody } });
  } else if (
    !(await prisma.communityPost.findFirst({
      where: { communityId: su.id, authorMemberId: m2.id, kind: "GENERAL" },
    }))
  ) {
    await prisma.communityPost.create({
      data: {
        communityId: su.id,
        authorMemberId: m2.id,
        kind: "GENERAL",
        body: modBody,
        moderationStatus: "PUBLISHED",
        pinned: false,
      },
    });
  }

  console.log("Community pilot interactions: memberships + sourced posts ensured.");
}

/**
 * Optional admin/workflow fixtures: Voice (+ file), situational & election rows, contact row, verification queue.
 * Public-facing report bodies are written as generic casework language; internal origin is recorded in staffNotes where available.
 * Requires communities + second pilot member for verification queue when those seeds run.
 */
async function seedEngagementDemos() {
  const uploadRoot = join(__dirname, "..", "public", "uploads");
  mkdirSync(uploadRoot, { recursive: true });
  const verifyName = "mbkru-seed-verification-doc.png";
  const voiceName = "mbkru-seed-voice-attachment.png";
  writeFileSync(join(uploadRoot, verifyName), SEED_DEMO_PNG);
  writeFileSync(join(uploadRoot, voiceName), SEED_DEMO_PNG);

  const pathVerify = `/uploads/${verifyName}`;
  const pathVoice = `/uploads/${voiceName}`;

  let mediaVerify = await prisma.media.findFirst({ where: { storagePath: pathVerify } });
  if (!mediaVerify) {
    mediaVerify = await prisma.media.create({
      data: {
        filename: "verification-sample.png",
        storagePath: pathVerify,
        mimeType: "image/png",
        alt: "Sample verification document (PNG)",
      },
    });
  }

  let mediaVoice = await prisma.media.findFirst({ where: { storagePath: pathVoice } });
  if (!mediaVoice) {
    mediaVoice = await prisma.media.create({
      data: {
        filename: "report-attachment-sample.png",
        storagePath: pathVoice,
        mimeType: "image/png",
        alt: "Sample report attachment (PNG)",
      },
    });
  }

  const accra = await prisma.region.findUnique({ where: { slug: "greater-accra" } });
  const northern = await prisma.region.findUnique({ where: { slug: "northern" } });
  const volta = await prisma.region.findUnique({ where: { slug: "volta" } });

  const voiceReport = await prisma.citizenReport.upsert({
    where: { trackingCode: "MBKRU-SEED-VOICE-1" },
    create: {
      trackingCode: "MBKRU-SEED-VOICE-1",
      kind: "VOICE",
      title: "Street lighting — market vicinity (Greater Accra)",
      body: "Concern about inadequate street lighting affecting pedestrian safety near a busy trading area after dark. Requesting assessment and a repair timeline from the responsible authority.",
      category: "Infrastructure",
      status: "UNDER_REVIEW",
      regionId: accra?.id ?? null,
      staffNotes:
        "Created by prisma db seed (SEED_ENGAGEMENT_DEMOS or SEED_VOICE_DEMO). Tracking MBKRU-SEED-VOICE-1. Archive when replacing with live submissions.",
    },
    update: {
      kind: "VOICE",
      title: "Street lighting — market vicinity (Greater Accra)",
      body: "Concern about inadequate street lighting affecting pedestrian safety near a busy trading area after dark. Requesting assessment and a repair timeline from the responsible authority.",
      category: "Infrastructure",
      status: "UNDER_REVIEW",
      regionId: accra?.id ?? null,
      staffNotes:
        "Created by prisma db seed (SEED_ENGAGEMENT_DEMOS or SEED_VOICE_DEMO). Tracking MBKRU-SEED-VOICE-1. Archive when replacing with live submissions.",
    },
  });

  const attCount = await prisma.citizenReportAttachment.count({ where: { reportId: voiceReport.id } });
  if (attCount === 0) {
    await prisma.citizenReportAttachment.create({
      data: {
        reportId: voiceReport.id,
        path: pathVoice,
        mimeType: "image/png",
      },
    });
  }

  await prisma.citizenReport.upsert({
    where: { trackingCode: "MBKRU-SEED-SITUATIONAL-1" },
    create: {
      trackingCode: "MBKRU-SEED-SITUATIONAL-1",
      kind: "SITUATIONAL_ALERT",
      title: "Road access — extended closure",
      body: "Note of a prolonged road closure affecting access to a market area. Requesting official diversion routes and an estimated reopening date.",
      category: "Transport",
      status: "RECEIVED",
      regionId: northern?.id ?? null,
      staffNotes:
        "Created by prisma db seed. Tracking MBKRU-SEED-SITUATIONAL-1. Verify before external relay — not corroborated.",
    },
    update: {
      kind: "SITUATIONAL_ALERT",
      title: "Road access — extended closure",
      body: "Note of a prolonged road closure affecting access to a market area. Requesting official diversion routes and an estimated reopening date.",
      category: "Transport",
      status: "RECEIVED",
      regionId: northern?.id ?? null,
      staffNotes:
        "Created by prisma db seed. Tracking MBKRU-SEED-SITUATIONAL-1. Verify before external relay — not corroborated.",
    },
  });

  await prisma.citizenReport.upsert({
    where: { trackingCode: "MBKRU-SEED-ELECTION-1" },
    create: {
      trackingCode: "MBKRU-SEED-ELECTION-1",
      kind: "ELECTION_OBSERVATION",
      title: "Polling day — queue and wait times",
      body: "Observation of queue length and waiting times at a polling location. No allegation of irregularity is recorded in this note.",
      category: "Queues",
      status: "UNDER_REVIEW",
      regionId: volta?.id ?? null,
      staffNotes:
        "Created by prisma db seed. Tracking MBKRU-SEED-ELECTION-1. Not from an accredited observation mission — archive or replace for production.",
    },
    update: {
      kind: "ELECTION_OBSERVATION",
      title: "Polling day — queue and wait times",
      body: "Observation of queue length and waiting times at a polling location. No allegation of irregularity is recorded in this note.",
      category: "Queues",
      status: "UNDER_REVIEW",
      regionId: volta?.id ?? null,
      staffNotes:
        "Created by prisma db seed. Tracking MBKRU-SEED-ELECTION-1. Not from an accredited observation mission — archive or replace for production.",
    },
  });

  const contactDup = await prisma.contactSubmission.findFirst({
    where: { email: "mbkru.seed.contact@example.com" },
  });
  if (!contactDup) {
    await prisma.contactSubmission.create({
      data: {
        name: "MBKRU deployment",
        email: "mbkru.seed.contact@example.com",
        subject: "Partnership — regional forum",
        message:
          "We would like to explore co-hosting a regional listening session with MBKRU.\n\n" +
          "— This entry was created by prisma db seed for inbox workflow testing; archive if not required.",
        enquiryType: "Partnership",
      },
    });
  }

  const email2 = (process.env.SEED_MEMBER_2_EMAIL || "pilot.two@mbkru.local").trim().toLowerCase();
  const m2 = await prisma.member.findUnique({ where: { email: email2 } });
  const su = await prisma.community.findUnique({ where: { slug: "sunyani-traditional-council" } });
  if (m2 && su) {
    const pending = await prisma.communityVerificationRequest.findFirst({
      where: { memberId: m2.id, communityId: su.id, status: "SUBMITTED" },
    });
    if (!pending) {
      await prisma.communityVerificationRequest.create({
        data: {
          communityId: su.id,
          memberId: m2.id,
          status: "SUBMITTED",
          documentMediaIds: [mediaVerify.id],
        },
      });
    }
  }

  console.log(
    "Engagement fixtures: Voice (+attachment), situational & election reports, contact row, verification queue (when pilot member + Sunyani community exist).",
  );
}

/**
 * Petitions, public-cause supports/comments, follow-up community posts, and in-app notifications for the demo cohort.
 * Idempotent (fixed slugs, tracking codes, and bodies). `community` may be null if no Community rows exist.
 */
async function seedDashboardDemoCohortActivityExtensions(members, community) {
  const staff = "prisma seed — seedDashboardDemoCohortActivityExtensions (SEED_ENGAGEMENT_DEMOS=1). Safe to archive.";

  const causeReport = await prisma.citizenReport.upsert({
    where: { trackingCode: "MBKRU-DEMO-COHORT-CAUSE-PUBLIC-1" },
    create: {
      trackingCode: "MBKRU-DEMO-COHORT-CAUSE-PUBLIC-1",
      kind: "VOICE",
      memberId: members[2].id,
      title: "Street lighting — public cause (seed)",
      body:
        "Fixture narrative for admin triage only. The public thread below uses a short summary; supports and comments exercise the citizens-voice causes UX.",
      category: "Infrastructure",
      status: "UNDER_REVIEW",
      regionId: members[2].regionId,
      staffNotes: staff,
      publicCauseSlug: "seed-demo-neighbourhood-lighting",
      publicCauseTitle: "Safer evening walkways — lighting request",
      publicCauseSummary:
        "Residents are asking for a published schedule for lamp repairs on the main walking route. Seed data for public causes — not a live case.",
      publicCauseOpenedAt: new Date("2026-03-15T12:00:00.000Z"),
      publicCauseClosed: false,
    },
    update: {
      memberId: members[2].id,
      title: "Street lighting — public cause (seed)",
      body:
        "Fixture narrative for admin triage only. The public thread below uses a short summary; supports and comments exercise the citizens-voice causes UX.",
      category: "Infrastructure",
      status: "UNDER_REVIEW",
      regionId: members[2].regionId,
      staffNotes: staff,
      publicCauseSlug: "seed-demo-neighbourhood-lighting",
      publicCauseTitle: "Safer evening walkways — lighting request",
      publicCauseSummary:
        "Residents are asking for a published schedule for lamp repairs on the main walking route. Seed data for public causes — not a live case.",
      publicCauseOpenedAt: new Date("2026-03-15T12:00:00.000Z"),
      publicCauseClosed: false,
    },
  });

  const supportIndices = [3, 4, 5, 6, 8];
  for (const idx of supportIndices) {
    await prisma.citizenReportSupport.upsert({
      where: {
        reportId_memberId: { reportId: causeReport.id, memberId: members[idx].id },
      },
      create: { reportId: causeReport.id, memberId: members[idx].id },
      update: {},
    });
  }

  const causeComments = [
    { memberIndex: 7, body: "Thanks for raising this — we need a clear timeline from the assembly." },
    { memberIndex: 0, body: "Following. Please post any official response here when it arrives." },
    { memberIndex: 9, body: "Happy to help gather photos for a council packet if that helps." },
  ];
  for (const c of causeComments) {
    const exists = await prisma.citizenReportPublicComment.findFirst({
      where: {
        reportId: causeReport.id,
        memberId: members[c.memberIndex].id,
        body: c.body,
      },
    });
    if (!exists) {
      await prisma.citizenReportPublicComment.create({
        data: {
          reportId: causeReport.id,
          memberId: members[c.memberIndex].id,
          body: c.body,
          status: "VISIBLE",
        },
      });
    }
  }
  console.log("Demo cohort: public cause + supports + comments ensured (tracking MBKRU-DEMO-COHORT-CAUSE-PUBLIC-1).");

  const petitionStreet = await prisma.petition.upsert({
    where: { slug: "mbkru-seed-cohort-petition-street-safety" },
    create: {
      slug: "mbkru-seed-cohort-petition-street-safety",
      title: "Publish ward-level street lighting repair schedules (seed)",
      summary: "Demo petition: cohort member 1 asks for transparent schedules; other members sign.",
      body: [
        "## Seed petition",
        "",
        "This petition was created by **prisma db seed** for UI and moderation testing. It is not a live campaign.",
        "",
        "We ask for published, ward-level schedules for street lighting maintenance so residents can plan safe evening travel.",
      ].join("\n"),
      targetSignatures: 500,
      regionId: members[0].regionId,
      authorMemberId: members[0].id,
      status: "OPEN",
    },
    update: {
      title: "Publish ward-level street lighting repair schedules (seed)",
      summary: "Demo petition: cohort member 1 asks for transparent schedules; other members sign.",
      body: [
        "## Seed petition",
        "",
        "This petition was created by **prisma db seed** for UI and moderation testing. It is not a live campaign.",
        "",
        "We ask for published, ward-level schedules for street lighting maintenance so residents can plan safe evening travel.",
      ].join("\n"),
      targetSignatures: 500,
      regionId: members[0].regionId,
      authorMemberId: members[0].id,
      status: "OPEN",
    },
  });

  const petitionYouth = await prisma.petition.upsert({
    where: { slug: "mbkru-seed-cohort-petition-youth-skills" },
    create: {
      slug: "mbkru-seed-cohort-petition-youth-skills",
      title: "Pilot youth skills clinics — transparency on venues (seed)",
      summary: "Second demo petition by cohort member 2; cross-signatures from others.",
      body: [
        "## Seed petition",
        "",
        "Fixture data: requests clarity on how pilot skills clinics choose venues and publish outcomes.",
      ].join("\n"),
      targetSignatures: 200,
      regionId: members[1].regionId,
      authorMemberId: members[1].id,
      status: "OPEN",
    },
    update: {
      title: "Pilot youth skills clinics — transparency on venues (seed)",
      summary: "Second demo petition by cohort member 2; cross-signatures from others.",
      body: [
        "## Seed petition",
        "",
        "Fixture data: requests clarity on how pilot skills clinics choose venues and publish outcomes.",
      ].join("\n"),
      targetSignatures: 200,
      regionId: members[1].regionId,
      authorMemberId: members[1].id,
      status: "OPEN",
    },
  });

  const streetSignerIndices = [1, 2, 3, 4, 5, 7];
  for (const idx of streetSignerIndices) {
    const mem = members[idx];
    await prisma.petitionSignature.upsert({
      where: {
        petitionId_signerEmail: { petitionId: petitionStreet.id, signerEmail: mem.email },
      },
      create: {
        petitionId: petitionStreet.id,
        memberId: mem.id,
        signerEmail: mem.email,
        signerName: mem.displayName ?? undefined,
        consentShowName: true,
        consentUpdates: idx % 2 === 0,
      },
      update: {},
    });
  }

  const youthSignerIndices = [0, 2, 3, 4, 6, 8];
  for (const idx of youthSignerIndices) {
    const mem = members[idx];
    await prisma.petitionSignature.upsert({
      where: {
        petitionId_signerEmail: { petitionId: petitionYouth.id, signerEmail: mem.email },
      },
      create: {
        petitionId: petitionYouth.id,
        memberId: mem.id,
        signerEmail: mem.email,
        signerName: mem.displayName ?? undefined,
        consentShowName: idx % 3 !== 0,
        consentUpdates: false,
      },
      update: {},
    });
  }
  console.log("Demo cohort: petitions + cross-member signatures ensured (2 open petitions).");

  if (community) {
    const replyBodies = [
      {
        authorIdx: 4,
        body: "Re: clean-up day — I can bring tools Saturday if we confirm the venue with the chief’s office.",
        kind: "GENERAL",
      },
      {
        authorIdx: 5,
        body: "Following the hall thread: has anyone heard back from the secretary on meeting minutes?",
        kind: "GENERAL",
      },
    ];
    for (const r of replyBodies) {
      const exists = await prisma.communityPost.findFirst({
        where: {
          communityId: community.id,
          authorMemberId: members[r.authorIdx].id,
          body: r.body,
        },
      });
      if (!exists) {
        await prisma.communityPost.create({
          data: {
            communityId: community.id,
            authorMemberId: members[r.authorIdx].id,
            kind: r.kind,
            body: r.body,
            moderationStatus: "PUBLISHED",
          },
        });
      }
    }
    console.log("Demo cohort: follow-up community posts ensured.");

    const joinNotif = await prisma.memberNotification.findFirst({
      where: { memberId: members[3].id, type: "community_join_approved" },
    });
    if (!joinNotif) {
      await prisma.memberNotification.create({
        data: {
          memberId: members[3].id,
          type: "community_join_approved",
          payload: { communitySlug: community.slug, communityName: community.name },
        },
      });
    }

    const firstPostByM0 = await prisma.communityPost.findFirst({
      where: { communityId: community.id, authorMemberId: members[0].id },
      orderBy: { createdAt: "asc" },
    });
    if (firstPostByM0) {
      const pubNotif = await prisma.memberNotification.findFirst({
        where: { memberId: members[0].id, type: "community_post_published" },
      });
      if (!pubNotif) {
        await prisma.memberNotification.create({
          data: {
            memberId: members[0].id,
            type: "community_post_published",
            payload: { postId: firstPostByM0.id, communitySlug: community.slug },
          },
        });
      }
    }
    console.log("Demo cohort: sample in-app notifications ensured (when applicable).");
  } else {
    console.log("Demo cohort: no community — skipped reply posts + notifications.");
  }

  const adminForReply = await prisma.admin.findFirst({ orderBy: { createdAt: "asc" } });
  const seedReplyReport = await prisma.citizenReport.findUnique({
    where: { trackingCode: "MBKRU-DEMO-COHORT-V-3" },
    select: { id: true },
  });
  if (adminForReply && seedReplyReport) {
    const hasReply = await prisma.citizenReportAdminReply.findFirst({
      where: { reportId: seedReplyReport.id },
    });
    if (!hasReply) {
      await prisma.citizenReportAdminReply.create({
        data: {
          reportId: seedReplyReport.id,
          adminId: adminForReply.id,
          body:
            "Thank you for this Voice report (seed data). This is a sample team note visible on “My reports” and Track a report — not a real triage outcome.",
        },
      });
      console.log("Demo cohort: sample admin reply on MBKRU-DEMO-COHORT-V-3");
    }
  }
}

/**
 * Ten demo Member accounts plus linked reports (all CitizenReportKind values), community join/activity, and lead rows.
 * Idempotent via fixed emails and tracking codes. Requires regions; communities optional (skipped if none ACTIVE).
 */
async function seedDashboardDemoCohort() {
  const plain =
    (process.env.SEED_DEMO_COHORT_PASSWORD || process.env.SEED_MEMBER_PASSWORD || "DemoCohort!change-2026").trim();
  const password = await bcrypt.hash(plain, 12);
  const regions = await prisma.region.findMany({ orderBy: { sortOrder: "asc" } });
  const regionAt = (i) => regions[i % Math.max(regions.length, 1)]?.id ?? null;

  const emails = Array.from({ length: 10 }, (_, i) => `demo.cohort${String(i + 1).padStart(2, "0")}@mbkru.local`);
  const members = [];
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    const m = await prisma.member.upsert({
      where: { email },
      create: {
        email,
        password,
        displayName: `Demo cohort member ${i + 1}`,
        regionId: regionAt(i),
      },
      update: {
        password,
        displayName: `Demo cohort member ${i + 1}`,
        regionId: regionAt(i),
      },
    });
    members.push(m);
  }
  console.log("Demo cohort: 10 members upserted (", emails[0], "…", emails[9], "). Password from env or default — rotate for production.");

  const reportFixtures = [
    {
      code: "MBKRU-DEMO-COHORT-WB-1",
      memberIndex: 0,
      kind: "VOICE",
      title: "Governance concern — procurement documentation",
      body: "Request for clarity on how a public tender was evaluated. Submitted as a Voice report with whistleblow-style governance language for admin triage testing only.",
      category: "Whistleblow (Voice)",
      status: "UNDER_REVIEW",
    },
    {
      code: "MBKRU-DEMO-COHORT-WB-2",
      memberIndex: 1,
      kind: "VOICE",
      title: "Anonymous-style tip follow-up (seed)",
      body: "Second seed Voice row tagged for governance review workflows. Not a verified allegation — fixture data.",
      category: "Whistleblow (Voice)",
      status: "RECEIVED",
    },
    {
      code: "MBKRU-DEMO-COHORT-V-3",
      memberIndex: 2,
      kind: "VOICE",
      title: "Street drainage — neighbourhood update",
      body: "Routine Voice casework example: standing water after rain and request for inspection.",
      category: "Infrastructure",
      status: "RECEIVED",
    },
    {
      code: "MBKRU-DEMO-COHORT-S-1",
      memberIndex: 3,
      kind: "SITUATIONAL_ALERT",
      title: "Market access — temporary barrier",
      body: "Situational note: temporary barrier affecting foot traffic. Asks for official notice or timeline.",
      category: "Community activity",
      status: "RECEIVED",
    },
    {
      code: "MBKRU-DEMO-COHORT-S-2",
      memberIndex: 4,
      kind: "SITUATIONAL_ALERT",
      title: "Festival week — crowd routing",
      body: "Community activity observation during a local event; requests better signage from organisers.",
      category: "Community activity",
      status: "UNDER_REVIEW",
    },
    {
      code: "MBKRU-DEMO-COHORT-E-1",
      memberIndex: 5,
      kind: "ELECTION_OBSERVATION",
      title: "Early voting — accessibility",
      body: "Election observation seed: queue moved quickly; asks whether accessibility ramps are marked consistently.",
      category: "Accessibility",
      status: "RECEIVED",
    },
    {
      code: "MBKRU-DEMO-COHORT-E-2",
      memberIndex: 6,
      kind: "ELECTION_OBSERVATION",
      title: "Party agent presence (seed)",
      body: "Fixture observation only — not accredited mission data.",
      category: "Party agents",
      status: "UNDER_REVIEW",
    },
    {
      code: "MBKRU-DEMO-COHORT-V-4",
      memberIndex: 7,
      kind: "VOICE",
      title: "Health outreach — scheduling",
      body: "Voice report asking for published schedule for a mobile clinic visit.",
      category: "Health",
      status: "CLOSED",
    },
    {
      code: "MBKRU-DEMO-COHORT-S-3",
      memberIndex: 8,
      kind: "SITUATIONAL_ALERT",
      title: "Flood-prone road segment",
      body: "Situational alert seed: standing water after moderate rain; no injury reported.",
      category: "Weather / roads",
      status: "RECEIVED",
    },
    {
      code: "MBKRU-DEMO-COHORT-E-3",
      memberIndex: 9,
      kind: "ELECTION_OBSERVATION",
      title: "Counting centre — observer distance",
      body: "Election observation seed: distance between observers and tables — procedural question only.",
      category: "Observation",
      status: "RECEIVED",
    },
  ];

  for (const r of reportFixtures) {
    const mem = members[r.memberIndex];
    const regionId = mem.regionId;
    await prisma.citizenReport.upsert({
      where: { trackingCode: r.code },
      create: {
        trackingCode: r.code,
        kind: r.kind,
        memberId: mem.id,
        title: r.title,
        body: r.body,
        category: r.category,
        status: r.status,
        regionId,
        staffNotes: "prisma seed — seedDashboardDemoCohort (SEED_ENGAGEMENT_DEMOS=1). Safe to archive.",
      },
      update: {
        kind: r.kind,
        memberId: mem.id,
        title: r.title,
        body: r.body,
        category: r.category,
        status: r.status,
        regionId,
        staffNotes: "prisma seed — seedDashboardDemoCohort (SEED_ENGAGEMENT_DEMOS=1). Safe to archive.",
      },
    });
  }
  console.log("Demo cohort: citizen reports upserted:", reportFixtures.length);

  const community =
    (await prisma.community.findFirst({ where: { status: "ACTIVE" }, orderBy: { slug: "asc" } })) ??
    (await prisma.community.findFirst({ orderBy: { slug: "asc" } }));
  if (community) {
    for (let i = 0; i < members.length; i++) {
      const mem = members[i];
      const state = i % 4 === 3 ? "PENDING_JOIN" : "ACTIVE";
      await prisma.communityMembership.upsert({
        where: { communityId_memberId: { communityId: community.id, memberId: mem.id } },
        create: {
          communityId: community.id,
          memberId: mem.id,
          role: i === 0 ? "MODERATOR" : "MEMBER",
          state,
        },
        update: {
          role: i === 0 ? "MODERATOR" : "MEMBER",
          state,
        },
      });
    }
    const bodies = [
      "Seed post: community hall clean-up day proposed for next quarter — seeking volunteers.",
      "Seed post: traditional council meeting minutes request (public information only).",
      "Seed concern: youth programme funding visibility.",
    ];
    for (let b = 0; b < bodies.length; b++) {
      const author = members[b % members.length];
      const exists = await prisma.communityPost.findFirst({
        where: { communityId: community.id, authorMemberId: author.id, body: bodies[b] },
      });
      if (!exists) {
        await prisma.communityPost.create({
          data: {
            communityId: community.id,
            authorMemberId: author.id,
            kind: b === 0 ? "ANNOUNCEMENT" : b === 1 ? "GENERAL" : "CONCERN",
            body: bodies[b],
            moderationStatus: "PUBLISHED",
            pinned: b === 0,
          },
        });
      }
    }
    console.log("Demo cohort: community memberships + sample posts ensured for", community.slug);
  } else {
    console.log("Demo cohort: no Community rows — skipped memberships/posts.");
  }

  const sources = ["NEWSLETTER", "PARLIAMENT_TRACKER", "EARLY_ACCESS"];
  for (let i = 0; i < members.length; i++) {
    const src = sources[i % sources.length];
    await prisma.leadCapture.upsert({
      where: { email_source: { email: members[i].email, source: src } },
      create: { email: members[i].email, source: src },
      update: {},
    });
  }
  console.log("Demo cohort: lead capture rows upserted (mixed sources).");

  await seedDashboardDemoCohortActivityExtensions(members, community ?? null);
}

async function main() {
  console.log("MBKRU prisma seed: starting…");
  for (let i = 0; i < REGIONS_SEED.length; i++) {
    const r = REGIONS_SEED[i];
    await prisma.region.upsert({
      where: { slug: r.slug },
      create: { name: r.name, slug: r.slug, sortOrder: i },
      update: { name: r.name, sortOrder: i },
    });
  }
  console.log("Regions seeded:", REGIONS_SEED.length);

  const skipConstituencyJson =
    process.env.SEED_CONSTITUENCIES_JSON === "0" || process.env.SEED_CONSTITUENCIES_JSON === "false";
  if (skipConstituencyJson) {
    console.log("SEED_CONSTITUENCIES_JSON=0 — skipping prisma/data/constituencies.seed.json.");
  } else {
    await seedConstituenciesFromBundledJson();
  }

  const skipTownHallProgramme =
    process.env.SEED_TOWN_HALL_PROGRAMME === "0" || process.env.SEED_TOWN_HALL_PROGRAMME === "false";
  if (skipTownHallProgramme) {
    console.log("SEED_TOWN_HALL_PROGRAMME=0 — skipping TownHallEvent programme seed.");
  } else {
    await seedTownHallProgrammeFromRoadmap();
    await seedConstituencyDebateProgrammeRows();
  }

  const skipMembersJson =
    process.env.SEED_PARLIAMENT_MEMBERS_JSON === "0" || process.env.SEED_PARLIAMENT_MEMBERS_JSON === "false";
  if (skipMembersJson) {
    console.log("SEED_PARLIAMENT_MEMBERS_JSON=0 — skipping prisma/data/parliament-members.seed.json.");
  } else {
    await seedParliamentMembersFromBundledJson();
  }

  const email = process.env.ADMIN_EMAIL;
  const plain = process.env.ADMIN_PASSWORD;
  if (email && plain) {
    const password = await bcrypt.hash(plain, 12);
    await prisma.admin.upsert({
      where: { email },
      create: { email, password },
      update: { password },
    });
    console.log("Admin ready:", email);
  } else {
    console.warn("Skip admin: set ADMIN_EMAIL and ADMIN_PASSWORD to create the first admin.");
  }

  for (const p of POSTS_SEED) {
    await prisma.post.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        body: p.body,
        publishedAt: p.publishedAt,
      },
      update: {
        title: p.title,
        excerpt: p.excerpt,
        body: p.body,
        publishedAt: p.publishedAt,
      },
    });
  }
  console.log("Posts seeded:", POSTS_SEED.length);

  const skipAccountabilityStarter =
    process.env.SEED_ACCOUNTABILITY_DEMO === "0" || process.env.SEED_ACCOUNTABILITY_DEMO === "false";
  if (skipAccountabilityStarter) {
    console.log(
      "SEED_ACCOUNTABILITY_DEMO=0 — skipping public accountability starter (MPs, manifesto-linked promises, report card pilot).",
    );
  } else {
    await seedAccountabilityPublicSample();
  }

  if (process.env.SEED_MEMBER_DEMO === "1") {
    await seedMemberDemo();
  }

  const skipCommunitiesDemo =
    process.env.SEED_COMMUNITIES_DEMO === "0" || process.env.SEED_COMMUNITIES_DEMO === "false";
  if (skipCommunitiesDemo) {
    console.log("SEED_COMMUNITIES_DEMO=0 — skipping communities.seed.json and pilot community posts.");
  } else {
    await seedCommunitiesFromBundledJson();
    if (process.env.SEED_MEMBER_DEMO === "1") {
      await seedCommunityPilotInteractions();
    } else {
      console.log("SEED_MEMBER_DEMO unset — communities seeded without pilot memberships/posts.");
    }
  }

  if (process.env.SEED_VOICE_DEMO === "1" || process.env.SEED_ENGAGEMENT_DEMOS === "1") {
    await seedEngagementDemos();
  }
  if (process.env.SEED_ENGAGEMENT_DEMOS === "1") {
    await seedDashboardDemoCohort();
  }

  console.log("MBKRU prisma seed: finished OK.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

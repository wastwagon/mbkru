/**
 * DB seed — runs in production Docker without tsx (`node prisma/seed.mjs`).
 * @see package.json prisma.seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

/** Starter news — same slugs as `newsPlaceholders` in `src/lib/placeholders.ts` (CMS replaces static fallback). */
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

/** Fictional accountability dataset for dev/demo UIs — not real MPs or constituencies. */
const DEMO_MP_SLUGS = ["demo-mp-koomson", "demo-mp-adjei", "demo-mp-owusu"];
const DEMO_REPORT_CARD_YEAR = 2099;

async function seedAccountabilityDemo() {
  const accra = await prisma.region.findUnique({ where: { slug: "greater-accra" } });
  const ashanti = await prisma.region.findUnique({ where: { slug: "ashanti" } });
  if (!accra || !ashanti) {
    console.warn("seedAccountabilityDemo: regions missing — run base seed first.");
    return;
  }

  const c1 = await prisma.constituency.upsert({
    where: { slug: "demo-constituency-accra-north" },
    create: {
      name: "Demo Constituency — Accra North (fictional)",
      slug: "demo-constituency-accra-north",
      regionId: accra.id,
    },
    update: { name: "Demo Constituency — Accra North (fictional)", regionId: accra.id },
  });
  const c2 = await prisma.constituency.upsert({
    where: { slug: "demo-constituency-kumasi-east" },
    create: {
      name: "Demo Constituency — Kumasi East (fictional)",
      slug: "demo-constituency-kumasi-east",
      regionId: ashanti.id,
    },
    update: { name: "Demo Constituency — Kumasi East (fictional)", regionId: ashanti.id },
  });

  const mps = [
    {
      slug: DEMO_MP_SLUGS[0],
      name: "Dr. Ama Koomson (demo)",
      role: "MP",
      party: "Independent (demo)",
      constituencyId: c1.id,
    },
    {
      slug: DEMO_MP_SLUGS[1],
      name: "Kwesi Adjei (demo)",
      role: "MP",
      party: "Demo Party A",
      constituencyId: c1.id,
    },
    {
      slug: DEMO_MP_SLUGS[2],
      name: "Yaa Owusu (demo)",
      role: "MP",
      party: "Demo Party B",
      constituencyId: c2.id,
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
    where: { slug: { in: DEMO_MP_SLUGS } },
    select: { id: true, slug: true },
  });
  const bySlug = Object.fromEntries(members.map((x) => [x.slug, x.id]));

  await prisma.campaignPromise.deleteMany({
    where: { memberId: { in: members.map((x) => x.id) } },
  });

  const promiseRows = [
    {
      memberSlug: DEMO_MP_SLUGS[0],
      title: "Publish quarterly constituency spending summary (demo)",
      sourceLabel: "2026 demo manifesto excerpt",
      status: "IN_PROGRESS",
    },
    {
      memberSlug: DEMO_MP_SLUGS[0],
      title: "Youth skills hub pilot in two districts (demo)",
      sourceLabel: "Town hall commitment (fictional)",
      status: "TRACKING",
    },
    {
      memberSlug: DEMO_MP_SLUGS[1],
      title: "Road safety signage on Demo Highway (fictional)",
      sourceLabel: "Press statement (demo)",
      status: "TRACKING",
    },
    {
      memberSlug: DEMO_MP_SLUGS[2],
      title: "Primary health outreach visits (demo)",
      sourceLabel: "Campaign pledge (fictional)",
      status: "FULFILLED",
    },
  ];

  for (const p of promiseRows) {
    const mid = bySlug[p.memberSlug];
    if (!mid) continue;
    await prisma.campaignPromise.create({
      data: {
        memberId: mid,
        title: p.title,
        sourceLabel: p.sourceLabel,
        status: p.status,
      },
    });
  }

  const cycle = await prisma.reportCardCycle.upsert({
    where: { year: DEMO_REPORT_CARD_YEAR },
    create: {
      year: DEMO_REPORT_CARD_YEAR,
      label: `Demo People’s Report Card ${DEMO_REPORT_CARD_YEAR} (seed — not for publication)`,
      publishedAt: new Date(),
      methodology:
        "This cycle exists only for local/staging UI tests. Replace with real methodology before any public launch.",
    },
    update: {
      label: `Demo People’s Report Card ${DEMO_REPORT_CARD_YEAR} (seed — not for publication)`,
      publishedAt: new Date(),
    },
  });

  await prisma.scorecardEntry.deleteMany({ where: { cycleId: cycle.id } });

  const id0 = bySlug[DEMO_MP_SLUGS[0]];
  const id1 = bySlug[DEMO_MP_SLUGS[1]];
  if (id0) {
    await prisma.scorecardEntry.create({
      data: {
        cycleId: cycle.id,
        memberId: id0,
        narrative: "Demo narrative: strong committee attendance in sample period (fictional).",
        overallScore: 72.5,
        metrics: { oversight: 7, accessibility: 8, transparency: 6 },
      },
    });
  }
  if (id1) {
    await prisma.scorecardEntry.create({
      data: {
        cycleId: cycle.id,
        memberId: id1,
        narrative: "Demo narrative: mixed follow-through on written questions (fictional).",
        overallScore: 64.0,
        metrics: { oversight: 6, accessibility: 7, transparency: 6 },
      },
    });
  }

  console.log(
    "Accountability demo seeded: constituencies=2, MPs=3, promises=4, report card year=" + DEMO_REPORT_CARD_YEAR,
  );
}

/** Fictional public Member rows for /login and Voice testing — not for production identity. */
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

async function main() {
  for (let i = 0; i < REGIONS_SEED.length; i++) {
    const r = REGIONS_SEED[i];
    await prisma.region.upsert({
      where: { slug: r.slug },
      create: { name: r.name, slug: r.slug, sortOrder: i },
      update: { name: r.name, sortOrder: i },
    });
  }
  console.log("Regions seeded:", REGIONS_SEED.length);

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

  if (process.env.SEED_ACCOUNTABILITY_DEMO === "1") {
    await seedAccountabilityDemo();
  }

  if (process.env.SEED_MEMBER_DEMO === "1") {
    await seedMemberDemo();
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

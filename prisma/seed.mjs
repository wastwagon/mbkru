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
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

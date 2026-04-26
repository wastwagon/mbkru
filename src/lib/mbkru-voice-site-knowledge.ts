/**
 * Lightweight “site-first” context for MBKRU Voice: keyword match → short curated blurbs
 * (no embeddings). Prefer matching the user’s latest message; keeps tokens bounded.
 */
export type MbkruVoiceSiteKnowledgeResult = {
  /** Plain text for the system prompt; empty if no match */
  block: string;
  /** Public paths cited in this turn (for JSON analytics) */
  pagePaths: string[];
};

type Rule = { keywords: string[]; path: string; blurb: string };

const RULES: readonly Rule[] = [
  {
    path: "/diaspora",
    keywords: [
      "diaspora",
      "passport",
      "ghana card",
      "ghanaian passport",
      "national id",
      "nationality",
      "citizenship",
      "dual cit",
      "17th region",
      "consulate",
      "embassy",
      "mission",
      "abroad",
    ],
    blurb: `Diaspora support hub (/diaspora): signposts to NIA (Ghana Card), Ministry of Foreign Affairs, Ghana Immigration, and ghana.gov.gh — not consular processing. For “17th Region” policy and Summit context, the News briefing is at /news/diaspora-17th-region-2025. Feedback form: /diaspora/feedback.`,
  },
  {
    path: "/news/diaspora-17th-region-2025",
    keywords: ["17th region", "diaspora summit", "summit 2025", "seventeenth region", "remittance and diaspora policy"],
    blurb: `News briefing “Diaspora & the 17th Region” (/news/diaspora-17th-region-2025): civic summary with external references; not a government communique. Practical help stays on /diaspora.`,
  },
  {
    path: "/faq",
    keywords: [
      "faq",
      "member",
      "membership",
      "funded",
      "funding",
      "non-partisan",
      "non partisan",
      "report card",
      "people's report",
      "mbkru voice when",
    ],
    blurb: `FAQ (/faq): common questions on membership, MBKRU Voice availability, non-partisanship, Report Card, and funding.`,
  },
  {
    path: "/government-commitments",
    keywords: ["government commitment", "pledge", "catalogue", "manifesto promise", "promise track"],
    blurb: `Government commitments (/government-commitments): programme-tagged rows from the public promise catalogue. Browse all: /promises/browse; by MP: /promises`,
  },
  {
    path: "/petitions",
    keywords: ["petition", "signature", "campaign"],
    blurb: `Petitions: /petitions to browse; /petitions/new to start (requires a build with Voice pillar enabled and sign-in where applicable).`,
  },
  {
    path: "/legal-empowerment",
    keywords: ["chraj", "legal advice", "lawyer", "court", "chra", "foi", "legal empower"],
    blurb: `Legal empowerment desk (/legal-empowerment) signposts official channels; MBKRU is not a law firm. Page may 404 in Phase 1 builds — say so if unsure.`,
  },
  {
    path: "/methodology",
    keywords: ["methodology", "how you cite", "provenance", "data sources"],
    blurb: `Methodology (/methodology) and data provenance: /data-sources for datasets referenced on the site.`,
  },
  {
    path: "/contact",
    keywords: ["contact", "email mbkru", "reach you", "speak to someone at mbkru"],
    blurb: `Contact: /contact for media, partnerships, and general enquiries (response time stated on the page).`,
  },
  {
    path: "/resources",
    keywords: ["resources", "resource", "public document", "mbkru publish", "downloadable", "pdfs"],
    blurb: `Resources (/resources): published PDFs and documents released by the programme when available.`,
  },
  {
    path: "/about",
    keywords: ["about mbkru", "what is mbkru", "who runs mbkru", "mbkru mission"],
    blurb: `About (/about): who MBKRU is and the programme’s non-partisan scope.`,
  },
] as const;

const MAX_BLURBS = 4;
const MAX_BLOCK_CHARS = 3_200;

/**
 * Return curated website snippets for the user message. Matching is case-insensitive substring.
 */
export function getMbkruVoiceSiteKnowledgeForMessage(userMessage: string): MbkruVoiceSiteKnowledgeResult {
  const text = userMessage.toLowerCase().replace(/\s+/g, " ").trim();
  if (text.length < 2) return { block: "", pagePaths: [] };

  const hits: { path: string; blurb: string }[] = [];
  for (const rule of RULES) {
    if (rule.keywords.some((k) => text.includes(k.toLowerCase()))) {
      if (!hits.some((h) => h.path === rule.path)) {
        hits.push({ path: rule.path, blurb: rule.blurb });
      }
      if (hits.length >= MAX_BLURBS) break;
    }
  }

  if (hits.length === 0) return { block: "", pagePaths: [] };

  const lines = hits.map((h) => `• [${h.path}]\n  ${h.blurb}`);
  let block = `Curated from mbkruadvocates.org (prefer this for navigation and signposting before guessing):\n${lines.join("\n\n")}`;

  if (block.length > MAX_BLOCK_CHARS) {
    block = block.slice(0, MAX_BLOCK_CHARS) + "…";
  }
  return { block, pagePaths: hits.map((h) => h.path) };
}

/**
 * Lightweight full-text style retrieval over bundled site copy (no embeddings).
 * Used to inject mbkruadvocates.org facts into MBKRU Voice before the model answers.
 */
import {
  content,
  faqContent,
  heroContent,
  homepageEngagementPathways,
  mbkruStrategicContent,
  programmeRoadmap,
  starterNewsArticles,
} from "@/lib/site-content";

export type SiteVoiceSearchHit = { path: string; title: string; body: string };

function buildIndex(): SiteVoiceSearchHit[] {
  const homeBody = [
    heroContent.tagline,
    heroContent.motto,
    mbkruStrategicContent.homepageWhoWeAreLead,
    mbkruStrategicContent.executiveSummaryParagraphs.join(" "),
    mbkruStrategicContent.homepageAccountabilityTeaser,
  ].join(" ");

  const roadmapBody = programmeRoadmap
    .map((r) => `${r.phase} ${r.title} ${r.description} ${r.detailContent.slice(0, 520)}`)
    .join(" ");

  const aboutBody = [
    mbkruStrategicContent.legalName,
    mbkruStrategicContent.pillarTagline,
    mbkruStrategicContent.vision,
    mbkruStrategicContent.mission,
    mbkruStrategicContent.missionRestorativeContext,
    ...mbkruStrategicContent.coreObjectives,
    roadmapBody,
  ].join(" ");

  const faqBody = faqContent.map((f) => `${f.question} ${f.answer}`).join(" ");

  const newsBody = starterNewsArticles.map((n) => `${n.title} ${n.excerpt}`).join(" ");

  const pathwaysBody = homepageEngagementPathways.map((p) => `${p.tag} ${p.title} ${p.description}`).join(" ");

  const contactBody = `${content.contactDetails} ${content.officeDetails} ${content.email}`;

  return [
    { path: "/", title: "Home", body: homeBody },
    { path: "/about", title: "About MBKRU", body: aboutBody },
    { path: "/faq", title: "FAQ", body: faqBody },
    { path: "/news", title: "News & updates", body: newsBody },
    { path: "/contact", title: "Contact", body: contactBody },
    {
      path: "/citizens-voice",
      title: "Citizens Voice & MBKRU Voice",
      body: `${pathwaysBody} ${homeBody.slice(0, 1200)}`,
    },
    ...homepageEngagementPathways.map((p) => ({
      path: p.href,
      title: p.title,
      body: `${p.tag}. ${p.title}. ${p.description}`,
    })),
  ];
}

const INDEX = buildIndex();

const MAX_SNIPPET = 560;
const MAX_BLOCK = 3_600;
const MAX_HITS = 4;

function tokenize(query: string): string[] {
  const q = query.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ");
  return q
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1);
}

export type SiteContentSearchForVoice = {
  block: string;
  pagePaths: string[];
};

/**
 * Score index rows by token overlap with the user message; return a compact block for the system prompt.
 */
export function searchSiteContentForVoiceQuery(userMessage: string): SiteContentSearchForVoice {
  const tokens = tokenize(userMessage);
  if (tokens.length === 0) return { block: "", pagePaths: [] };

  const scored = INDEX.map((entry) => {
    const hay = `${entry.title} ${entry.body}`.toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (hay.includes(t)) score += 1;
    }
    return { entry, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_HITS);

  if (scored.length === 0) return { block: "", pagePaths: [] };

  const pagePaths = [...new Set(scored.map((s) => s.entry.path))];
  const lines = scored.map(({ entry }) => {
    const snippet = entry.body.replace(/\s+/g, " ").trim();
    const cut = snippet.length > MAX_SNIPPET ? `${snippet.slice(0, MAX_SNIPPET)}…` : snippet;
    return `• [${entry.path}] ${entry.title}\n  ${cut}`;
  });

  let block = `Website content search (mbkruadvocates.org — use for facts and routes before general knowledge):\n${lines.join("\n\n")}`;
  if (block.length > MAX_BLOCK) {
    block = block.slice(0, MAX_BLOCK) + "…";
  }
  return { block, pagePaths };
}

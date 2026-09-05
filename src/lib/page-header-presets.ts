import { images } from "@/lib/site-content";

/** Section hero imagery for inner pages — breadcrumbs stay text-only; image sits beside the title band. */
export const pageHeaderPresets = {
  accountability: {
    eyebrow: "Accountability & Electoral Watch",
    heroImage: images.accountability,
    heroImageAlt: "Ghanaian citizens reviewing a public report card — civic accountability and electoral watch",
  },
  voice: {
    eyebrow: "Pillar A — Digital platform",
    heroImage: images.digital,
    heroImageAlt: "Citizen using a phone to file a civic report in Ghana",
  },
  community: {
    eyebrow: "Pillar B — Physical engagement",
    heroImage: images.community,
    heroImageAlt: "Queen Mother and traditional-area civic gathering in Ghana",
  },
  townHall: {
    eyebrow: "Pillar B — Physical engagement",
    heroImage: images.townHall,
    heroImageAlt: "Town hall forum with citizens in Ghana",
  },
  election: {
    eyebrow: "Election observation",
    heroImage: images.election,
    heroImageAlt: "Non-partisan election observation at a Ghana polling station",
  },
  legal: {
    eyebrow: "Pillar C — Legal empowerment",
    heroImage: images.legal,
    heroImageAlt: "Legal empowerment and civic navigation in Ghana",
  },
  diaspora: {
    eyebrow: "Pillar E — Diaspora bridge",
    heroImage: images.diaspora,
    heroImageAlt: "Ghanaian diaspora homecoming with national flags",
  },
  news: {
    eyebrow: "Newsroom",
    heroImage: images.news,
    heroImageAlt: "Civic press briefing in Ghana",
  },
  resources: {
    eyebrow: "Resources",
    heroImage: images.resources,
    heroImageAlt: "Policy reports and civic research documents",
  },
  partners: {
    eyebrow: "Partnerships",
    heroImage: images.partnership,
    heroImageAlt: "Civic partnership meeting in Ghana",
  },
  about: {
    eyebrow: "About MBKRU",
    heroImage: images.about,
    heroImageAlt: "Akan heritage and civic life in Ghana",
  },
  transparency: {
    eyebrow: "Open data",
    heroImage: images.platform,
    heroImageAlt: "Citizen reporting through MBKRU Voice",
  },
} as const;

export type PageHeaderPresetKey = keyof typeof pageHeaderPresets;

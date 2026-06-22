import { images } from "@/lib/site-content";

/** Section hero imagery for inner pages — breadcrumbs stay text-only; image sits beside the title band. */
export const pageHeaderPresets = {
  accountability: {
    eyebrow: "Accountability & Electoral Watch",
    heroImage: images.accountability,
    heroImageAlt: "Press and public affairs — governance accountability in Ghana",
  },
  voice: {
    eyebrow: "Pillar A — Digital platform",
    heroImage: images.digital,
    heroImageAlt: "Digital connectivity and citizen engagement in Ghana",
  },
  community: {
    eyebrow: "Pillar B — Physical engagement",
    heroImage: images.community,
    heroImageAlt: "Festival crowd and cultural celebration in Ghana",
  },
  legal: {
    eyebrow: "Pillar C — Legal empowerment",
    heroImage: images.legal,
    heroImageAlt: "Justice and legal empowerment",
  },
  diaspora: {
    eyebrow: "Pillar E — Diaspora bridge",
    heroImage: images.diaspora,
    heroImageAlt: "Ghanaian diaspora and global community connection",
  },
  news: {
    eyebrow: "Newsroom",
    heroImage: images.news,
    heroImageAlt: "Press and programme updates from MBKRU",
  },
  resources: {
    eyebrow: "Resources",
    heroImage: images.resources,
    heroImageAlt: "Published documents and civic resources",
  },
  about: {
    eyebrow: "About MBKRU",
    heroImage: images.about,
    heroImageAlt: "Heritage and culture — Ghanaian civic life",
  },
  transparency: {
    eyebrow: "Open data",
    heroImage: images.platform,
    heroImageAlt: "Citizens and public engagement — aggregate Voice statistics",
  },
} as const;

export type PageHeaderPresetKey = keyof typeof pageHeaderPresets;

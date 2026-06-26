/** Public site visibility settings — safe to expose via `/api/site-gate`. */
export type PublicSiteConfig = {
  publicUnderConstruction: boolean;
  constructionHeadline: string | null;
  constructionBody: string | null;
  updatedAt: string | null;
};

export const DEFAULT_PUBLIC_SITE_CONFIG: PublicSiteConfig = {
  publicUnderConstruction: false,
  constructionHeadline: null,
  constructionBody: null,
  updatedAt: null,
};

export const SITE_CONFIG_CACHE_TAG = "site-config";

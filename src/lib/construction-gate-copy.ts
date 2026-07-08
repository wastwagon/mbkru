import copy from "@/lib/construction-gate-copy.json";

/** Default holding-page copy — shared with `scripts/ops-site-visibility.mjs`. */
export const DEFAULT_CONSTRUCTION_HEADLINE = copy.headline;

export const DEFAULT_CONSTRUCTION_BODY = copy.body;

export function constructionHeadlineOrDefault(raw: string | null | undefined): string {
  return raw?.trim() || DEFAULT_CONSTRUCTION_HEADLINE;
}

export function constructionBodyOrDefault(raw: string | null | undefined): string {
  return raw?.trim() || DEFAULT_CONSTRUCTION_BODY;
}

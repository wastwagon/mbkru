/** Default holding-page copy — keep in sync with `scripts/ops-site-visibility.mjs`. */
export const DEFAULT_CONSTRUCTION_HEADLINE = "We're preparing the MBKRU Advocates platform";

export const DEFAULT_CONSTRUCTION_BODY =
  "The public site is temporarily unavailable while we complete editorial review, data verification, and launch checks. Programme content remains in our systems — only admins with a login can preview the full site. Contact us if you need to reach the team before launch.";

export function constructionHeadlineOrDefault(raw: string | null | undefined): string {
  return raw?.trim() || DEFAULT_CONSTRUCTION_HEADLINE;
}

export function constructionBodyOrDefault(raw: string | null | undefined): string {
  return raw?.trim() || DEFAULT_CONSTRUCTION_BODY;
}

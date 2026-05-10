/** Query shape aligned with `/report-card` and `/regions/[slug]` browse sections. */
export type RegionalReportCardIndexQuery = {
  year?: number;
  region?: string;
  q?: string;
  page?: number;
  vq?: string;
  vregion?: string;
  vpage?: number;
  vkind?: string;
};

export function regionalReportCardIndexHref(slug: string, opts: RegionalReportCardIndexQuery) {
  const sp = new URLSearchParams();
  if (opts.year != null) sp.set("year", String(opts.year));
  if (opts.region?.trim()) sp.set("region", opts.region.trim());
  if (opts.q?.trim()) sp.set("q", opts.q.trim());
  if (opts.page != null && opts.page > 1) sp.set("page", String(opts.page));
  if (opts.vq?.trim()) sp.set("vq", opts.vq.trim());
  if (opts.vregion?.trim()) sp.set("vregion", opts.vregion.trim());
  if (opts.vpage != null && opts.vpage > 1) sp.set("vpage", String(opts.vpage));
  if (opts.vkind?.trim()) sp.set("vkind", opts.vkind.trim());
  const qs = sp.toString();
  return qs ? `/regions/${encodeURIComponent(slug)}?${qs}` : `/regions/${encodeURIComponent(slug)}`;
}

export type ReportCardBrowseTab = "voice" | "scores";

export type ReportCardBrowseQuery = {
  year?: number;
  region?: string;
  q?: string;
  page?: number;
  vq?: string;
  vregion?: string;
  vpage?: number;
  vkind?: string;
  tab?: ReportCardBrowseTab;
};

export function parseReportCardBrowseTab(
  raw: string | undefined,
  opts: { voiceOn: boolean; showScores: boolean },
): ReportCardBrowseTab {
  const t = raw?.trim().toLowerCase();
  if (t === "scores" && opts.showScores) return "scores";
  if (t === "voice" && opts.voiceOn) return "voice";
  if (opts.voiceOn) return "voice";
  return "scores";
}

/** Tab switcher only when both Voice browse and programme scores are available. */
export function showReportCardBrowseTabs(opts: {
  voiceOn: boolean;
  showScores: boolean;
  hasCycles: boolean;
}): boolean {
  return opts.voiceOn && opts.showScores && opts.hasCycles;
}

function appendReportCardBrowseQuery(sp: URLSearchParams, opts: ReportCardBrowseQuery) {
  if (opts.year != null) sp.set("year", String(opts.year));
  if (opts.region?.trim()) sp.set("region", opts.region.trim());
  if (opts.q?.trim()) sp.set("q", opts.q.trim());
  if (opts.page != null && opts.page > 1) sp.set("page", String(opts.page));
  if (opts.vq?.trim()) sp.set("vq", opts.vq.trim());
  if (opts.vregion?.trim()) sp.set("vregion", opts.vregion.trim());
  if (opts.vpage != null && opts.vpage > 1) sp.set("vpage", String(opts.vpage));
  if (opts.vkind?.trim()) sp.set("vkind", opts.vkind.trim());
  if (opts.tab === "scores") sp.set("tab", "scores");
  else if (opts.tab === "voice") sp.set("tab", "voice");
}

export function reportCardBrowseHref(basePath: string, opts: ReportCardBrowseQuery): string {
  const sp = new URLSearchParams();
  appendReportCardBrowseQuery(sp, opts);
  const qs = sp.toString();
  const hash = opts.tab === "scores" ? "#browse-scores" : "#browse-voice";
  const path = basePath.replace(/\/$/, "") || "/report-card";
  return qs ? `${path}?${qs}${hash}` : `${path}${hash}`;
}

export function reportCardIndexHref(opts: ReportCardBrowseQuery): string {
  return reportCardBrowseHref("/report-card", opts);
}

export function regionalReportCardIndexHref(slug: string, opts: ReportCardBrowseQuery): string {
  return reportCardBrowseHref(`/regions/${encodeURIComponent(slug)}`, opts);
}

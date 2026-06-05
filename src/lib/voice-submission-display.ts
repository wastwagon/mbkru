export type VoiceDiscussionReactionTotals = {
  LIKE: number;
  THANK: number;
  INSIGHT: number;
};

export type VoiceSubmissionEngagementCounts = {
  publicSupportCount: number;
  publicCommentCount: number;
  discussionReactionTotals: VoiceDiscussionReactionTotals;
};

export function emptyVoiceDiscussionReactionTotals(): VoiceDiscussionReactionTotals {
  return { LIKE: 0, THANK: 0, INSIGHT: 0 };
}

export function bodyPreviewLine(body: string | null, max = 220): string | null {
  if (!body?.trim()) return null;
  const t = body.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return `${t.slice(0, max).trimEnd()}…`;
}

export function voiceDiscussionHref(reportId: string): string {
  return `/citizens-voice/discussions/${encodeURIComponent(reportId)}`;
}

export function voiceTrackHref(trackingCode: string): string {
  return `/track-report?code=${encodeURIComponent(trackingCode)}`;
}

export const voiceSubmissionLinkLabels = {
  fullReportDiscussion: "Full report & discussion →",
  trackReport: "Track this report →",
  discussionOpen: "Discussion open",
  discussionOff: "Discussion off",
} as const;

/** Inline meta suffix — keeps discussion state visible without a second pill + link. */
export function formatDiscussionStatusSuffix(discussionEnabled: boolean): string {
  return discussionEnabled
    ? ` · ${voiceSubmissionLinkLabels.discussionOpen}`
    : ` · ${voiceSubmissionLinkLabels.discussionOff}`;
}

export function formatCommunityEngagementLine(supportCount: number, commentCount: number): string | null {
  if (supportCount <= 0 && commentCount <= 0) return null;
  return `Community engagement: ${supportCount} supporter${supportCount === 1 ? "" : "s"} · ${commentCount} comment${commentCount === 1 ? "" : "s"}`;
}

/** One-line engagement summary for dense browse cards. */
export function formatCompactEngagementSummary(
  supportCount: number,
  commentCount: number,
  totals: VoiceDiscussionReactionTotals,
): string | null {
  const parts: string[] = [];
  if (supportCount > 0) parts.push(`${supportCount} support${supportCount === 1 ? "" : "s"}`);
  if (commentCount > 0) parts.push(`${commentCount} comment${commentCount === 1 ? "" : "s"}`);
  const reactionBits: string[] = [];
  if (totals.LIKE > 0) reactionBits.push(`Like ${totals.LIKE}`);
  if (totals.THANK > 0) reactionBits.push(`Thanks ${totals.THANK}`);
  if (totals.INSIGHT > 0) reactionBits.push(`Important ${totals.INSIGHT}`);
  if (reactionBits.length > 0) parts.push(reactionBits.join(", "));
  return parts.length > 0 ? parts.join(" · ") : null;
}

/** Short place label for cards — region plus first locality segment, not full geocoder strings. */
export function formatBrowsePlaceLabel(
  regionName: string | null | undefined,
  localArea: string | null | undefined,
  maxLocal = 40,
): string | null {
  const region = regionName?.trim() || null;
  const rawLocal = localArea?.trim() || null;
  const localSegment = rawLocal?.split(",")[0]?.trim() || null;
  const local =
    localSegment && localSegment.length > maxLocal
      ? `${localSegment.slice(0, maxLocal).trimEnd()}…`
      : localSegment;

  if (region && local) {
    if (local.toLowerCase().includes(region.toLowerCase())) return region;
    return `${region} · ${local}`;
  }
  return region ?? local;
}

export function formatDiscussionReactionLine(totals: VoiceDiscussionReactionTotals): string | null {
  const total = totals.LIKE + totals.THANK + totals.INSIGHT;
  if (total <= 0) return null;
  return `On the discussion thread: Like ${totals.LIKE} · Thanks ${totals.THANK} · Important ${totals.INSIGHT}`;
}

export function hasVoiceDiscussionEngagement(engagement: VoiceSubmissionEngagementCounts): boolean {
  return (
    engagement.publicSupportCount > 0 ||
    engagement.publicCommentCount > 0 ||
    engagement.discussionReactionTotals.LIKE +
      engagement.discussionReactionTotals.THANK +
      engagement.discussionReactionTotals.INSIGHT >
      0
  );
}

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

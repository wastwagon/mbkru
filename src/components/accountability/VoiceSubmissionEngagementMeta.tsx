import {
  formatCommunityEngagementLine,
  formatDiscussionReactionLine,
  type VoiceSubmissionEngagementCounts,
} from "@/lib/voice-submission-display";

type Props = {
  engagement: VoiceSubmissionEngagementCounts;
  className?: string;
  reactionClassName?: string;
};

/** Shared supporter / comment / reaction lines for Voice browse and MP intake rows. */
export function VoiceSubmissionEngagementMeta({
  engagement,
  className = "mt-2 text-xs text-[var(--muted-foreground)]",
  reactionClassName,
}: Props) {
  const engagementLine = formatCommunityEngagementLine(
    engagement.publicSupportCount,
    engagement.publicCommentCount,
  );
  const reactionLine = formatDiscussionReactionLine(engagement.discussionReactionTotals);

  if (!engagementLine && !reactionLine) return null;

  return (
    <>
      {engagementLine ? <p className={className}>{engagementLine}</p> : null}
      {reactionLine ? <p className={reactionClassName ?? className}>{reactionLine}</p> : null}
    </>
  );
}

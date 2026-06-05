import { VoiceSubmissionSurfaceCard } from "@/components/accountability/VoiceSubmissionSurfaceCard";
import type { MpPerformanceIntakeRow } from "@/lib/server/promises-member-sheet-load";
import { cardNarrative, stripSeedMarkers } from "@/lib/voice-submission-card-shared";

type Props = {
  report: MpPerformanceIntakeRow;
};

export function MpPerformanceIntakeCard({ report }: Props) {
  const displayTitle = stripSeedMarkers(report.title);

  return (
    <VoiceSubmissionSurfaceCard
      id={report.id}
      title={displayTitle}
      trackingCode={report.trackingCode}
      status={report.status}
      createdAt={report.createdAt}
      discussionEnabled={report.discussionEnabled}
      kind="MP_PERFORMANCE"
      titleHeadingLevel="h3"
      narrative={cardNarrative(displayTitle, { bodyPreview: report.bodyPreview })}
      publicSupportCount={report.publicSupportCount}
      publicCommentCount={report.publicCommentCount}
      discussionReactionTotals={report.discussionReactionTotals}
    />
  );
}

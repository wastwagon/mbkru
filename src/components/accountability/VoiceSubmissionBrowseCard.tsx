import { VoiceSubmissionSurfaceCard } from "@/components/accountability/VoiceSubmissionSurfaceCard";
import { isPromisesBrowseEnabled } from "@/lib/reports/accountability-pages";
import type { VoiceSubmissionBrowseRow } from "@/lib/server/accountability-cache";
import { cardNarrative, stripSeedMarkers } from "@/lib/voice-submission-card-shared";
import { formatBrowsePlaceLabel } from "@/lib/voice-submission-display";

type Props = {
  row: VoiceSubmissionBrowseRow;
};

export function VoiceSubmissionBrowseCard({ row }: Props) {
  const displayTitle = stripSeedMarkers(row.title);
  const showMpSheetLink = isPromisesBrowseEnabled();
  const place = formatBrowsePlaceLabel(row.region?.name, row.localArea);
  const publicTitle = row.publicCauseTitle?.trim() ?? null;

  let contextLine: string | null = null;
  let contextLink: { href: string; label: string } | null = null;
  let contextSuffix: string | null = null;

  if (row.parliamentMember) {
    if (showMpSheetLink) {
      contextLink = {
        href: `/promises/${encodeURIComponent(row.parliamentMember.slug)}`,
        label: row.parliamentMember.name,
      };
      contextSuffix = place;
    } else {
      contextLine = place ? `${row.parliamentMember.name} · ${place}` : row.parliamentMember.name;
    }
  } else if (row.kind === "MP_PERFORMANCE") {
    contextLine = place ? `MP not linked · ${place}` : "MP not linked";
  } else if (place) {
    contextLine = place;
  }

  return (
    <VoiceSubmissionSurfaceCard
      id={row.id}
      title={displayTitle}
      trackingCode={row.trackingCode}
      status={row.status}
      createdAt={row.createdAt}
      discussionEnabled={row.discussionEnabled}
      kind={row.kind}
      titleHeadingLevel="h2"
      narrative={cardNarrative(displayTitle, {
        summary: row.publicCauseSummary,
        bodyPreview: row.bodyPreview,
      })}
      publishedTitle={publicTitle}
      contextLine={contextLine}
      contextLink={contextLink}
      contextSuffix={contextSuffix}
      publicSupportCount={row.publicSupportCount}
      publicCommentCount={row.publicCommentCount}
      discussionReactionTotals={row.discussionReactionTotals}
      legacyCauseSlug={row.publicCauseSlug}
      staffSummaryPending={Boolean(row.publicCauseSlug && !row.publicCauseSummary)}
      attachmentCount={row.attachmentCount}
    />
  );
}

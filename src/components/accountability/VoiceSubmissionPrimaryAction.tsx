import Link from "next/link";

import { accountabilityProse } from "@/config/accountability-catalogue-destinations";
import { primaryLinkClass } from "@/lib/primary-link-styles";
import { voiceDiscussionHref, voiceSubmissionLinkLabels, voiceTrackHref } from "@/lib/voice-submission-display";

type Props = {
  reportId: string;
  trackingCode: string;
  title: string;
  discussionEnabled: boolean;
  describedBy?: string;
  className?: string;
  prefetch?: boolean;
};

/** Single primary CTA for Voice browse cards and compact MP intake rows. */
export function VoiceSubmissionPrimaryAction({
  reportId,
  trackingCode,
  title,
  discussionEnabled,
  describedBy,
  className = `${primaryLinkClass} font-semibold`,
  prefetch = false,
}: Props) {
  if (discussionEnabled) {
    return (
      <Link
        href={voiceDiscussionHref(reportId)}
        prefetch={prefetch}
        className={className}
        aria-describedby={describedBy}
      >
        {voiceSubmissionLinkLabels.fullReportDiscussion}
        <span className="sr-only">
          {" "}
          for {title} ({trackingCode})
        </span>
      </Link>
    );
  }

  return (
    <>
      <Link
        href={voiceTrackHref(trackingCode)}
        className={className}
        aria-describedby={describedBy}
      >
        {voiceSubmissionLinkLabels.trackReport}
        <span className="sr-only"> — {trackingCode}</span>
      </Link>
      <span className="text-xs text-[var(--muted-foreground)]">
        {accountabilityProse.mpPerformanceIntakesDiscussionOff}
      </span>
    </>
  );
}

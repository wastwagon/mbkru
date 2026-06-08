import Link from "next/link";

import { accountabilityProse } from "@/config/accountability-catalogue-destinations";
import { focusRingSmClass, primaryLinkClass } from "@/lib/primary-link-styles";
import { voiceDiscussionHref, voiceSubmissionLinkLabels, voiceTrackHref } from "@/lib/voice-submission-display";

const mobilePrimaryCtaClass = `inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-[var(--primary-dark)] hover:text-white sm:w-auto sm:min-h-0 sm:bg-transparent sm:px-0 sm:py-0 sm:font-semibold sm:text-[var(--primary)] sm:underline sm:underline-offset-4 ${focusRingSmClass}`;

type Props = {
  reportId: string;
  trackingCode: string;
  title: string;
  discussionEnabled: boolean;
  describedBy?: string;
  className?: string;
  prefetch?: boolean;
  /** Full-width teal button on mobile; text link from `sm` up. */
  mobileProminent?: boolean;
};

/** Single primary CTA for Voice browse cards and compact MP intake rows. */
export function VoiceSubmissionPrimaryAction({
  reportId,
  trackingCode,
  title,
  discussionEnabled,
  describedBy,
  className = `${primaryLinkClass} font-semibold`,
  mobileProminent = true,
  prefetch = false,
}: Props) {
  const ctaClass = mobileProminent && discussionEnabled ? mobilePrimaryCtaClass : className;

  if (discussionEnabled) {
    return (
      <Link
        href={voiceDiscussionHref(reportId)}
        prefetch={prefetch}
        className={ctaClass}
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
      <span className="text-xs text-[var(--foreground-secondary)]">
        {accountabilityProse.mpPerformanceIntakesDiscussionOff}
      </span>
    </>
  );
}

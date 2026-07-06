import Link from "next/link";

import type { ReportCardBrowseTab } from "@/lib/report-card-browse-query";
import { focusRingSmClass } from "@/lib/primary-link-styles";

type Props = {
  active: ReportCardBrowseTab;
  voiceHref: string;
  scoresHref: string;
  voiceCount: number;
  scoresCount: number;
};

/** Voice vs programme scores — reduces filter overload on `/report-card`. */
export function ReportCardBrowseTabs({ active, voiceHref, scoresHref, voiceCount, scoresCount }: Props) {
  const tabClass = (tab: ReportCardBrowseTab) =>
    `inline-flex min-h-11 flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors sm:flex-none ${focusRingSmClass} ${
      active === tab
        ? "bg-[var(--primary)] text-white shadow-sm"
        : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-[var(--section-light)]"
    }`;

  return (
    <nav
      className="mx-auto mt-10 flex max-w-2xl flex-col gap-2 sm:flex-row sm:justify-center"
      aria-label="Report Card browse"
    >
      <Link href={voiceHref} className={tabClass("voice")} prefetch={false}>
        Voice submissions
        <span className="ml-2 tabular-nums opacity-90">({voiceCount})</span>
      </Link>
      <Link href={scoresHref} className={tabClass("scores")} prefetch={false}>
        Programme scores
        <span className="ml-2 tabular-nums opacity-90">({scoresCount})</span>
      </Link>
    </nav>
  );
}

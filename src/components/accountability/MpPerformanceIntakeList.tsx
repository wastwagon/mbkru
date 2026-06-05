import Link from "next/link";

import { VoiceMpPerformanceIntakeRow } from "@/components/accountability/VoiceMpPerformanceIntakeRow";
import { accountabilityProse } from "@/config/accountability-catalogue-destinations";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";
import type { MpPerformanceIntakeRow } from "@/lib/server/promises-member-sheet-load";

type Props = {
  reports: MpPerformanceIntakeRow[];
};

function intakeCountLabel(count: number): string {
  if (count === 1) return accountabilityProse.mpPerformanceIntakesCountSingular;
  return accountabilityProse.mpPerformanceIntakesCountPlural.replace("{count}", String(count));
}

export function MpPerformanceIntakeList({ reports }: Props) {
  if (reports.length === 0) return null;

  const sectionHeadingId = "mp-performance-intakes-heading";

  return (
    <div className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
      <h2 id={sectionHeadingId} className="font-display text-lg font-semibold text-[var(--foreground)]">
        {accountabilityProse.mpPerformanceIntakesSectionTitle}
        <span className="ml-2 text-base font-normal text-[var(--muted-foreground)]">
          ({intakeCountLabel(reports.length)})
        </span>
      </h2>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        {accountabilityProse.mpPerformanceIntakesSectionIntro} Open{" "}
        <Link href="/parliament-tracker" className={primaryNavLinkClass}>
          Parliament tracker
        </Link>{" "}
        {accountabilityProse.mpPerformanceIntakesSectionIntroTail}
      </p>
      <ul aria-labelledby={sectionHeadingId} className="mt-4 divide-y divide-[var(--border)]/80">
        {reports.map((report) => (
          <li key={report.id}>
            <VoiceMpPerformanceIntakeRow report={report} />
          </li>
        ))}
      </ul>
    </div>
  );
}

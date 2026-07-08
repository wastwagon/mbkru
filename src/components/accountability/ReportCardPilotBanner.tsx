type Props = {
  cycleYear: number;
  totalEntries: number;
  scoredCount: number;
};

/** Shown when a published cycle has entries but editorial scores are not all signed off (R2.1). */
export function ReportCardPilotBanner({ cycleYear, totalEntries, scoredCount }: Props) {
  if (totalEntries === 0 || scoredCount >= totalEntries) return null;

  const pending = totalEntries - scoredCount;
  const allPending = scoredCount === 0;

  return (
    <div
      className="rounded-xl border border-amber-300/80 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950"
      role="status"
    >
      <p className="font-semibold">
        {allPending ? "Pilot cycle — scores pending editorial review" : "Partial scores — editorial review in progress"}
      </p>
      <p className="mt-1">
        The {cycleYear} People&apos;s Report Card cycle is published for preview, but{" "}
        {allPending ? "no programme scores are signed off yet" : `${pending} of ${totalEntries} entries still lack signed-off scores`}
        . Treat cards as draft until MBKRU completes methodology and evidence review — not court or electoral findings.
      </p>
    </div>
  );
}

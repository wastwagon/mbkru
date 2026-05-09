/**
 * Human-facing title for a published People's Report Card cycle.
 * Strips internal/editorial scaffolding phrases sometimes stored in `ReportCardCycle.label` during layout work.
 */
export function publicReportCardCycleTitle(year: number, editorialLabel: string | null | undefined): string {
  const raw = (editorialLabel ?? "").trim();
  const lower = raw.toLowerCase();
  const looksInternal =
    raw.length === 0 ||
    lower.includes("pilot") ||
    lower.includes("layout & workflow") ||
    lower.includes("layout and workflow") ||
    lower.includes("(demo") ||
    lower.includes("internal preview");
  if (looksInternal) {
    return `People's Report Card ${year}`;
  }
  return raw;
}

/** Admin UI: whether the database label differs from what the public site and API show. */
export function reportCardPublicVersusStoredLabel(year: number, editorialLabel: string | null | undefined) {
  const storedLabel = (editorialLabel ?? "").trim();
  const publicTitle = publicReportCardCycleTitle(year, editorialLabel);
  return {
    publicTitle,
    storedLabel,
    showStoredLine: storedLabel !== publicTitle,
  };
}

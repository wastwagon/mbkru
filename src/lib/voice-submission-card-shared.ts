import type { CitizenReportKind } from "@prisma/client";

export function excerptFromSummary(raw: string | null, max = 140): string | null {
  if (!raw?.trim()) return null;
  let t = raw.trim().replace(/\s+/g, " ");
  t = t.replace(/\s+—\s*not a live case\.?$/i, "").replace(/\bSeed data[^.]*\.?\s*/gi, "").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trimEnd()}…`;
}

export function stripSeedMarkers(title: string): string {
  let s = title.trim();
  s = s.replace(/\s*\(seed\)\s*$/i, "").replace(/\s*[—–-]\s*seed\s*$/i, "").trim();
  return s;
}

export function kindBadgeClass(kind: CitizenReportKind): string {
  switch (kind) {
    case "MP_PERFORMANCE":
      return "border-[var(--primary)]/40 bg-[var(--primary)]/12 text-[var(--primary)]";
    case "GOVERNMENT_PERFORMANCE":
      return "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100";
    case "ELECTION_OBSERVATION":
      return "border-violet-500/30 bg-violet-500/10 text-violet-950 dark:text-violet-100";
    case "SITUATIONAL_ALERT":
      return "border-orange-500/30 bg-orange-500/10 text-orange-950 dark:text-orange-100";
    default:
      return "border-[var(--border)] bg-[var(--section-light)] text-[var(--foreground)]";
  }
}

export function cardNarrative(
  displayTitle: string,
  opts: {
    summary?: string | null;
    bodyPreview?: string | null;
  },
): string | null {
  const summary = excerptFromSummary(opts.summary ?? null);
  if (summary) return summary;
  const body = opts.bodyPreview?.trim() ?? null;
  if (!body) return null;
  if (body.toLowerCase() === displayTitle.toLowerCase()) return null;
  return body.length > 140 ? `${body.slice(0, 140).trimEnd()}…` : body;
}

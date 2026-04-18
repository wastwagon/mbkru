/** Resolved public link for a tracked commitment row (direct URL preferred, else linked manifesto). */
export function primarySourceUrl(p: {
  sourceUrl: string | null | undefined;
  manifestoDocument: { sourceUrl: string | null } | null | undefined;
}): string | null {
  const direct = p.sourceUrl?.trim();
  if (direct) return direct;
  const m = p.manifestoDocument?.sourceUrl?.trim();
  return m || null;
}

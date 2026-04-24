/**
 * Display helpers for manifesto catalogue rows (seed tags in `verificationNotes`).
 * Keep prefix in sync with `NDC_MANIFESTO_CATALOGUE_SEED_TAG` in `prisma/seed.mjs`.
 */
export const MBKRU_MANIFESTO_CATALOGUE_SEED_PREFIX = "mbkru-seed:ndc-2024-catalogue-v1";

export type ParsedManifestoCatalogueNotes = {
  isCatalogueRow: boolean;
  themeSlug: string | null;
  themeLabel: string | null;
  /** Free-text verification beyond the seed tag (usually empty for catalogue-only rows). */
  editorVerification: string | null;
};

function humaniseThemeSlug(slug: string): string {
  return slug
    .split(/[-_]/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Splits seed-machine notes from human editor verification for public cards. */
/** Stable fields for APIs and exports (derived from `verificationNotes`). */
export function getPromiseCatalogueApiFields(verificationNotes: string | null | undefined): {
  isManifestoCatalogueRow: boolean;
  catalogueThemeSlug: string | null;
  catalogueThemeLabel: string | null;
} {
  const c = parseManifestoCatalogueRowNotes(verificationNotes);
  return {
    isManifestoCatalogueRow: c.isCatalogueRow,
    catalogueThemeSlug: c.themeSlug,
    catalogueThemeLabel: c.themeLabel,
  };
}

export function parseManifestoCatalogueRowNotes(
  verificationNotes: string | null | undefined,
): ParsedManifestoCatalogueNotes {
  const raw = verificationNotes?.trim() ?? "";
  if (!raw) {
    return { isCatalogueRow: false, themeSlug: null, themeLabel: null, editorVerification: null };
  }
  if (!raw.startsWith(MBKRU_MANIFESTO_CATALOGUE_SEED_PREFIX)) {
    return { isCatalogueRow: false, themeSlug: null, themeLabel: null, editorVerification: raw };
  }
  const clusterMatch = raw.match(/cluster=([^\s]+)/);
  const themeSlug = clusterMatch?.[1]?.trim() || null;
  const themeLabel = themeSlug ? humaniseThemeSlug(themeSlug) : null;
  const afterTag = raw.slice(MBKRU_MANIFESTO_CATALOGUE_SEED_PREFIX.length).trim();
  const stripped = afterTag.replace(/^cluster=\S+\s*/i, "").trim();
  return {
    isCatalogueRow: true,
    themeSlug,
    themeLabel,
    editorVerification: stripped || null,
  };
}

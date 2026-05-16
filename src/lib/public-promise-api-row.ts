/** Mirrors GET /api/promises row shape (JSON) — shared by browse UI and server loaders. */
export type PublicPromiseApiRow = {
  id: string;
  title: string;
  description: string | null;
  sourceLabel: string;
  sourceUrl: string | null;
  sourceDate: string | null;
  verificationNotes: string | null;
  status: string;
  /** Shown when status is BLOCKED (editorial explanation). */
  blockedReason: string | null;
  updatedAt: string;
  electionCycle: string | null;
  partySlug: string | null;
  manifestoDocumentId: string | null;
  manifestoPageRef: string | null;
  /** True when `verificationNotes` carries the MBKRU manifesto catalogue seed tag. */
  isManifestoCatalogueRow: boolean;
  /** Machine slug from catalogue seed (e.g. `economy`); null when not a catalogue row. */
  catalogueThemeSlug: string | null;
  /** Human label for dashboard chips and CSV (`Economy`, etc.). */
  catalogueThemeLabel: string | null;
  isGovernmentProgramme: boolean;
  policySector: string | null;
  manifesto: {
    id: string;
    title: string;
    partySlug: string | null;
    electionCycle: string | null;
    sourceUrl: string | null;
  } | null;
  member: {
    name: string;
    slug: string;
    role: string;
    party: string | null;
    constituency: { name: string; slug: string } | null;
  } | null;
};

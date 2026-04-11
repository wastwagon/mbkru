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
  updatedAt: string;
  electionCycle: string | null;
  partySlug: string | null;
  isGovernmentProgramme: boolean;
  policySector: string | null;
  manifesto: {
    id: string;
    title: string;
    partySlug: string | null;
    electionCycle: string | null;
    sourceUrl: string | null;
  } | null;
  member: { name: string; slug: string; role: string; party: string | null } | null;
};

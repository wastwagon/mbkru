/** Options for the public promise tracker constituency selector (from `Constituency` + active `ParliamentMember`). */
export type TrackerConstituencyOption = {
  slug: string;
  name: string;
  regionName: string;
  mp: { name: string; slug: string } | null;
};

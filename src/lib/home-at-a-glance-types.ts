export type HomePetitionTeaser = {
  slug: string;
  title: string;
  signatureCount: number;
  targetSignatures: number | null;
};

export type HomePublicCauseTeaser = {
  slug: string;
  title: string;
  supportCount: number;
  commentCount: number;
  regionName: string | null;
};

export type HomeCommunityTeaser = {
  slug: string;
  name: string;
  regionName: string | null;
  memberCount: number;
};

export type HomeTownHallTeaser = {
  slug: string;
  title: string;
  kindLabel: string;
  regionName: string | null;
  startsAt: string | null;
  status: string;
};

export type HomeReportCardTeaser = {
  year: number;
  label: string;
  entryCount: number;
};

export type HomeVoiceTeaser = {
  totalReports: number;
};

/** Serializable snapshot for homepage “participate & explore” modules. */
export type HomeAtAGlanceData = {
  petitions: HomePetitionTeaser[] | null;
  publicCauses: HomePublicCauseTeaser[] | null;
  communities: HomeCommunityTeaser[] | null;
  townHalls: HomeTownHallTeaser[] | null;
  reportCard: HomeReportCardTeaser | null;
  voiceTotals: HomeVoiceTeaser | null;
};

export function emptyHomeAtAGlanceData(): HomeAtAGlanceData {
  return {
    petitions: null,
    publicCauses: null,
    communities: null,
    townHalls: null,
    reportCard: null,
    voiceTotals: null,
  };
}

export function homeAtAGlanceHasLiveContent(d: HomeAtAGlanceData): boolean {
  return (
    (d.petitions != null && d.petitions.length > 0) ||
    (d.publicCauses != null && d.publicCauses.length > 0) ||
    (d.communities != null && d.communities.length > 0) ||
    (d.townHalls != null && d.townHalls.length > 0) ||
    d.reportCard != null ||
    (d.voiceTotals != null && d.voiceTotals.totalReports > 0)
  );
}

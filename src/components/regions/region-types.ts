/** Static profile fields for Ghana regions (see `ghanaRegionsData` in `site-content`). */
export type RegionData = {
  name: string;
  capital: string;
  population: number;
  areaKm2: number;
  districts?: number;
  constituencies?: number;
  regionalMinister?: string;
  keySectors?: string;
  pillarFocus?: readonly string[];
  townHallStatus?: string;
  mbkruVoiceStatus?: string;
  mbkruNote: string;
};

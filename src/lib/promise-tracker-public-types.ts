/** Top policy categories in the current filter slice (for snapshot analytics). */
export type TopPolicySectorSlice = { key: string; label: string; count: number };

/** Serializable tracker stats for public UI (shared by server loaders and client components). */
export type PromiseTrackerStats = {
  scope: "all" | "government";
  totalPromises: number;
  governmentPromises: number;
  mpsWithPromises: number;
  activeMpsTotal: number;
  publishedReportCardCycles: number;
  reportCardEntriesPublished: number;
  byStatus: Partial<Record<string, number>>;
  /** Up to four policy sectors in this slice, by row count (desc). */
  topPolicySectors: TopPolicySectorSlice[];
};

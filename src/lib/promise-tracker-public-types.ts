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
};

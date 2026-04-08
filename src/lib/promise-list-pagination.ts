/** Page size for public HTML promise lists (`/promises/browse`, `/government-commitments`). */
export const PROMISE_LIST_PAGE_SIZE = 50;

export function parsePromiseListPageIndex(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, 500);
}

export function buildPromiseListPageHref(
  basePath: string,
  args: {
    q: string;
    sector: string | undefined;
    status: string | undefined;
    governmentOnly?: boolean;
    page: number;
  },
): string {
  const p = new URLSearchParams();
  if (args.q) p.set("q", args.q);
  if (args.sector) p.set("sector", args.sector);
  if (args.status) p.set("status", args.status);
  if (args.governmentOnly) p.set("governmentOnly", "1");
  if (args.page > 1) p.set("page", String(args.page));
  const qs = p.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

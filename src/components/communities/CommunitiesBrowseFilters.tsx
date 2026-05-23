import Link from "next/link";

import {
  communitiesBrowseHref,
  joinFilterLabel,
  sortLabel,
  type CommunitiesBrowseParams,
} from "@/lib/communities-browse-shared";
import { focusRingPillClass, focusRingSmClass, primaryNavLinkClass } from "@/lib/primary-link-styles";

type RegionOption = { slug: string; name: string; count: number };

type Props = {
  regions: RegionOption[];
  params: CommunitiesBrowseParams;
  invalidShort?: boolean;
  resultCount?: number | null;
  regionName?: string | null;
};

function chipClass(active: boolean) {
  return `rounded-full px-3 py-1.5 text-xs font-semibold transition ${
    active
      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
      : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--primary)]/40"
  } ${focusRingPillClass}`;
}

export function CommunitiesBrowseFilters({
  regions,
  params,
  invalidShort = false,
  resultCount = null,
  regionName = null,
}: Props) {
  const join = params.join ?? "all";
  const sort = params.sort ?? "name";
  const hasExtraFilters = join !== "all" || sort !== "name" || Boolean(params.region);
  const browseBase = { join, sort };

  return (
    <>
      <form
        action="/communities"
        method="get"
        className="mt-8 space-y-4 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-5"
        role="search"
      >
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">Find your Queen Mother space</p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted-foreground)]">
            Filter by region, search by town or traditional area name, then join open communities instantly after
            sign-in.
          </p>
        </div>

        <div>
          <label htmlFor="community-search" className="sr-only">
            Search communities and posts
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              id="community-search"
              name="q"
              type="search"
              defaultValue={params.q ?? ""}
              placeholder="Town, traditional area, or council name…"
              minLength={2}
              maxLength={120}
              className={`w-full touch-manipulation rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--foreground)] shadow-sm transition-shadow focus-visible:border-[var(--primary)]/35 ${focusRingSmClass}`}
            />
            <button
              type="submit"
              className={`min-h-11 w-full shrink-0 touch-manipulation rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] active:scale-[0.99] motion-reduce:active:scale-100 sm:min-h-0 sm:w-auto ${focusRingSmClass}`}
            >
              Search
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label
              htmlFor="community-region"
              className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Region
            </label>
            <select
              id="community-region"
              name="region"
              defaultValue={params.region ?? ""}
              className={`mt-1.5 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)] ${focusRingSmClass}`}
            >
              <option value="">All regions ({regions.reduce((n, r) => n + r.count, 0)})</option>
              {regions.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.name} ({r.count})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="community-join"
              className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Join policy
            </label>
            <select
              id="community-join"
              name="join"
              defaultValue={join}
              className={`mt-1.5 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)] ${focusRingSmClass}`}
            >
              <option value="all">Any join policy</option>
              <option value="open">Open — join instantly</option>
              <option value="approval">Approval required</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="community-sort"
              className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Sort by
            </label>
            <select
              id="community-sort"
              name="sort"
              defaultValue={sort}
              className={`mt-1.5 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)] ${focusRingSmClass}`}
            >
              <option value="name">Name A–Z</option>
              <option value="traditional">Traditional area A–Z</option>
              <option value="region">Region, then name</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            className={`inline-flex min-h-10 items-center rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)]/40 ${focusRingSmClass}`}
          >
            Apply filters
          </button>
          {hasExtraFilters || params.q?.trim() ? (
            <Link href="/communities" className={`text-sm font-semibold ${primaryNavLinkClass}`}>
              Clear all
            </Link>
          ) : null}
        </div>
      </form>

      {invalidShort ? (
        <p className="mt-2 text-sm text-amber-800">Enter at least 2 characters to search.</p>
      ) : null}

      {params.q?.trim() ? (
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">
          Results for &quot;{params.q.trim()}&quot;
          {regionName ? ` in ${regionName}` : null}
          {joinFilterLabel(join) ? ` · ${joinFilterLabel(join)}` : null}
          {" · "}
          <Link href={communitiesBrowseHref({ ...browseBase, region: params.region })} className={primaryNavLinkClass}>
            Clear search
          </Link>
        </p>
      ) : null}

      {!params.q?.trim() && (regionName || join !== "all" || sort !== "name") ? (
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">
          {typeof resultCount === "number" ? (
            <>
              Showing {resultCount} {resultCount === 1 ? "space" : "spaces"}
              {regionName ? ` in ${regionName}` : null}
              {joinFilterLabel(join) ? ` · ${joinFilterLabel(join)}` : null}
              {sort !== "name" ? ` · ${sortLabel(sort)}` : null}
            </>
          ) : null}
          {regionName ? (
            <>
              {" · "}
              <Link href={communitiesBrowseHref({ join, sort })} className={primaryNavLinkClass}>
                Clear region
              </Link>
            </>
          ) : join !== "all" || sort !== "name" ? (
            <>
              {" · "}
              <Link href="/communities" className={primaryNavLinkClass}>
                Clear filters
              </Link>
            </>
          ) : null}
        </p>
      ) : null}

      {params.region && !regionName && !params.q?.trim() ? (
        <p className="mt-3 text-sm text-amber-800">
          Unknown region filter.{" "}
          <Link href={communitiesBrowseHref({ join, sort })} className={primaryNavLinkClass}>
            Show all communities
          </Link>
        </p>
      ) : null}

      <nav className="mt-4 flex flex-wrap gap-2" aria-label="Quick filters">
        <Link href={communitiesBrowseHref({ ...browseBase })} className={chipClass(!params.region && join === "all")}>
          All regions
        </Link>
        <Link
          href={communitiesBrowseHref({ ...browseBase, region: params.region, join: "open" })}
          className={chipClass(join === "open")}
        >
          Open to join
        </Link>
        {regions.map((r) => {
          const active = params.region === r.slug;
          return (
            <Link
              key={r.slug}
              href={communitiesBrowseHref({ ...browseBase, region: r.slug })}
              className={chipClass(active)}
            >
              {r.name}
              <span className="ml-1 font-normal opacity-80">({r.count})</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

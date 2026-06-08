import Link from "next/link";

import {
  communitiesBrowseHref,
  joinFilterLabel,
  sortLabel,
  type CommunitiesBrowseParams,
} from "@/lib/communities-browse-shared";
import { focusRingSmClass, primaryNavLinkClass } from "@/lib/primary-link-styles";

type RegionOption = { slug: string; name: string; count: number };

type Props = {
  regions: RegionOption[];
  params: CommunitiesBrowseParams;
  invalidShort?: boolean;
  resultCount?: number | null;
  regionName?: string | null;
};

const fieldLabelClass =
  "block text-xs font-semibold text-[var(--foreground-secondary)] sm:text-sm";
const fieldClass = `mt-1.5 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)] ${focusRingSmClass}`;

export function CommunitiesBrowseFilters({
  regions,
  params,
  invalidShort = false,
  resultCount = null,
  regionName = null,
}: Props) {
  const join = params.join ?? "all";
  const sort = params.sort ?? "name";
  const verified = Boolean(params.verified);
  const hasExtraFilters = join !== "all" || sort !== "name" || Boolean(params.region) || verified;
  const browseBase = { join, sort, verified: verified || undefined };

  return (
    <>
      <form
        action="/communities"
        method="get"
        className="mt-6 space-y-4 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:mt-8 sm:p-5"
        role="search"
      >
        <div>
          <p className="text-base font-semibold text-[var(--foreground)]">Find your Queen Mother space</p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--foreground-secondary)]">
            Search by town or traditional area, then filter by region and join policy.
          </p>
        </div>

        <div>
          <label htmlFor="community-search" className={fieldLabelClass}>
            Search
          </label>
          <input
            id="community-search"
            name="q"
            type="search"
            defaultValue={params.q ?? ""}
            placeholder="Town, traditional area, or council name…"
            minLength={2}
            maxLength={120}
            className={`${fieldClass} touch-manipulation`}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="community-region" className={fieldLabelClass}>
              Region
            </label>
            <select id="community-region" name="region" defaultValue={params.region ?? ""} className={fieldClass}>
              <option value="">All regions ({regions.reduce((n, r) => n + r.count, 0)})</option>
              {regions.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.name} ({r.count})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="community-join" className={fieldLabelClass}>
              Join policy
            </label>
            <select id="community-join" name="join" defaultValue={join} className={fieldClass}>
              <option value="all">Any join policy</option>
              <option value="open">Open — join instantly</option>
              <option value="approval">Approval required</option>
            </select>
          </div>
          <div>
            <label htmlFor="community-sort" className={fieldLabelClass}>
              Sort by
            </label>
            <select id="community-sort" name="sort" defaultValue={sort} className={fieldClass}>
              <option value="name">Name A–Z</option>
              <option value="traditional">Traditional area A–Z</option>
              <option value="region">Region, then name</option>
            </select>
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-[var(--border)]/80 bg-[var(--section-light)] px-3 py-2.5 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            name="verified"
            value="1"
            defaultChecked={verified}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--border)] text-[var(--primary)]"
          />
          <span>
            <span className="font-medium">Verified Queen Mothers only</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-[var(--foreground-secondary)]">
              At least one verified Queen Mother on the platform.
            </span>
          </span>
        </label>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="submit"
            className={`min-h-11 w-full touch-manipulation rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] sm:w-auto ${focusRingSmClass}`}
          >
            Show communities
          </button>
          {hasExtraFilters || params.q?.trim() ? (
            <Link href="/communities" className={`text-center text-sm font-semibold sm:text-left ${primaryNavLinkClass}`}>
              Clear all
            </Link>
          ) : null}
        </div>
      </form>

      {invalidShort ? (
        <p className="mt-2 text-sm font-medium text-amber-900">Enter at least 2 characters to search.</p>
      ) : null}

      {params.q?.trim() ? (
        <p className="mt-3 rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground-secondary)]">
          Results for &quot;{params.q.trim()}&quot;
          {regionName ? ` in ${regionName}` : null}
          {joinFilterLabel(join) ? ` · ${joinFilterLabel(join)}` : null}
          {verified ? " · Verified Queen Mothers" : null}
          {" · "}
          <Link href={communitiesBrowseHref({ ...browseBase, region: params.region })} className={primaryNavLinkClass}>
            Clear search
          </Link>
        </p>
      ) : null}

      {!params.q?.trim() && (regionName || join !== "all" || sort !== "name" || verified) ? (
        <p className="mt-3 rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground-secondary)]">
          {typeof resultCount === "number" ? (
            <>
              Showing {resultCount} {resultCount === 1 ? "space" : "spaces"}
              {regionName ? ` in ${regionName}` : null}
              {joinFilterLabel(join) ? ` · ${joinFilterLabel(join)}` : null}
              {verified ? " · Verified Queen Mothers" : null}
              {sort !== "name" ? ` · ${sortLabel(sort)}` : null}
            </>
          ) : null}
          {regionName ? (
            <>
              {" · "}
              <Link href={communitiesBrowseHref({ join, sort, verified: verified || undefined })} className={primaryNavLinkClass}>
                Clear region
              </Link>
            </>
          ) : join !== "all" || sort !== "name" || verified ? (
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
        <p className="mt-3 text-sm font-medium text-amber-900">
          Unknown region filter.{" "}
          <Link href={communitiesBrowseHref({ join, sort })} className={primaryNavLinkClass}>
            Show all communities
          </Link>
        </p>
      ) : null}
    </>
  );
}

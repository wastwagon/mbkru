import Link from "next/link";

import {
  POLICY_SECTOR_LABELS,
  POLICY_SECTOR_VALUES,
} from "@/lib/promise-policy-sectors";
import {
  PROMISE_LIST_STATUS_FILTER,
  PROMISE_LIST_STATUS_LABELS,
} from "@/lib/promise-list-filters";

type Props = {
  /** Prefix for `id` attributes (unique per page). */
  idPrefix: string;
  hrefClear: string;
  q: string;
  sector: string | undefined;
  status: string | undefined;
  hasActiveFilters: boolean;
  showGovernmentOnlyToggle?: boolean;
  governmentOnlyChecked?: boolean;
};

export function PromiseListFilterForm({
  idPrefix,
  hrefClear,
  q,
  sector,
  status,
  hasActiveFilters,
  showGovernmentOnlyToggle,
  governmentOnlyChecked,
}: Props) {
  return (
    <form
      method="get"
      className="mt-8 flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end"
    >
      <div className="min-w-0 flex-1 sm:max-w-xs">
        <label htmlFor={`${idPrefix}-q`} className="block text-xs font-medium text-[var(--foreground)]">
          Search
        </label>
        <input
          id={`${idPrefix}-q`}
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Title or description…"
          className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
        />
      </div>
      <div className="sm:w-44">
        <label htmlFor={`${idPrefix}-sector`} className="block text-xs font-medium text-[var(--foreground)]">
          Category
        </label>
        <select
          id={`${idPrefix}-sector`}
          name="sector"
          defaultValue={sector ?? ""}
          className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {POLICY_SECTOR_VALUES.map((v) => (
            <option key={v} value={v}>
              {POLICY_SECTOR_LABELS[v]}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:w-40">
        <label htmlFor={`${idPrefix}-status`} className="block text-xs font-medium text-[var(--foreground)]">
          Status
        </label>
        <select
          id={`${idPrefix}-status`}
          name="status"
          defaultValue={status ?? ""}
          className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {PROMISE_LIST_STATUS_FILTER.map((v) => (
            <option key={v} value={v}>
              {PROMISE_LIST_STATUS_LABELS[v]}
            </option>
          ))}
        </select>
      </div>
      {showGovernmentOnlyToggle ? (
        <div className="flex items-center gap-2 pb-2 sm:pb-0">
          <input
            id={`${idPrefix}-gov`}
            name="governmentOnly"
            type="checkbox"
            value="1"
            defaultChecked={governmentOnlyChecked}
            className="h-4 w-4 rounded border-[var(--border)]"
          />
          <label htmlFor={`${idPrefix}-gov`} className="text-sm text-[var(--foreground)]">
            Government programme only
          </label>
        </div>
      ) : null}
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
        >
          Apply
        </button>
        {hasActiveFilters ? (
          <Link
            href={hrefClear}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--section-light)]"
          >
            Clear
          </Link>
        ) : null}
      </div>
    </form>
  );
}

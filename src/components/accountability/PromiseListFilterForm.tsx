import Link from "next/link";

import { focusRingSmClass } from "@/lib/primary-link-styles";
import {
  PROMISE_LIST_STATUS_FILTER,
  PROMISE_LIST_STATUS_LABELS,
} from "@/lib/promise-list-filters";
import {
  POLICY_SECTOR_LABELS,
  POLICY_SECTOR_VALUES,
} from "@/lib/promise-policy-sectors";

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
  const fieldClass = `mt-1 w-full touch-manipulation rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)] transition-shadow focus-visible:border-[var(--primary)]/35 ${focusRingSmClass}`;

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
          className={fieldClass}
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
          className={`${fieldClass} cursor-pointer`}
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
          className={`${fieldClass} cursor-pointer`}
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
            className={`h-5 w-5 shrink-0 rounded border-[var(--border)] text-[var(--primary)] ${focusRingSmClass}`}
          />
          <label htmlFor={`${idPrefix}-gov`} className="text-sm text-[var(--foreground)]">
            Government programme only
          </label>
        </div>
      ) : null}
      <div className="flex w-full flex-wrap gap-2 sm:w-auto">
        <button
          type="submit"
          className={`min-h-10 flex-1 touch-manipulation rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] active:scale-[0.99] motion-reduce:active:scale-100 sm:flex-none ${focusRingSmClass}`}
        >
          Apply
        </button>
        {hasActiveFilters ? (
          <Link
            href={hrefClear}
            className={`inline-flex min-h-10 flex-1 touch-manipulation items-center justify-center rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--section-light)] sm:flex-none ${focusRingSmClass}`}
          >
            Clear
          </Link>
        ) : null}
      </div>
    </form>
  );
}

import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
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
  return (
    <form
      method="get"
      className="mt-8 flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end"
    >
      <FormField label="Search" htmlFor={`${idPrefix}-q`} className="min-w-0 flex-1 sm:max-w-xs">
        <Input
          id={`${idPrefix}-q`}
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Title or description…"
        />
      </FormField>
      <FormField label="Category" htmlFor={`${idPrefix}-sector`} className="sm:w-44">
        <Select id={`${idPrefix}-sector`} name="sector" defaultValue={sector ?? ""}>
          <option value="">All categories</option>
          {POLICY_SECTOR_VALUES.map((v) => (
            <option key={v} value={v}>
              {POLICY_SECTOR_LABELS[v]}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Status" htmlFor={`${idPrefix}-status`} className="sm:w-40">
        <Select id={`${idPrefix}-status`} name="status" defaultValue={status ?? ""}>
          <option value="">All statuses</option>
          {PROMISE_LIST_STATUS_FILTER.map((v) => (
            <option key={v} value={v}>
              {PROMISE_LIST_STATUS_LABELS[v]}
            </option>
          ))}
        </Select>
      </FormField>
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
        <Button type="submit" className="min-h-11 flex-1 justify-center sm:flex-none">
          Apply
        </Button>
        {hasActiveFilters ? (
          <Button href={hrefClear} variant="surface" className="min-h-11 flex-1 justify-center sm:flex-none">
            Clear
          </Button>
        ) : null}
      </div>
    </form>
  );
}

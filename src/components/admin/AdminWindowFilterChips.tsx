import Link from "next/link";

import { adminFilterChipClass } from "@/lib/admin/admin-ui-classes";

export type AdminWindowFilterOption = {
  value: number;
  label: string;
};

type Props = {
  /** Base path without query, e.g. `/admin/analytics/citizen-reports`. */
  hrefBase: string;
  /** Query param name (`months`, `days`, …). */
  param: string;
  options: AdminWindowFilterOption[];
  active: number;
  label?: string;
  className?: string;
};

/** Shared window / period filter chips for admin analytics pages. */
export function AdminWindowFilterChips({
  hrefBase,
  param,
  options,
  active,
  label = "Window",
  className = "",
}: Props) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`.trim()}>
      <span className="text-sm text-[var(--foreground-secondary)]">{label}:</span>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((opt) => {
          const isActive = opt.value === active;
          const href = `${hrefBase}?${param}=${opt.value}`;
          return (
            <Link
              key={opt.value}
              href={href}
              className={adminFilterChipClass(isActive)}
              aria-current={isActive ? "page" : undefined}
            >
              {opt.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

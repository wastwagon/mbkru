import type { ReactNode } from "react";

import { adminKickerClass, adminMetricCardClass, adminMetricTileClass } from "@/lib/admin/admin-ui-classes";

type Props = {
  label: string;
  value: ReactNode;
  /** @default "lg" — `font-display text-2xl` */
  valueSize?: "lg" | "xl";
  /** Muted one-liner under the value */
  subline?: ReactNode;
  /** @default "cell" — compact; `tile` matches analytics summary cards */
  surface?: "cell" | "tile";
};

/** Static metric cell (counts, status breakdowns). */
export function AdminMetricCard({ label, value, valueSize = "lg", subline, surface = "cell" }: Props) {
  const valueClass =
    valueSize === "xl"
      ? "mt-1 font-display text-3xl font-bold tabular-nums text-[var(--foreground)]"
      : "mt-1 font-display text-2xl font-bold text-[var(--foreground)]";
  const wrapClass = surface === "tile" ? adminMetricTileClass : adminMetricCardClass;
  return (
    <div className={wrapClass}>
      <p className={adminKickerClass}>{label}</p>
      <p className={valueClass}>{value}</p>
      {subline != null ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">{subline}</p> : null}
    </div>
  );
}

import type { ReactNode } from "react";

import { StatusBadge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { adminKickerClass, adminMetricCardClass, adminMetricTileClass } from "@/lib/admin/admin-ui-classes";

type Props = {
  label: string;
  value: ReactNode;
  /** @default "lg" — `font-display text-2xl` */
  valueSize?: "lg" | "xl";
  /** Muted one-liner under the value */
  subline?: ReactNode;
  /** Optional hover/focus explanation for the metric label. */
  hint?: string;
  /**
   * Optional delta chip — positive → success, negative → danger, zero → neutral.
   * Pass a preformatted string like `+12%` or `-3`.
   */
  delta?: string;
  deltaTone?: "success" | "warning" | "danger" | "info" | "neutral";
  /** @default "cell" — compact; `tile` matches analytics summary cards */
  surface?: "cell" | "tile";
};

/** Static metric cell (counts, status breakdowns). */
export function AdminMetricCard({
  label,
  value,
  valueSize = "lg",
  subline,
  hint,
  delta,
  deltaTone = "neutral",
  surface = "cell",
}: Props) {
  const valueClass =
    valueSize === "xl"
      ? "mt-1 font-display text-3xl font-bold tabular-nums text-[var(--foreground)]"
      : "mt-1 font-display text-2xl font-bold tabular-nums text-[var(--foreground)]";
  const wrapClass = surface === "tile" ? adminMetricTileClass : adminMetricCardClass;
  const labelNode = hint ? (
    <Tooltip content={hint}>
      <span className={`${adminKickerClass} border-b border-dotted border-[var(--foreground-secondary)]/50`}>
        {label}
      </span>
    </Tooltip>
  ) : (
    <p className={adminKickerClass}>{label}</p>
  );

  return (
    <div className={wrapClass}>
      <div className="flex items-start justify-between gap-2">
        {labelNode}
        {delta != null && delta !== "" ? <StatusBadge tone={deltaTone}>{delta}</StatusBadge> : null}
      </div>
      <p className={valueClass}>{value}</p>
      {subline != null ? <p className="mt-1 text-xs text-[var(--foreground-secondary)]">{subline}</p> : null}
    </div>
  );
}

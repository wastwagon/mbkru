import Link from "next/link";
import type { ReactNode } from "react";

import { StatusBadge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { adminKickerClass, adminStatTileLinkClass } from "@/lib/admin/admin-ui-classes";

type Props = {
  href: string;
  label: string;
  value: ReactNode;
  footer: ReactNode;
  /** Optional week-delta / status chip next to the label. */
  delta?: string;
  deltaTone?: "success" | "warning" | "danger" | "info" | "neutral";
  /** Hover/focus explanation for the metric. */
  hint?: string;
};

/** Dashboard snapshot tile linking to a queue or report. */
export function AdminStatTileLink({
  href,
  label,
  value,
  footer,
  delta,
  deltaTone = "neutral",
  hint,
}: Props) {
  const labelNode = hint ? (
    <Tooltip content={hint} interactive>
      <span className={`${adminKickerClass} border-b border-dotted border-[var(--foreground-secondary)]/40`}>
        {label}
      </span>
    </Tooltip>
  ) : (
    <p className={adminKickerClass}>{label}</p>
  );

  return (
    <Link href={href} className={adminStatTileLinkClass}>
      <div className="flex items-start justify-between gap-2">
        {labelNode}
        {delta != null && delta !== "" ? <StatusBadge tone={deltaTone}>{delta}</StatusBadge> : null}
      </div>
      <p className="mt-1 font-display text-3xl font-bold tabular-nums text-[var(--foreground)]">{value}</p>
      <div className="mt-2 text-sm">{footer}</div>
    </Link>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";

import { adminKickerClass, adminStatTileLinkClass } from "@/lib/admin/admin-ui-classes";

type Props = {
  href: string;
  label: string;
  value: ReactNode;
  footer: ReactNode;
};

/** Dashboard snapshot tile linking to a queue or report. */
export function AdminStatTileLink({ href, label, value, footer }: Props) {
  return (
    <Link href={href} className={adminStatTileLinkClass}>
      <p className={adminKickerClass}>{label}</p>
      <p className="mt-1 font-display text-3xl font-bold tabular-nums text-[var(--foreground)]">{value}</p>
      <div className="mt-2 text-sm">{footer}</div>
    </Link>
  );
}

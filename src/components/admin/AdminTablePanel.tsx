import type { ReactNode } from "react";

import { adminTablePanelClass } from "@/lib/admin/admin-ui-classes";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Shared shell for admin tables with horizontal overflow. */
export function AdminTablePanel({ children, className = "" }: Props) {
  return <div className={`${adminTablePanelClass} ${className}`.trim()}>{children}</div>;
}

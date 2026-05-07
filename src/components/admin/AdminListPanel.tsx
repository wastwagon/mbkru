import type { ReactNode } from "react";

import { adminListPanelClass } from "@/lib/admin/admin-ui-classes";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Bordered list shell with row dividers (reports, posts, members, …). */
export function AdminListPanel({ children, className = "" }: Props) {
  return <ul className={`${adminListPanelClass} ${className}`.trim()}>{children}</ul>;
}

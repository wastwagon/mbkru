import type { ReactNode } from "react";

import { type AdminPageWidth, adminPageWidthClass } from "@/lib/admin/admin-page-layout";

type Props = {
  children: ReactNode;
  /** @default "default" */
  width?: AdminPageWidth;
  className?: string;
};

/**
 * Horizontally centers admin page content with the standard padding rhythm.
 */
export function AdminPageContainer({ children, width = "default", className = "" }: Props) {
  const w = adminPageWidthClass(width);
  return <div className={`mx-auto ${w} px-4 py-10 sm:px-6 ${className}`.trim()}>{children}</div>;
}

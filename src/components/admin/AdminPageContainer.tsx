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
  return <div className={`mx-auto ${w} px-4 py-8 sm:px-6 sm:py-10 ${className}`.trim()}>{children}</div>;
}

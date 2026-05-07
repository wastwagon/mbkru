import type { ReactNode } from "react";

import { AdminBackLink } from "@/components/admin/AdminBackLink";

type Props = {
  title: string;
  titleAs?: "h1" | "h2";
  description?: ReactNode;
  /**
   * When `false`, omits the dashboard back row (e.g. `/admin` home).
   * @default true
   */
  showDashboardBack?: boolean;
  /**
   * Replace the default “Back to dashboard” row (e.g. “← All reports” on detail pages).
   */
  backSlot?: ReactNode;
  /** Right-aligned actions (e.g. log out, secondary links). */
  actions?: ReactNode;
  /** Extra classes on the title element (e.g. line-clamp on long report titles). */
  titleClassName?: string;
};

/**
 * Shared title + intro copy + optional action row for admin pages.
 */
export function AdminPageHeader({
  title,
  titleAs = "h1",
  description,
  showDashboardBack = true,
  backSlot,
  actions,
  titleClassName = "",
}: Props) {
  const TitleTag = titleAs;
  const defaultTitleClass =
    "font-display text-2xl font-bold text-[var(--foreground)]" +
    (titleClassName ? ` ${titleClassName}` : "");

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          {backSlot ? (
            <div className="text-sm text-[var(--muted-foreground)]">{backSlot}</div>
          ) : showDashboardBack ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              <AdminBackLink />
            </p>
          ) : null}
          <TitleTag className={backSlot || showDashboardBack ? `mt-4 ${defaultTitleClass}` : defaultTitleClass}>
            {title}
          </TitleTag>
          {description ? (
            <div className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{description}</div>
          ) : null}
        </div>
        {actions ? <div className="shrink-0 sm:pt-1">{actions}</div> : null}
      </div>
    </div>
  );
}

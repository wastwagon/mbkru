import Link from "next/link";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { StatusBadge } from "@/components/ui/Badge";
import type { AdminAttentionItem } from "@/lib/server/admin-home-attention";
import { primaryLinkClass } from "@/lib/primary-link-styles";

type Props = {
  items: AdminAttentionItem[];
  className?: string;
};

const toneBorder: Record<AdminAttentionItem["tone"], string> = {
  danger: "border-rose-200 bg-rose-50/60",
  warning: "border-amber-200 bg-amber-50/50",
  info: "border-[var(--primary)]/20 bg-[var(--primary)]/5",
};

const toneBadge: Record<AdminAttentionItem["tone"], "danger" | "warning" | "info"> = {
  danger: "danger",
  warning: "warning",
  info: "info",
};

/**
 * Prioritized ops attention list for the admin dashboard.
 * Only render when there is work — empty queues stay quiet.
 */
export function AdminAttentionList({ items, className = "" }: Props) {
  if (items.length === 0) {
    return (
      <AdminEmptyState
        className={className}
        title="Nothing urgent"
        message="No SLA breaches, open community reports, or failed notification jobs right now."
        action={{ href: "/admin/analytics/citizen-reports", label: "View report analytics" }}
      />
    );
  }

  return (
    <ul className={`space-y-3 ${className}`.trim()}>
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href}
            className={`flex flex-wrap items-start justify-between gap-3 rounded-2xl border px-4 py-4 transition hover:border-[var(--primary)]/35 ${toneBorder[item.tone]}`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={toneBadge[item.tone]}>{item.count}</StatusBadge>
                <p className="text-sm font-semibold text-[var(--foreground)]">{item.title}</p>
              </div>
              <p className="mt-1 text-sm text-[var(--foreground-secondary)]">{item.detail}</p>
            </div>
            <span className={`${primaryLinkClass} shrink-0 text-sm`}>Open →</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

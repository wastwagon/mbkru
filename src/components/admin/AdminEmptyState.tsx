import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";

type Props = {
  /** Short primary line (required for backwards compatibility when no title). */
  message?: string;
  title?: string;
  description?: ReactNode;
  action?: { href: string; label: string };
  className?: string;
};

/** Empty state for admin panels — plain text by default; richer panel when title/action set. */
export function AdminEmptyState({ message, title, description, action, className = "" }: Props) {
  const body = description ?? message;
  const rich = Boolean(title || action);

  if (!rich) {
    return (
      <p className={`text-sm text-[var(--foreground-secondary)] ${className}`.trim()}>{body}</p>
    );
  }

  return (
    <div
      className={`rounded-xl border border-dashed border-[var(--border)] bg-[var(--section-light)]/40 px-4 py-5 ${className}`.trim()}
    >
      {title ? <p className="text-sm font-semibold text-[var(--foreground)]">{title}</p> : null}
      {body != null ? (
        <p className={`text-sm text-[var(--foreground-secondary)] ${title ? "mt-1" : ""}`}>{body}</p>
      ) : null}
      {action ? (
        <Button href={action.href} variant="surface" density="admin" size="sm" className="mt-3">
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}

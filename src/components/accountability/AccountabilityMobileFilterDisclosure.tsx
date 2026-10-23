"use client";

import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";

import { focusRingSmClass } from "@/lib/primary-link-styles";

function subscribeWide(onChange: () => void) {
  const mq = window.matchMedia("(min-width: 640px)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getWide() {
  return window.matchMedia("(min-width: 640px)").matches;
}

function getWideServerSnapshot() {
  return true;
}

type Props = {
  title: string;
  /** When true, the mobile panel starts expanded. */
  active?: boolean;
  children: ReactNode;
  className?: string;
};

/**
 * Collapses dense filter toolbars behind a tappable summary on narrow viewports;
 * full panel layout from `sm` upward (Apple-style progressive disclosure).
 */
export function AccountabilityMobileFilterDisclosure({ title, active = false, children, className = "" }: Props) {
  const wide = useSyncExternalStore(subscribeWide, getWide, getWideServerSnapshot);

  if (wide) {
    return <div className={className}>{children}</div>;
  }

  return (
    <details
      className={`rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm ${className}`.trim()}
      open={active || undefined}
    >
      <summary
        className={`flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-[var(--foreground)] [&::-webkit-details-marker]:hidden ${focusRingSmClass}`}
      >
        <span>{title}</span>
        <span className="shrink-0 text-xs font-medium text-[var(--foreground-secondary)]">
          {active ? "Active · tap to edit" : "Tap to expand"}
        </span>
      </summary>
      <div className="border-t border-[var(--border)] p-4">{children}</div>
    </details>
  );
}

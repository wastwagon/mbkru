import { focusRingSmClass } from "@/lib/primary-link-styles";

/** 16px fields — prevents iOS Safari auto-zoom on focus. */
export const mobileFormFieldClass = `mt-1 w-full touch-manipulation rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-base text-[var(--foreground)] transition-shadow focus-visible:border-[var(--primary)]/35 ${focusRingSmClass}`;

/** Filter / quick-action chips with 44px minimum height. */
export const mobileFilterChipClass = `inline-flex min-h-11 items-center rounded-full border border-[var(--border)] bg-[var(--section-light)]/50 px-3.5 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--section-light)] touch-manipulation ${focusRingSmClass}`;

/** Fixed overlay top — clears sticky header + safe area. */
export const mobileOverlayTopClass =
  "top-[max(4.75rem,calc(env(safe-area-inset-top)+3.5rem))] sm:top-[max(5rem,calc(env(safe-area-inset-top)+4rem))]";

/** Main content bottom padding — clears bottom tab bar + install banner + FAB stack on mobile. */
export const mobileMainBottomPadClass =
  "pb-[calc(7.5rem+var(--mobile-install-banner-height,0rem)+max(1rem,env(safe-area-inset-bottom)))] lg:pb-[max(1rem,env(safe-area-inset-bottom))]";

/** Icon-only control — 44×44 minimum. */
export const mobileIconButtonClass = `inline-flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-xl ${focusRingSmClass}`;

/** Compact inline action (remove attachment, draft row, dismiss). */
export const mobileInlineActionClass = `inline-flex min-h-11 shrink-0 touch-manipulation items-center rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--section-light)] ${focusRingSmClass}`;

/** Destructive inline action. */
export const mobileInlineActionDangerClass = `inline-flex min-h-11 shrink-0 touch-manipulation items-center rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-800 transition-colors hover:bg-red-50 ${focusRingSmClass}`;

/** Success-context inline action (e.g. withdraw signature). */
export const mobileInlineActionSuccessClass = `inline-flex min-h-11 touch-manipulation items-center rounded-lg border border-emerald-300 bg-transparent px-3 py-2 text-sm font-semibold text-emerald-950 transition-colors hover:bg-white disabled:opacity-50 ${focusRingSmClass}`;

/** Nav / filter pill with 44px minimum height. */
export const mobileNavPillClass = `inline-flex min-h-11 touch-manipulation items-center rounded-full border border-[var(--border)] bg-white px-3.5 py-2 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:border-[var(--primary)]/40 hover:text-[var(--primary)] ${focusRingSmClass}`;

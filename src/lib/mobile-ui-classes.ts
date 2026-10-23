import { focusRingSmClass } from "@/lib/primary-link-styles";
import { fieldControlClass } from "@/lib/ui/field-styles";

/**
 * Compact public fields (filter toolbars, a11y panels).
 * Prefer `<Input density="compact" />` / `fieldControlClass({ density: "compact" })` for new code.
 */
export const mobileFormFieldClass = fieldControlClass({ density: "compact" });

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
export const mobileInlineActionClass = `inline-flex min-h-11 shrink-0 touch-manipulation items-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--section-light)] ${focusRingSmClass}`;

/** Destructive inline action. */
export const mobileInlineActionDangerClass = `inline-flex min-h-11 shrink-0 touch-manipulation items-center rounded-lg border border-red-200 bg-[var(--card)] px-3 py-2 text-sm font-medium text-red-800 transition-colors hover:bg-red-50 ${focusRingSmClass}`;

/** Success-context inline action (e.g. withdraw signature). */
export const mobileInlineActionSuccessClass = `inline-flex min-h-11 touch-manipulation items-center rounded-lg border border-emerald-300 bg-transparent px-3 py-2 text-sm font-semibold text-emerald-950 transition-colors hover:bg-[var(--section-light)] disabled:opacity-50 ${focusRingSmClass}`;

/** Nav / filter pill with 44px minimum height. */
export const mobileNavPillClass = `inline-flex min-h-11 touch-manipulation items-center rounded-full border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:border-[var(--primary)]/40 hover:text-[var(--primary)] ${focusRingSmClass}`;

/**
 * Primary submit row on long forms — sticks above the bottom tab bar on small screens.
 * Pair with error text and the submit button inside the same wrapper.
 */
export const mobileFormStickySubmitBarClass = `sticky z-20 -mx-1 mt-6 flex flex-col gap-3 border-t border-[var(--border)] bg-[var(--background)]/95 px-1 pt-4 shadow-[0_-8px_24px_rgb(0_0_0_/0.06)] backdrop-blur-md supports-[backdrop-filter]:bg-[var(--background)]/90 bottom-[calc(var(--mobile-bottom-nav-height)+var(--mobile-install-banner-height,0rem)+max(0.5rem,env(safe-area-inset-bottom)))] lg:static lg:bottom-auto lg:mx-0 lg:mt-0 lg:border-0 lg:bg-transparent lg:px-0 lg:pt-0 lg:shadow-none lg:backdrop-blur-none`;

/**
 * Shared Tailwind class strings for admin dashboards — keeps stat tiles, lists, and tool cards visually aligned.
 */

import { focusRingSmClass } from "@/lib/primary-link-styles";

/** Uppercase label above metrics or form sections */
export const adminKickerClass =
  "text-xs font-semibold uppercase tracking-wide text-[var(--foreground-secondary)]";

/** Dashboard snapshot tiles that link to a queue */
export const adminStatTileLinkClass =
  "rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:border-[var(--primary)]/35";

/** Compact metric cell (e.g. notification status counts) */
export const adminMetricCardClass =
  "rounded-xl border border-[var(--border)] bg-white p-4";

/** Larger metric tile (e.g. analytics summary strip) */
export const adminMetricTileClass =
  "rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm";

/** Admin tools grid cards (large clickable tiles) */
export const adminToolLinkCardClass =
  "block rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:border-[var(--primary)]/30";

/** `ul` wrapper for row lists with dividers */
export const adminListPanelClass =
  "divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-white";

/** Shared wrapper for wide admin tables — stacks rows as cards below `sm`. */
export const adminTablePanelClass =
  "admin-table-panel overflow-x-auto rounded-2xl border border-[var(--border)] bg-white sm:overflow-x-auto";

/** 16px admin form controls — prevents iOS zoom. */
export const adminFormFieldClass = `mt-1 w-full touch-manipulation rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-base text-[var(--foreground)] ${focusRingSmClass}`;

/** Primary admin action button (forms, queues). */
export const adminPrimaryButtonClass = `inline-flex min-h-11 touch-manipulation items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] active:scale-[0.99] motion-reduce:active:scale-100 ${focusRingSmClass}`;

/** Secondary / outline admin button. */
export const adminSecondaryButtonClass = `inline-flex min-h-11 touch-manipulation items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--section-light)] active:scale-[0.99] motion-reduce:active:scale-100 ${focusRingSmClass}`;

/** Filter / tab chips in admin lists. */
export function adminFilterChipClass(active: boolean) {
  return [
    `inline-flex min-h-11 touch-manipulation items-center rounded-full px-4 py-2 text-sm font-medium transition-colors ${focusRingSmClass}`,
    active
      ? "bg-[var(--primary)] text-white"
      : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--primary)]/40",
  ].join(" ");
}

/** Sidebar + mobile admin nav links. */
export function adminNavLinkClass(active: boolean) {
  return [
    "flex min-h-11 touch-manipulation items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
    active
      ? "bg-[var(--primary)]/12 text-[var(--primary)]"
      : "text-[var(--foreground-secondary)] hover:bg-[var(--section-light)] hover:text-[var(--foreground)]",
    focusRingSmClass,
  ].join(" ");
}

/** Queue / moderation inline actions — shared base for semantic variants. */
const adminActionBase = `inline-flex min-h-11 touch-manipulation items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors active:scale-[0.99] motion-reduce:active:scale-100 ${focusRingSmClass}`;

/** Default queue action (save, neutral). */
export const adminQueueActionClass = `${adminActionBase} border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-[var(--muted)]`;

/** Muted / archive-style queue action. */
export const adminQueueActionMutedClass = `${adminActionBase} border-[var(--border)] bg-[var(--section-light)] font-semibold text-[var(--foreground)] hover:bg-[var(--muted)]/20`;

/** White neutral action (un-archive, unpublish). */
export const adminQueueActionNeutralClass = `${adminActionBase} border-[var(--border)] bg-white font-semibold text-[var(--foreground)] hover:bg-[var(--section-light)]`;

/** Primary-coloured text link-style action. */
export const adminQueueActionLinkClass = `${adminActionBase} border-[var(--border)] text-[var(--primary)] hover:bg-[var(--muted)]`;

/** Warning / close / revoke. */
export const adminQueueActionWarningClass = `${adminActionBase} border-amber-300 bg-amber-50 font-semibold text-amber-950 hover:bg-amber-100`;

/** Warning outline (reset stuck jobs, retry). */
export const adminQueueActionWarningOutlineClass = `${adminActionBase} border-amber-400 bg-white font-semibold hover:bg-amber-100`;

/** Success / reopen / publish document. */
export const adminQueueActionSuccessClass = `${adminActionBase} border-emerald-300 bg-emerald-50 font-semibold text-emerald-950 hover:bg-emerald-100`;

/** Strong success (publish resource). */
export const adminQueueActionSuccessPublishClass = `${adminActionBase} border-emerald-600/40 bg-emerald-50 text-emerald-900 hover:bg-emerald-100`;

/** Danger / remove / delete forum. */
export const adminQueueActionDangerClass = `${adminActionBase} border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100`;

/** Permanent delete (resources). */
export const adminQueueActionDeleteClass = `${adminActionBase} border-red-200 bg-red-50 text-red-900 hover:bg-red-100`;

/** Solid green publish (report card cycles). */
export const adminSuccessButtonClass = `inline-flex min-h-11 touch-manipulation items-center justify-center rounded-lg border border-transparent bg-green-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-800 active:scale-[0.99] motion-reduce:active:scale-100 ${focusRingSmClass}`;

/** Inline select (status pickers in flex rows). */
export const adminInlineSelectClass = `min-h-11 touch-manipulation rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-base text-[var(--foreground)] ${focusRingSmClass}`;

/** Compact numeric admin input. */
export const adminNumberInputClass = `w-24 min-h-11 touch-manipulation rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-base text-[var(--foreground)] ${focusRingSmClass}`;

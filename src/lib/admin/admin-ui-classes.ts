/**
 * Shared Tailwind class strings for admin dashboards — keeps stat tiles, lists, and tool cards visually aligned.
 */

/** Uppercase label above metrics or form sections */
export const adminKickerClass =
  "text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]";

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

/** Shared wrapper for wide admin tables */
export const adminTablePanelClass =
  "overflow-x-auto rounded-2xl border border-[var(--border)] bg-white";

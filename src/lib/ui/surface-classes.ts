/**
 * Theme-aware surfaces — use instead of hard-coded `bg-white` on public UI
 * so `prefers-color-scheme: dark` tokens apply consistently.
 */
export const surfaceCardClass = "bg-[var(--card)]";

/** Full-width section bands that were formerly `bg-white`. */
export const surfacePageClass = "bg-[var(--background)]";

/** Horizontal accent band (Voice hub, parliament CTA, situational alerts). */
export const surfaceAccentBandClass =
  "bg-gradient-to-r from-[var(--primary)]/5 via-[var(--card)] to-[var(--primary)]/5";

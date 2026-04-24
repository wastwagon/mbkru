/** Core `--ring` outline (no corner rounding). */
export const focusRingBareClass =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]";

/** Shared keyboard focus ring for compact controls (body links, summaries, text buttons, inputs). */
export const focusRingSmClass = `focus-visible:rounded-sm ${focusRingBareClass}`;

/** Shared keyboard focus ring for toolbar-style links with larger corners. */
export const focusRingMdClass = `focus-visible:rounded-md ${focusRingBareClass}`;

/** Pills / chips (`rounded-full`) on light backgrounds (e.g. homepage tool strip). */
export const focusRingPillClass =
  "focus-visible:rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]";

/**
 * Row links inside a bordered list (`divide-y` + outer `border`).
 * Slightly inset outline so the ring meets the list edge cleanly.
 */
export const focusRingInsetRowClass = `focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ring)]`;

/** `focus-within` variant so child focus shows the same ring on a wrapping label/card. */
export const focusRingWithinSmClass =
  "focus-within:rounded-sm focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--ring)]";

/** Footer / gold top bar: `rounded-md` text rows (matches footer nav link shape). */
export const focusRingOnDark60Class =
  "focus-visible:rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60";

/** Footer legal links (softer ring on small text). */
export const focusRingOnDark50Class =
  "focus-visible:rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50";

/** Circular social icon on dark footer. */
export const focusRingOnDark70IconClass =
  "focus-visible:rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70";

/** White-filled CTA on dark footer (`rounded-xl`). */
export const focusRingOnDarkSolidClass =
  "focus-visible:rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

/** Gold `TopBar` contact pills (`rounded-xl`). */
export const focusRingOnDark85PillClass =
  "focus-visible:rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/85";

/** `TopBar` social tiles (`rounded-xl`, `sm:rounded-lg`). */
export const focusRingOnDark80TileClass =
  "focus-visible:rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 sm:focus-visible:rounded-lg";

/** Primary links in body copy (including mid-sentence). */
export const primaryLinkClass = `font-medium text-[var(--primary)] underline-offset-4 transition-colors hover:underline ${focusRingSmClass}`;

/** Primary links in toolbars / wrapped nav rows (~44px min tap height). */
export const primaryNavLinkClass = `inline-flex min-h-9 items-center font-medium text-[var(--primary)] underline-offset-4 transition-colors hover:underline ${focusRingMdClass}`;

/** Same as `primaryNavLinkClass` with a 44px minimum touch target. */
export const primaryNavLinkTouchClass = `inline-flex min-h-[44px] items-center font-medium text-[var(--primary)] underline-offset-4 transition-colors hover:underline ${focusRingMdClass}`;

/** Resource index titles: neutral by default, primary on hover (still keyboard-visible). */
export const resourceTitleLinkClass = `font-medium text-[var(--foreground)] underline-offset-4 transition-colors hover:text-[var(--primary)] hover:underline ${focusRingSmClass}`;

/** Destructive text actions (hide/delete): underline on hover + same focus ring as primary links. */
export const destructiveTextControlClass = `underline-offset-4 transition-colors hover:underline ${focusRingSmClass}`;

/** Use on `prose` wrappers so markdown / legal anchors match `primaryLinkClass` hover + focus rings. */
export const prosePrimaryAnchorClass =
  "prose-a:text-[var(--primary)] prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-4 prose-a:transition-colors prose-a:duration-200 prose-a:rounded-sm prose-a:focus-visible:outline prose-a:focus-visible:outline-2 prose-a:focus-visible:outline-offset-2 prose-a:focus-visible:outline-[var(--ring)]";

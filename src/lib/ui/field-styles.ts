/**
 * Shared form-control styles (Untitled UI Inputs patterns → MBKRU tokens).
 *
 * Token bridge (Figma Untitled UI → CSS vars in globals.css):
 * - brand / primary          → --primary, --primary-dark, --ring
 * - text primary / secondary → --foreground, --foreground-secondary
 * - border / gray 200        → --border
 * - bg primary / white       → --background, white
 * - error / fg error         → Tailwind red-400 / red-600 (semantic; keep until status tokens land)
 * - radius md / lg           → --radius-lg (admin), --radius-xl (public)
 *
 * Prefer FormField + Input/Textarea/Select over copying these strings.
 */

import { focusRingSmClass } from "@/lib/primary-link-styles";

export type FieldDensity = "public" | "admin" | "compact";

const densityClass: Record<FieldDensity, string> = {
  /** Auth, contact, voice — roomier public fields (matches prior inputClass clones). */
  public:
    "mt-1 block w-full touch-manipulation rounded-xl border bg-[var(--card)] px-4 py-3 text-base text-[var(--foreground)] transition-shadow",
  /** Admin dashboards — denser, 16px text (matches adminFormFieldClass). */
  admin:
    "mt-1 block w-full touch-manipulation rounded-lg border bg-[var(--card)] px-3 py-2.5 text-base text-[var(--foreground)] transition-shadow",
  /** Filter toolbars / mobile panels — tighter padding than public. */
  compact:
    "mt-1 w-full touch-manipulation rounded-xl border bg-[var(--card)] px-3 py-2.5 text-base text-[var(--foreground)] transition-shadow",
};

const fieldNormalClass =
  "border-[var(--border)] focus-visible:border-[var(--primary)]/35 hover:border-[var(--primary)]/30";

const fieldInvalidClass =
  "border-red-400 focus-visible:border-red-400 focus-visible:outline-red-400/80";

const fieldDisabledClass = "disabled:cursor-not-allowed disabled:opacity-60";

const fieldPlaceholderClass = "placeholder:text-[var(--foreground-secondary)]/70";

/** Native <select> chevron (Untitled-style dropdown affordance). */
export const selectChevronClass =
  "cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10";

export function fieldControlClass({
  density = "public",
  invalid = false,
}: {
  density?: FieldDensity;
  invalid?: boolean;
} = {}): string {
  return [
    densityClass[density],
    invalid ? fieldInvalidClass : fieldNormalClass,
    fieldPlaceholderClass,
    fieldDisabledClass,
    focusRingSmClass,
  ].join(" ");
}

export function selectControlClass({
  density = "public",
  invalid = false,
}: {
  density?: FieldDensity;
  invalid?: boolean;
} = {}): string {
  return `${fieldControlClass({ density, invalid })} ${selectChevronClass}`;
}

/** Label text used by FormField (Untitled Input label). */
export const fieldLabelClass = "block text-sm font-medium text-[var(--foreground)]";

export const fieldHintClass = "mt-1 text-xs text-[var(--foreground-secondary)]";

export const fieldErrorClass = "mt-1 text-sm text-red-600";

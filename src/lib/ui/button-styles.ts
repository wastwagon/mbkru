/**
 * Shared button class builders (Untitled UI Buttons → MBKRU tokens).
 *
 * Hierarchy map:
 * - primary     → brand fill (--primary)
 * - secondary   → brighter teal fill (existing marketing secondary — keep stable)
 * - surface     → white + border (Untitled “Secondary” / admin secondary)
 * - outline     → teal border
 * - ghost       → text-only
 * - destructive → solid red (Untitled Destructive)
 * - pill        → full-round primary CTA
 */

import { focusRingSmClass } from "@/lib/primary-link-styles";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "surface"
  | "outline"
  | "ghost"
  | "destructive"
  | "pill";

export type ButtonSize = "sm" | "md" | "lg";
export type ButtonDensity = "public" | "admin";

const baseClass = `inline-flex touch-manipulation items-center justify-center gap-2 font-semibold transition-all duration-[400ms] ease-in-out disabled:pointer-events-none disabled:opacity-50 ${focusRingSmClass}`;

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md hover:bg-[var(--primary-dark)] hover:shadow-lg active:scale-[0.98]",
  secondary: "bg-[var(--secondary)] text-white hover:bg-[var(--primary)] active:scale-[0.98]",
  surface:
    "border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--section-light)] active:scale-[0.99] motion-reduce:active:scale-100",
  outline:
    "border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white active:scale-[0.98]",
  ghost: "text-[var(--primary)] hover:bg-[var(--muted)]",
  destructive: "bg-red-700 text-white shadow-md hover:bg-red-800 hover:shadow-lg active:scale-[0.98]",
  pill: "rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md hover:bg-[var(--primary-dark)] hover:shadow-lg active:scale-[0.98]",
};

const publicSizeClass: Record<ButtonSize, string> = {
  sm: "min-h-11 h-11 rounded-lg px-4 text-sm",
  md: "h-11 rounded-xl px-6 text-base",
  lg: "h-12 rounded-xl px-8 text-base",
};

const pillSizeClass: Record<ButtonSize, string> = {
  sm: "min-h-11 h-11 rounded-full px-5 text-sm",
  md: "h-12 rounded-full px-6 py-3 text-base",
  lg: "h-14 rounded-full px-8 py-4 text-base",
};

/** Dense admin controls — matches prior adminPrimaryButtonClass / adminSecondaryButtonClass. */
const adminSizeClass: Record<ButtonSize, string> = {
  sm: "min-h-11 rounded-lg px-3 py-2 text-sm",
  md: "min-h-11 rounded-lg px-4 py-2.5 text-sm",
  lg: "min-h-11 rounded-lg px-5 py-2.5 text-sm",
};

export function buttonClass({
  variant = "primary",
  size = "md",
  density = "public",
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  density?: ButtonDensity;
  className?: string;
} = {}): string {
  const sizePart =
    variant === "pill"
      ? pillSizeClass[size]
      : density === "admin"
        ? adminSizeClass[size]
        : publicSizeClass[size];

  const variantPart =
    density === "admin" && (variant === "primary" || variant === "destructive")
      ? variantClass[variant].replace(/ shadow-md| hover:shadow-lg/g, "")
      : variantClass[variant];

  return `${baseClass} ${variantPart} ${sizePart} ${className}`.trim();
}

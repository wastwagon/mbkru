import { type HTMLAttributes } from "react";

/**
 * Badge variants (Untitled UI Badges → MBKRU).
 * Marketing: primary / gold / warm / outline*.
 * Status: success / warning / danger / info / neutral.
 */
const variants = {
  primary:
    "rounded-full bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-[var(--primary)] sm:px-4 sm:py-1.5 sm:text-sm",
  gold:
    "rounded-full bg-[var(--accent-gold)]/20 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-[var(--accent-gold)] sm:px-4 sm:text-sm",
  warm:
    "rounded-full bg-[var(--accent-warm)]/15 px-3 py-1.5 text-xs font-medium text-[var(--accent-warm)]",
  outline:
    "rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white",
  outlineGold:
    "rounded-full border border-white/30 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--accent-gold)]",
  success:
    "rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-900",
  warning:
    "rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-950",
  danger:
    "rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-900",
  info: "rounded-full border border-[var(--primary)]/25 bg-[var(--primary)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--primary-dark)]",
  neutral:
    "rounded-full border border-[var(--border)] bg-[var(--section-light)] px-2.5 py-0.5 text-xs font-semibold text-[var(--foreground-secondary)]",
} as const;

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
};

export function Badge({ variant = "primary", className = "", children, ...props }: BadgeProps) {
  return (
    <span className={`inline-block ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}

/** Compact status chip — alias for semantic Badge variants. */
export function StatusBadge({
  tone = "neutral",
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "success" | "warning" | "danger" | "info" | "neutral";
}) {
  return (
    <Badge variant={tone} className={className} {...props}>
      {children}
    </Badge>
  );
}

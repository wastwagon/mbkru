import { type HTMLAttributes } from "react";

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

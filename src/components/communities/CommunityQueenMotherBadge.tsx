type Props = {
  count?: number;
  /** Compact pill for list cards; default block for detail headers. */
  variant?: "pill" | "inline";
};

export function CommunityQueenMotherBadge({ count = 1, variant = "pill" }: Props) {
  const label =
    count > 1 ? `${count} verified Queen Mothers` : "Verified Queen Mother on platform";

  if (variant === "inline") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--primary)]">
        <span aria-hidden className="text-sm">
          ✓
        </span>
        {label}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--primary)]">
      Queen Mother verified
    </span>
  );
}

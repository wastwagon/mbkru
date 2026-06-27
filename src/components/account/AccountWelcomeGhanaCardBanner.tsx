import { focusRingSmClass, primaryLinkClass } from "@/lib/primary-link-styles";

type Props = {
  show: boolean;
  ghanaCardVerified: boolean;
  hubtelConfigured: boolean;
};

export function AccountWelcomeGhanaCardBanner({ show, ghanaCardVerified, hubtelConfigured }: Props) {
  if (!show || ghanaCardVerified || !hubtelConfigured) return null;

  return (
    <div
      className="mt-6 rounded-xl border border-[var(--primary)]/25 bg-[var(--primary)]/5 px-4 py-4 sm:px-5"
      role="status"
    >
      <p className="text-sm font-semibold text-[var(--foreground)]">Welcome — verify your Ghana Card</p>
      <p className="mt-1 text-xs leading-relaxed text-[var(--foreground-secondary)]">
        Link your Ghana Card to unlock verified constituent MP performance reports on Citizens Voice. Council
        evaluations from Queen Mothers use a separate institutional workflow.
      </p>
      <a
        href="#ghana-card-verify"
        className={`${primaryLinkClass} mt-3 inline-flex min-h-11 touch-manipulation items-center text-sm font-semibold ${focusRingSmClass}`}
      >
        Verify Ghana Card below →
      </a>
      <p className="mt-2 text-[11px] text-[var(--foreground-secondary)]">
        Optional now — required before submitting MP performance reports when verification is enabled.
      </p>
    </div>
  );
}

export function MemberGhanaCardVerifiedBadge({ verified, lastFour }: { verified: boolean; lastFour: string | null }) {
  if (!verified) return null;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-green-900"
      title="Ghana Card verified constituent"
    >
      Verified constituent
      {lastFour ? <span className="font-mono font-normal opacity-80">····{lastFour}</span> : null}
    </span>
  );
}

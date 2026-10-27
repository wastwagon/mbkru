import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import {
  accountabilityDisclaimers,
  type AccountabilityDisclaimerVariant,
} from "@/config/site-disclaimers";
import { ToolPageLegalLinks } from "@/components/legal/ToolPageLegalLinks";

type Props = {
  variant: AccountabilityDisclaimerVariant;
  className?: string;
};

export function AccountabilityDisclaimerCallout({ variant, className = "" }: Props) {
  const entry = accountabilityDisclaimers[variant];
  const sharingNote = "sharingNote" in entry ? entry.sharingNote : undefined;
  const compact = platformFeatures.publicLaunchPolish(getServerPlatformPhase());

  return (
    <aside
      className={`rounded-xl border border-[var(--border)] bg-[var(--card)]/90 p-4 text-sm leading-relaxed text-[var(--foreground-secondary)] shadow-sm ${className}`.trim()}
      aria-label={entry.title}
    >
      {compact ? (
        <>
          <p className="text-sm text-[var(--foreground-secondary)]">{entry.body}</p>
          {sharingNote ? <p className="mt-2 text-xs font-medium text-[var(--foreground)]">{sharingNote}</p> : null}
        </>
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">{entry.title}</p>
          <p className="mt-2">{entry.body}</p>
          {sharingNote ? <p className="mt-2 font-medium text-[var(--foreground)]">{sharingNote}</p> : null}
        </>
      )}
      {compact ? null : <ToolPageLegalLinks />}
    </aside>
  );
}

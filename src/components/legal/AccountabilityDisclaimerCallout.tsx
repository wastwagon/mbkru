import Link from "next/link";

import {
  accountabilityDisclaimers,
  type AccountabilityDisclaimerVariant,
} from "@/config/site-disclaimers";
import { primaryLinkClass } from "@/lib/primary-link-styles";

type Props = {
  variant: AccountabilityDisclaimerVariant;
  className?: string;
};

export function AccountabilityDisclaimerCallout({ variant, className = "" }: Props) {
  const { title, body } = accountabilityDisclaimers[variant];

  return (
    <aside
      className={`rounded-xl border border-[var(--border)] bg-white/90 p-4 text-sm leading-relaxed text-[var(--muted-foreground)] shadow-sm ${className}`.trim()}
      aria-label={title}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">{title}</p>
      <p className="mt-2">{body}</p>
      <p className="mt-3 text-xs">
        <Link href="/methodology#claims-and-citations" className={primaryLinkClass}>
          Claims &amp; limitations
        </Link>
        {" · "}
        <Link href="/terms" className={primaryLinkClass}>
          Terms of Use
        </Link>
      </p>
    </aside>
  );
}

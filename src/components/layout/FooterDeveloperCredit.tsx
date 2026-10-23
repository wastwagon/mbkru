import { content } from "@/lib/site-content";
import { focusRingOnDark50Class } from "@/lib/primary-link-styles";

const { developerCredit } = content;

/** Partner attribution — subtle, readable on dark footer. */
export function FooterDeveloperCredit() {
  return (
    <div
      className="mt-6 border-t border-white/10 pt-5 lg:mt-0 lg:border-t-0 lg:pt-0 lg:text-right"
      aria-label="Site development credit"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">{developerCredit.lead}</p>
      <a
        href={developerCredit.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`group mt-1.5 inline-flex rounded-md px-0.5 py-0.5 text-sm font-semibold text-white/85 transition-colors hover:text-white ${focusRingOnDark50Class}`}
      >
        {developerCredit.name}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </div>
  );
}

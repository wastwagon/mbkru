import Link from "next/link";

import { focusRingSmClass } from "@/lib/primary-link-styles";
import { mobileNavPillClass } from "@/lib/mobile-ui-classes";

type HubLink = { href: string; label: string };

type Props = {
  showStats: boolean;
  civicEngagement: boolean;
};

const primaryClass = `inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--accent-gold)] px-6 py-2.5 text-sm font-semibold text-[var(--section-dark)] shadow-md transition-colors hover:bg-[var(--accent-warm)] sm:w-auto ${focusRingSmClass}`;

const secondaryClass = `inline-flex min-h-11 w-full items-center justify-center rounded-xl border-2 border-white/40 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--card)]/10 sm:w-auto ${focusRingSmClass}`;

const mobilePillClass = `${mobileNavPillClass} border-white/35 bg-[var(--card)]/10 text-white shadow-none hover:border-white/60 hover:bg-[var(--card)]/15 hover:text-white`;

/** Voice hub CTAs — primary actions first; secondary tools scroll on narrow screens. */
export function CitizensVoiceHubActions({ showStats, civicEngagement }: Props) {
  const secondary: HubLink[] = [
    ...(showStats ? [{ href: "/transparency", label: "Public statistics" }] : []),
    ...(civicEngagement
      ? [
          { href: "/petitions", label: "Petitions" },
          { href: "/citizens-voice/causes", label: "Public causes" },
        ]
      : []),
  ];

  return (
    <div className="mt-6">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
        <Link href="/citizens-voice/submit" className={primaryClass}>
          Submit a report
        </Link>
        <Link href="/track-report" className={secondaryClass}>
          Track a report
        </Link>
        {secondary.map((link) => (
          <Link key={link.href} href={link.href} className={`hidden sm:inline-flex ${secondaryClass}`}>
            {link.label}
          </Link>
        ))}
      </div>

      {secondary.length > 0 ? (
        <div className="mt-4 sm:hidden">
          <p className="mb-2 text-center text-[10px] font-medium uppercase tracking-wide text-white/70">
            More tools · swipe
          </p>
          <div
            className="relative max-sm:[-webkit-mask-image:linear-gradient(90deg,transparent,#000_10px,#000_calc(100%-10px),transparent)] max-sm:[mask-image:linear-gradient(90deg,transparent,#000_10px,#000_calc(100%-10px),transparent)]"
          >
            <div
              className={`-mx-1 flex flex-nowrap snap-x snap-proximity gap-2 overflow-x-auto overscroll-x-contain scroll-smooth px-1 pb-1 [scrollbar-width:thin] ${focusRingSmClass}`}
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {secondary.map((link) => (
                <Link key={link.href} href={link.href} className={mobilePillClass}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

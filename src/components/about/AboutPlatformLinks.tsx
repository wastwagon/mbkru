import Link from "next/link";

import { getServerPlatformPhase } from "@/config/platform";
import { getAboutPhaseQuickLinks } from "@/config/public-platform-nav";
import { focusRingPillClass } from "@/lib/primary-link-styles";

const pill = `inline-flex rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] shadow-sm transition hover:border-[var(--primary)]/40 hover:text-[var(--primary)] ${focusRingPillClass}`;

export async function AboutPlatformLinks() {
  const phase = getServerPlatformPhase();
  if (phase < 2) {
    return (
      <section className="border-b border-[var(--border)] bg-[var(--section-light)]/80 py-4">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-[var(--muted-foreground)] sm:px-6 lg:px-8">
          Some civic tools appear gradually as the programme enables them. Use the links below when they are active on this
          site.
        </div>
      </section>
    );
  }

  const quickLinks = getAboutPhaseQuickLinks(phase);

  return (
    <section className="border-b border-[var(--primary)]/15 bg-gradient-to-r from-[var(--primary)]/[0.06] to-[var(--accent-gold)]/[0.06] py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[11px] font-bold uppercase tracking-wider text-[var(--primary)]">
          Live platform
        </p>
        <p className="mx-auto mt-1 max-w-2xl text-center text-sm text-[var(--muted-foreground)]">
          Explore tools available here — consistent with the main navigation.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {quickLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={pill}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

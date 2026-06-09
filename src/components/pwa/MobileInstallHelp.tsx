"use client";

import Link from "next/link";

import { VoiceOpenChatCTA } from "@/components/voice/VoiceOpenChatCTA";
import { focusRingSmClass, primaryLinkClass } from "@/lib/primary-link-styles";
import { usePwaInstall } from "@/lib/use-pwa-install";

/** FAQ / help block — install MBKRU on mobile and use the app shell. */
export function MobileInstallHelp() {
  const { mode, installing, install, showAccountCard, isInstalled } = usePwaInstall();

  return (
    <section
      aria-labelledby="mobile-install-heading"
      className="rounded-2xl border border-[var(--primary)]/20 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6"
    >
      <h2 id="mobile-install-heading" className="font-display text-lg font-semibold text-[var(--foreground)]">
        Using MBKRU on your phone
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-secondary)]">
        The site is built mobile-first. On phones you get a bottom navigation bar, large tap targets, and MBKRU Voice
        chat from the <strong className="font-medium text-[var(--foreground)]">Voice</strong> tab.
      </p>

      <ul className="mt-4 space-y-3 text-sm text-[var(--foreground-secondary)]">
        <li className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden />
          <span>
            <strong className="text-[var(--foreground)]">Android (Chrome):</strong> use the install prompt when offered,
            or Menu → Install app / Add to Home screen.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden />
          <span>
            <strong className="text-[var(--foreground)]">iPhone (Safari):</strong> tap Share → Add to Home Screen for
            full-screen access without the browser bar.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden />
          <span>
            Signed-in members can also open{" "}
            <Link href="/account" className={primaryLinkClass}>
              Account
            </Link>{" "}
            for install options and offline-friendly shortcuts to key pages.
          </span>
        </li>
      </ul>

      {isInstalled ? (
        <p className="mt-4 rounded-xl bg-[var(--section-light)] px-4 py-3 text-sm text-[var(--foreground-secondary)]">
          You appear to be using MBKRU from your home screen already.
        </p>
      ) : showAccountCard && mode === "android" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={installing}
            onClick={() => void install()}
            className={`inline-flex min-h-11 touch-manipulation items-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] disabled:opacity-60 ${focusRingSmClass}`}
          >
            {installing ? "Installing…" : "Install MBKRU"}
          </button>
          <Link href="/account" className={`inline-flex min-h-11 items-center text-sm font-semibold ${primaryLinkClass}`}>
            Account settings
          </Link>
        </div>
      ) : (
        <div className="mt-4 lg:hidden">
          <VoiceOpenChatCTA />
        </div>
      )}
    </section>
  );
}

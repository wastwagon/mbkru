"use client";

import { focusRingSmClass } from "@/lib/primary-link-styles";
import { usePwaInstall } from "@/lib/use-pwa-install";

/** Prompts mobile users to install MBKRU as a home-screen app (Android) or Add to Home Screen (iOS). */
export function PwaInstallBanner() {
  const { mode, installing, install, dismiss, showBanner } = usePwaInstall();

  if (!showBanner || !mode) return null;

  return (
    <aside
      role="region"
      aria-label="Install MBKRU app"
      className="fixed inset-x-0 bottom-[calc(var(--mobile-bottom-nav-height)+max(0.25rem,env(safe-area-inset-bottom)))] z-[99] px-3 pb-2 lg:inset-x-auto lg:bottom-6 lg:right-6 lg:left-auto lg:max-w-sm lg:px-0 lg:pb-0"
    >
      <div className="mx-auto flex max-w-lg items-start gap-3 rounded-2xl border border-[var(--primary)]/25 bg-white p-3.5 shadow-lg ring-1 ring-black/5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--foreground)]">Install MBKRU</p>
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--foreground-secondary)]">
            {mode === "android"
              ? "Add to your home screen for quick access to Voice and accountability tools."
              : "Tap Share, then “Add to Home Screen” for app-like access."}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {mode === "android" ? (
              <button
                type="button"
                disabled={installing}
                onClick={() => void install()}
                className={`inline-flex min-h-11 touch-manipulation items-center rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] disabled:opacity-60 ${focusRingSmClass}`}
              >
                {installing ? "Installing…" : "Install"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={dismiss}
              className={`inline-flex min-h-11 touch-manipulation items-center rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--section-light)] ${focusRingSmClass}`}
            >
              Not now
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className={`inline-flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-xl text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--section-light)] hover:text-[var(--foreground)] ${focusRingSmClass}`}
          aria-label="Dismiss install prompt"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

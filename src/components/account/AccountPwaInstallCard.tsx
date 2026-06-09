"use client";

import { focusRingSmClass } from "@/lib/primary-link-styles";
import { usePwaInstall } from "@/lib/use-pwa-install";

/** Account settings card — install MBKRU when not already standalone. */
export function AccountPwaInstallCard() {
  const { mode, installing, install, dismiss, showAccountCard, isInstalled } = usePwaInstall();

  if (isInstalled) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--section-light)]/50 p-5">
        <p className="text-sm font-semibold text-[var(--foreground)]">App installed</p>
        <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
          You are using MBKRU from your home screen. Voice and navigation open in standalone mode.
        </p>
      </section>
    );
  }

  if (!showAccountCard || !mode) return null;

  return (
    <section className="rounded-2xl border border-[var(--primary)]/20 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-[var(--foreground)]">Install MBKRU on this device</p>
      <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
        {mode === "android"
          ? "Add a home-screen shortcut for faster access to Voice, tracker, and your account."
          : "In Safari, tap Share → Add to Home Screen for app-like access without the browser bar."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {mode === "android" ? (
          <button
            type="button"
            disabled={installing}
            onClick={() => void install()}
            className={`inline-flex min-h-11 touch-manipulation items-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] disabled:opacity-60 ${focusRingSmClass}`}
          >
            {installing ? "Installing…" : "Install app"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={dismiss}
          className={`inline-flex min-h-11 touch-manipulation items-center rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--section-light)] ${focusRingSmClass}`}
        >
          Hide for now
        </button>
      </div>
    </section>
  );
}

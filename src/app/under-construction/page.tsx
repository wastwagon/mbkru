import Link from "next/link";
import type { Metadata } from "next";

import { Logo } from "@/components/ui/Logo";
import { getPublicSiteConfig } from "@/lib/server/site-config";
import { heroContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Site update",
  description: "MBKRU Advocates — public site temporarily under construction.",
  robots: { index: false, follow: false },
};

export default async function UnderConstructionPage() {
  const config = await getPublicSiteConfig();
  const headline = config.constructionHeadline?.trim() || "We're preparing the MBKRU Advocates platform";
  const body =
    config.constructionBody?.trim() ||
    "The public site is temporarily unavailable while we complete editorial review, data verification, and launch checks. Programme content remains in our systems — only admins with a login can preview the full site. Contact us if you need to reach the team before launch.";

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[var(--section-light-tertiary)] via-white to-[var(--section-light)]">
      <header className="border-b border-[var(--border)] bg-white/80 px-4 py-5 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-center">
          <Logo />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-gold)]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-gold)]">
            <span className="h-2 w-2 rounded-full bg-[var(--accent-gold)]" aria-hidden />
            Under construction
          </span>
          <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            {headline}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--foreground-secondary)]">{body}</p>
          <p className="mt-3 text-sm text-[var(--foreground-secondary)]">{heroContent.tagline}</p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--primary-dark)]"
            >
              Contact the team
            </Link>
            <Link
              href="/admin/login"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-6 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--section-light)]"
            >
              Admin sign in
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--border)] px-4 py-6 text-center text-xs text-[var(--foreground-secondary)]">
        © {new Date().getFullYear()} MBKRU Advocates
      </footer>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

const OFFLINE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/citizens-voice", label: "MBKRU Voice" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/methodology", label: "Methodology" },
] as const;

export default function OfflinePage() {
  return (
    <div>
      <PageHeader
        title="You are offline"
        description="Reconnect to browse live data and submit reports. These pages may still open from cache."
      />
      <section className="section-spacing section-full bg-white">
        <div className="mx-auto max-w-lg px-4 sm:px-6">
          <ul className="space-y-2">
            {OFFLINE_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center rounded-xl border border-[var(--border)] bg-[var(--section-light)]/50 px-4 py-3 text-base font-semibold text-[var(--primary)] touch-manipulation transition-colors hover:bg-[var(--section-light)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-11 w-full touch-manipulation items-center justify-center rounded-xl bg-[var(--primary)] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[var(--primary-dark)]"
          >
            Try again
          </Link>
        </div>
      </section>
    </div>
  );
}

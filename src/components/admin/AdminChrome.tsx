"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { focusRingMdClass, primaryLinkClass } from "@/lib/primary-link-styles";

type Props = { children: React.ReactNode };

function AdminMobileNavControls() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const menuToggleClass = [
    "inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]",
    focusRingMdClass,
  ].join(" ");

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--section-light)] px-4 py-3 lg:hidden">
        <Link
          href="/admin"
          className={`font-display text-base font-bold text-[var(--foreground)] ${focusRingMdClass} rounded-md`}
        >
          Admin
        </Link>
        <button
          type="button"
          className={menuToggleClass}
          onClick={() => setMobileNavOpen((open) => !open)}
          aria-expanded={mobileNavOpen}
          aria-controls="admin-mobile-nav"
        >
          {mobileNavOpen ? "Close menu" : "Menu"}
        </button>
      </header>

      {mobileNavOpen ? (
        <div
          id="admin-mobile-nav"
          className="border-b border-[var(--border)] bg-white px-3 py-4 lg:hidden"
        >
          <AdminNavigation />
          <div className="mt-4 border-t border-[var(--border)] pt-4">
            <Link href="/" className={`${primaryLinkClass} text-sm`}>
              ← Public site
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}

/**
 * Admin shell: section navigation (sidebar on large screens, collapsible panel on small screens).
 * Login stays full-width without chrome.
 */
export function AdminChrome({ children }: Props) {
  const pathname = usePathname() ?? "";

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <aside
        className="sticky top-0 hidden h-screen w-[15.5rem] shrink-0 overflow-y-auto border-r border-[var(--border)] bg-white lg:block"
        aria-label="Admin navigation"
      >
        <div className="border-b border-[var(--border)] px-4 py-5">
          <Link
            href="/admin"
            className={`font-display text-lg font-bold text-[var(--foreground)] ${focusRingMdClass} rounded-md`}
          >
            Admin
          </Link>
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">MBKRU dashboard</p>
        </div>
        <div className="p-3">
          <AdminNavigation />
        </div>
        <div className="border-t border-[var(--border)] p-3">
          <Link href="/" className={`${primaryLinkClass} text-sm`}>
            ← Public site
          </Link>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-[var(--section-light)]">
        {/* Remount on route change so the mobile menu closes without an effect. */}
        <AdminMobileNavControls key={pathname} />

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

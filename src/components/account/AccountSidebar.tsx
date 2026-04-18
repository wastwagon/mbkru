"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  pathnameIsPromisesBrowseAccountability,
  pathnameIsPromisesByMpAccountability,
} from "@/config/accountability-catalogue-destinations";
import { getPublicPlatformPhase, platformFeatures } from "@/config/platform";
import { getAccountSidebarExploreLinks, getAccountSidebarVoiceLinks } from "@/config/public-platform-nav";

type NavItem = { href: string; label: string };

function accountNavActive(pathname: string, href: string) {
  if (href === "/account") return pathname === "/account";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function exploreNavActive(pathname: string, href: string): boolean {
  if (href === "/promises") return pathnameIsPromisesByMpAccountability(pathname);
  if (href === "/promises/browse") return pathnameIsPromisesBrowseAccountability(pathname);
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AccountSidebar() {
  const pathname = usePathname();
  const phase = getPublicPlatformPhase();
  const voice = platformFeatures.citizensVoicePlatform(phase);

  const main: NavItem[] = [
    { href: "/account", label: "Overview" },
    ...(voice ? ([{ href: "/account/reports", label: "My reports" }] satisfies NavItem[]) : []),
    { href: "/account/notifications", label: "Notifications" },
  ];

  const externalVoice = getAccountSidebarVoiceLinks(phase) as NavItem[];
  const explore = getAccountSidebarExploreLinks(phase) as NavItem[];

  const linkClass = (active: boolean) =>
    [
      "block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
      active
        ? "bg-[var(--primary)]/12 text-[var(--primary)]"
        : "text-[var(--muted-foreground)] hover:bg-[var(--section-light)] hover:text-[var(--foreground)]",
    ].join(" ");

  return (
    <aside className="lg:w-56 lg:shrink-0">
      <nav aria-label="Account" className="space-y-6">
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">Account</p>
          <ul className="mt-2 space-y-0.5">
            {main.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass(accountNavActive(pathname, item.href))}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {externalVoice.length > 0 ? (
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">Voice</p>
            <ul className="mt-2 space-y-0.5">
              {externalVoice.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass(pathname === item.href)}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">Explore</p>
          <ul className="mt-2 space-y-0.5">
            {explore.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass(exploreNavActive(pathname, item.href))}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}

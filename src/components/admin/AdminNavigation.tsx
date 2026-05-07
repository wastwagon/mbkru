"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ADMIN_NAV_GROUPS, adminNavLinkActive } from "@/config/admin-nav";
import { focusRingSmClass } from "@/lib/primary-link-styles";

function linkClass(active: boolean) {
  return [
    "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-[var(--primary)]/12 text-[var(--primary)]"
      : "text-[var(--muted-foreground)] hover:bg-[var(--section-light)] hover:text-[var(--foreground)]",
    focusRingSmClass,
  ].join(" ");
}

export function AdminNavigation() {
  const pathname = usePathname() ?? "";

  return (
    <div className="space-y-6">
      {ADMIN_NAV_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
            {group.title}
          </p>
          <ul className="mt-2 space-y-0.5">
            {group.items.map((item) => {
              const active = adminNavLinkActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass(active)} prefetch={false}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

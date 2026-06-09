"use client";

import Link from "next/link";

import { focusRingOnDark60Class } from "@/lib/primary-link-styles";
import { usePwaInstall } from "@/lib/use-pwa-install";

const linkClass = `inline-flex min-h-11 items-center text-sm font-semibold text-white/90 transition-colors hover:text-white ${focusRingOnDark60Class}`;

/** Footer link to account install card — mobile only, when install is available. */
export function FooterMobileInstallLink() {
  const { showAccountCard, isInstalled } = usePwaInstall();

  if (isInstalled || !showAccountCard) return null;

  return (
    <li className="lg:hidden">
      <Link href="/account" className={linkClass}>
        Install app on this device →
      </Link>
    </li>
  );
}

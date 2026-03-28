"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPublicPlatformPhase, platformFeatures } from "@/config/platform";
import { useMemberMe } from "@/hooks/useMemberMe";

const linkClass = "text-sm text-white/80 transition-colors hover:pl-2 hover:text-white";

/** Footer links for member auth (Phase 2+); mirrors homepage strip / header behaviour. */
export function FooterMemberAuth() {
  const pathname = usePathname();
  const phase = getPublicPlatformPhase();
  const authEnabled = platformFeatures.authentication(phase);
  const { member, busy: authBusy } = useMemberMe(phase >= 2 && authEnabled, pathname);

  if (phase < 2 || !authEnabled) return null;

  if (member != null) {
    return (
      <li>
        <Link href="/account" className={linkClass}>
          Account
        </Link>
      </li>
    );
  }

  return (
    <>
      <li>
        <Link href="/register" className={linkClass}>
          Register
        </Link>
      </li>
      <li>
        <Link href="/login" className={`${linkClass}${authBusy ? " opacity-70" : ""}`}>
          Sign in
        </Link>
      </li>
    </>
  );
}

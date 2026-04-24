"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPublicPlatformPhase, platformFeatures } from "@/config/platform";
import { useMemberMe } from "@/hooks/useMemberMe";
import { focusRingOnDark60Class } from "@/lib/primary-link-styles";

const linkClass = `inline-flex min-h-10 max-w-full items-center rounded-md px-1 py-1.5 -mx-1 text-sm text-white/80 transition-[color,transform] duration-200 ease-out hover:text-white hover:translate-x-0.5 motion-reduce:hover:translate-x-0 ${focusRingOnDark60Class}`;

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

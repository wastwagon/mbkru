"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { getPublicPlatformPhase, platformFeatures } from "@/config/platform";

const FOCUSED_PREFIXES = ["/login", "/register", "/forgot-password", "/reset-password", "/account"];

function isFocusedMemberRoute(pathname: string): boolean {
  return FOCUSED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Phase 4: hide floating Voice chat on auth/account routes to reduce chrome clutter. */
export function LaunchPolishVoiceChatSlot({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const launchPolish = platformFeatures.publicLaunchPolish(getPublicPlatformPhase());
  if (launchPolish && isFocusedMemberRoute(pathname)) return null;
  return children;
}

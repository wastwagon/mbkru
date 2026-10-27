"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { getPublicPlatformPhase, platformFeatures } from "@/config/platform";
import { isFocusedMemberRoute } from "@/lib/platform/focused-member-routes";

/** Phase 4: hide floating Voice chat on auth/account routes to reduce chrome clutter. */
export function LaunchPolishVoiceChatSlot({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const launchPolish = platformFeatures.publicLaunchPolish(getPublicPlatformPhase());
  if (launchPolish && isFocusedMemberRoute(pathname)) return null;
  return children;
}

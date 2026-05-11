"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

const INTERVAL_MS = 90_000;

/**
 * Best-effort presence ping: **home region** on all pages; **community** scope when the path is under `/communities/[slug]`.
 * Skips guests; fails silently.
 */
export function MemberPresenceHeartbeat() {
  const pathname = usePathname();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const communitySlug = useMemo(() => {
    const p = pathname ?? "";
    const m = p.match(/^\/communities\/([^/]+)/);
    return m?.[1]?.trim().toLowerCase() || null;
  }, [pathname]);

  useEffect(() => {
    function ping() {
      const body = communitySlug ? JSON.stringify({ communitySlug }) : "{}";
      void fetch("/api/member/presence", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body,
      }).catch(() => {});
    }
    ping();
    timer.current = setInterval(ping, INTERVAL_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [communitySlug]);

  return null;
}

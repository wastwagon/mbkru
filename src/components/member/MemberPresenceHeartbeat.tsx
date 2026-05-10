"use client";

import { useEffect, useRef } from "react";

const INTERVAL_MS = 90_000;

/**
 * Best-effort presence ping (home region only). Skips guests; fails silently.
 */
export function MemberPresenceHeartbeat() {
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function ping() {
      void fetch("/api/member/presence", { method: "POST", credentials: "include" }).catch(() => {});
    }
    ping();
    timer.current = setInterval(ping, INTERVAL_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  return null;
}

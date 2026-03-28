"use client";

import { useEffect, useState } from "react";

export type MemberMe = { displayName?: string | null; email: string };

type MeResponse = { member?: MemberMe | null };

/**
 * Cached GET /api/auth/me for client UI (header, homepage chips). Refetch when
 * `pathname` changes (e.g. after login navigation). No-op when `enabled` is false.
 */
export function useMemberMe(enabled: boolean, pathname: string) {
  const [member, setMember] = useState<MemberMe | null | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "include" })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setMember(null);
          return;
        }
        const data = (await res.json()) as MeResponse;
        setMember(data.member ?? null);
      })
      .catch(() => {
        if (!cancelled) setMember(null);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, pathname]);

  return {
    member,
    setMember,
    busy: enabled && member === undefined,
  };
}

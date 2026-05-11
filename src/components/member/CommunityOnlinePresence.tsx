"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { OnlinePresenceCard, type OnlinePresenceData } from "@/components/member/OnlinePresenceCard";
import { primaryLinkClass } from "@/lib/primary-link-styles";

type PresencePayload = OnlinePresenceData & {
  onlineCountsVisible?: boolean;
};

export function CommunityOnlinePresence({ communitySlug }: { communitySlug: string }) {
  const [data, setData] = useState<PresencePayload | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setErr(null);
    setData(null);
    (async () => {
      try {
        const res = await fetch(`/api/communities/${encodeURIComponent(communitySlug)}/presence`, {
          credentials: "include",
        });
        if (!res.ok) {
          if (!cancelled) setErr("Could not load community activity.");
          return;
        }
        const j = (await res.json()) as PresencePayload;
        if (!cancelled) setData(j);
      } catch {
        if (!cancelled) setErr("Could not load community activity.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [communitySlug]);

  return (
    <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--section-light)]/40 p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
        Community presence
      </h3>
      {err ? <p className="mt-2 text-sm text-red-600">{err}</p> : null}
      {!data && !err ? <p className="mt-2 text-sm text-[var(--muted-foreground)]">Loading…</p> : null}
      {data ? (
        <div className="mt-3">
          <OnlinePresenceCard
            data={data}
            audienceLine={
              <>
                Signed-in members with <strong>active membership</strong> in this community, active in the last few minutes
                (same window as regional presence).
              </>
            }
            signInToSeeCountLine="Sign in to see how many members are active in this community (last few minutes)."
            aggregateGuestNote="to see who else is online here (aggregate count may be public)."
            emptyPeersLine="No other members visible right now — open a thread below to start the conversation."
          />
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            <Link href="/login" className={`font-semibold ${primaryLinkClass}`}>
              Sign in
            </Link>{" "}
            ·{" "}
            <Link href="/register" className={`font-semibold ${primaryLinkClass}`}>
              Register
            </Link>
          </p>
        </div>
      ) : null}
    </section>
  );
}

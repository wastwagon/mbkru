"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";

type Props = {
  communitySlug: string;
  postId: string;
  authorMemberId: string;
  viewerMemberId: string | null;
};

export function ReportCommunityPostButton({
  communitySlug,
  postId,
  authorMemberId,
  viewerMemberId,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!viewerMemberId || viewerMemberId === authorMemberId) {
    return null;
  }

  async function submit() {
    const reason = window.prompt("Brief reason for this report (3–120 characters)", "");
    if (reason == null) return;
    const t = reason.trim();
    if (t.length < 3 || t.length > 120) {
      setMsg("Reason must be 3–120 characters.");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(
        `/api/communities/${encodeURIComponent(communitySlug)}/posts/${encodeURIComponent(postId)}/report`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: t }),
        },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setMsg(data.error ?? "Could not submit report.");
        return;
      }
      setMsg("Report sent to community moderators.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => void submit()}>
        Report post
      </Button>
      {msg ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">{msg}</p> : null}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { focusRingSmClass } from "@/lib/primary-link-styles";

type Props = {
  communitySlug: string;
  rootPostId: string;
};

export function CommunityReplyForm({ communitySlug, rootPostId }: Props) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<"GENERAL" | "CONCERN">("GENERAL");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/communities/${encodeURIComponent(communitySlug)}/posts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, body, parentPostId: rootPostId }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "Could not reply.");
        return;
      }
      setBody("");
      setKind("GENERAL");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-[var(--foreground)]">Add reply</h3>
      <label htmlFor="reply-kind" className="mt-3 block text-xs font-medium text-[var(--foreground)]">
        Kind
      </label>
      <select
        id="reply-kind"
        value={kind}
        onChange={(e) => setKind(e.target.value as "GENERAL" | "CONCERN")}
        className={`mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm sm:max-w-xs ${focusRingSmClass}`}
      >
        <option value="GENERAL">General</option>
        <option value="CONCERN">Concern</option>
      </select>
      <label htmlFor="reply-body" className="mt-3 block text-xs font-medium text-[var(--foreground)]">
        Message
      </label>
      <textarea
        id="reply-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        maxLength={20000}
        required
        className={`mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm ${focusRingSmClass}`}
      />
      <Button type="submit" variant="primary" size="sm" className="mt-3" disabled={busy}>
        Post reply
      </Button>
      {message ? <p className="mt-2 text-sm text-red-600">{message}</p> : null}
      <p className="mt-2 text-xs text-[var(--muted-foreground)]">Replies follow the same moderation rules as new threads.</p>
    </form>
  );
}

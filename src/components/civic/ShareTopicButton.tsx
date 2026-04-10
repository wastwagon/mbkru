"use client";

import { useCallback, useState } from "react";

type Props = {
  url: string;
  title: string;
  summary?: string | null;
  className?: string;
};

export function ShareTopicButton({ url, title, summary, className }: Props) {
  const [msg, setMsg] = useState<string | null>(null);

  const onShare = useCallback(async () => {
    setMsg(null);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: summary?.slice(0, 280) ?? title,
          url,
        });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setMsg("Link copied");
      setTimeout(() => setMsg(null), 2500);
    } catch {
      setMsg("Copy the URL from your browser bar");
    }
  }, [summary, title, url]);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => void onShare()}
        className="rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--section-light)]"
      >
        Share
      </button>
      {msg ? <span className="ml-2 text-xs text-[var(--muted-foreground)]">{msg}</span> : null}
    </div>
  );
}

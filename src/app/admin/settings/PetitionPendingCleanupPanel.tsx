"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";

export function PetitionPendingCleanupPanel() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/cleanup-petition-pending", {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as { ok?: boolean; deleted?: number; error?: string };
      if (!res.ok) {
        setMessage(data.error ?? res.statusText);
        return;
      }
      setMessage(`Removed ${data.deleted ?? 0} expired pending row(s).`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
        Petitions — expired guest confirmations
      </h2>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        When email verification is enabled, guests leave rows in{" "}
        <code className="rounded bg-[var(--muted)] px-1 py-0.5 text-xs">PetitionSignaturePending</code>{" "}
        until they confirm or the link expires. Expired rows are ignored by the app but can accumulate;
        run this occasionally or schedule{" "}
        <code className="rounded bg-[var(--muted)] px-1 py-0.5 text-xs">POST /api/cron/cleanup-petition-pending</code>{" "}
        with <code className="text-xs">CRON_SECRET</code>.
      </p>
      <div className="mt-4">
        <Button
          type="button"
          variant="secondary"
          disabled={loading}
          onClick={() => void run()}
          className="justify-center"
        >
          {loading ? "Running…" : "Delete expired pending rows now"}
        </Button>
      </div>
      {message ? (
        <p className="mt-3 text-sm text-[var(--foreground)]" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}

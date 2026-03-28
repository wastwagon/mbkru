"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/Button";

const inputClass =
  "mt-1 block w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 font-mono uppercase tracking-wide text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20";

type StatusPayload = {
  trackingCode: string;
  kind: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

function Inner() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("code")?.toUpperCase().trim() ?? "";

  const [code, setCode] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StatusPayload | null>(null);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    const c = code.trim().toUpperCase();
    if (c.length < 8) {
      setError("Enter your full tracking code.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/track/${encodeURIComponent(c)}`);
      const data = (await res.json().catch(() => ({}))) as StatusPayload & { error?: string };
      if (!res.ok) {
        setError(data.error === "Not found" ? "No report matches that code." : data.error ?? "Lookup failed.");
        return;
      }
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={lookup} className="space-y-4">
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-[var(--foreground)]">
          Tracking code
        </label>
        <input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className={inputClass}
          placeholder="e.g. ABCD2345EFGH"
          autoComplete="off"
        />
      </div>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {result ? (
        <div className="rounded-xl border border-[var(--border)] bg-white p-4 text-sm shadow-sm">
          <p className="font-mono text-[var(--foreground)]">{result.trackingCode}</p>
          <p className="mt-2 text-[var(--muted-foreground)]">
            <span className="font-medium text-[var(--foreground)]">Status:</span>{" "}
            {result.status.replace(/_/g, " ")}
          </p>
          <p className="mt-1 text-[var(--muted-foreground)]">
            <span className="font-medium text-[var(--foreground)]">Type:</span>{" "}
            {result.kind.replace(/_/g, " ")}
          </p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Last updated {new Date(result.updatedAt).toLocaleString("en-GB")}
          </p>
        </div>
      ) : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Checking…" : "Check status"}
      </Button>
    </form>
  );
}

export function TrackReportLookup() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--muted-foreground)]">Loading…</p>}>
      <Inner />
    </Suspense>
  );
}

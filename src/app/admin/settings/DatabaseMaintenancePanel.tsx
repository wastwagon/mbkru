"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";

type Step = {
  command: string;
  ok: boolean;
  stdout: string;
  stderr: string;
};

type ApiResponse = {
  ok?: boolean;
  error?: string;
  action?: string;
  steps?: Step[];
};

async function postAction(action: string): Promise<ApiResponse> {
  const res = await fetch("/api/admin/database-maintenance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action }),
  });
  const data = (await res.json()) as ApiResponse;
  if (!res.ok && !data.steps) {
    return { ok: false, error: data.error ?? res.statusText };
  }
  return data;
}

function trimOutput(s: string, max = 24_000) {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}\n\n… (truncated)`;
}

export function DatabaseMaintenancePanel() {
  const [loading, setLoading] = useState<string | null>(null);
  const [last, setLast] = useState<ApiResponse | null>(null);

  const run = async (action: string) => {
    setLoading(action);
    setLast(null);
    try {
      const result = await postAction(action);
      setLast(result);
    } catch (e) {
      setLast({ ok: false, error: e instanceof Error ? e.message : "Request failed" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
        Database — migrations &amp; seed
      </h2>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        On each deploy, the container runs{" "}
        <code className="rounded bg-[var(--muted)] px-1 py-0.5 text-xs">prisma migrate deploy</code>{" "}
        then{" "}
        <code className="rounded bg-[var(--muted)] px-1 py-0.5 text-xs">prisma db seed</code>{" "}
        (unless <code className="text-xs">SKIP_DB_SEED=1</code>). Use the buttons below if that
        failed or after fixing the database.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          variant="primary"
          disabled={loading !== null}
          onClick={() => run("migrate-deploy")}
          className="justify-center"
        >
          {loading === "migrate-deploy" ? "Running…" : "Run migrations"}
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={loading !== null}
          onClick={() => run("seed")}
          className="justify-center"
        >
          {loading === "seed" ? "Running…" : "Seed database"}
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={loading !== null}
          onClick={() => run("migrate-and-seed")}
          className="justify-center"
        >
          {loading === "migrate-and-seed" ? "Running…" : "Migrate + seed"}
        </Button>
      </div>

      {last?.error && !last.steps?.length ? (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {last.error}
        </p>
      ) : null}

      {last?.steps?.map((step, i) => (
        <div
          key={`${step.command}-${i}`}
          className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
            step.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-950"
              : "border-red-200 bg-red-50 text-red-950"
          }`}
        >
          <p className="font-mono text-xs font-semibold">{step.command}</p>
          <p className="mt-1 text-xs opacity-80">{step.ok ? "Success" : "Failed"}</p>
          {(() => {
            const combined = [step.stdout, step.stderr].filter((s) => s.trim()).join("\n");
            return combined ? (
              <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-black/5 p-3 text-xs">
                {trimOutput(combined)}
              </pre>
            ) : (
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                No output captured from the CLI (Prisma may log only in container stdout). Check Coolify → Logs
                for the app container. If public pages stay empty after a successful seed, confirm environment
                variables <code className="rounded bg-black/5 px-1">SEED_ACCOUNTABILITY_DEMO</code> and{" "}
                <code className="rounded bg-black/5 px-1">SEED_COMMUNITIES_DEMO</code> are{" "}
                <strong>not</strong> set to <code className="rounded bg-black/5 px-1">0</code> — those flags skip
                starter promises, report-card pilot, and community listings.
              </p>
            );
          })()}
        </div>
      ))}
    </div>
  );
}

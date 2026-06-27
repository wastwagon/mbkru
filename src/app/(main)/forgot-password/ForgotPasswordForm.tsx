"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { focusRingSmClass, primaryLinkClass } from "@/lib/primary-link-styles";

const inputClass = `mt-1 block w-full touch-manipulation rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)] transition-shadow focus-visible:border-[var(--primary)]/35 ${focusRingSmClass}`;

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Request failed.");
        return;
      }
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--foreground-secondary)]">
          If an account exists for <strong className="text-[var(--foreground)]">{email}</strong>, we sent a reset link.
          Check your inbox (and spam folder).
        </p>
        <Link href="/login" className={`${primaryLinkClass} text-sm font-semibold`}>
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <p className="text-sm text-[var(--foreground-secondary)]">
        Enter your member account email. We will send a reset link if the account exists.
      </p>
      <div>
        <label htmlFor="forgot-email" className="block text-sm font-medium text-[var(--foreground)]">
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={loading} className="w-full justify-center sm:w-auto">
        {loading ? "Sending…" : "Send reset link"}
      </Button>
      <p className="text-sm text-[var(--foreground-secondary)]">
        <Link href="/login" className={`${primaryLinkClass} font-semibold`}>
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

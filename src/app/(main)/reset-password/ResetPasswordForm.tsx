"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { focusRingSmClass, primaryLinkClass } from "@/lib/primary-link-styles";

const inputClass = `mt-1 block w-full touch-manipulation rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)] transition-shadow focus-visible:border-[var(--primary)]/35 ${focusRingSmClass}`;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(!token ? "Missing reset token. Request a new link." : null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Reset failed.");
        return;
      }
      setDone(true);
      router.push("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p className="text-sm text-[var(--foreground-secondary)]">
        Password updated.{" "}
        <Link href="/login" className={`${primaryLinkClass} font-semibold`}>
          Sign in
        </Link>
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="reset-password" className="block text-sm font-medium text-[var(--foreground)]">
          New password
        </label>
        <PasswordInput
          id="reset-password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="reset-confirm" className="block text-sm font-medium text-[var(--foreground)]">
          Confirm password
        </label>
        <PasswordInput
          id="reset-confirm"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
        />
      </div>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={loading || !token} className="w-full justify-center sm:w-auto">
        {loading ? "Saving…" : "Set new password"}
      </Button>
      <p className="text-sm text-[var(--foreground-secondary)]">
        <Link href="/forgot-password" className={`${primaryLinkClass} font-semibold`}>
          Request a new link
        </Link>
      </p>
    </form>
  );
}

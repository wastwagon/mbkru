"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { focusRingSmClass, primaryLinkClass } from "@/lib/primary-link-styles";

const inputClass = `mt-1 block w-full touch-manipulation rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)] transition-shadow focus-visible:border-[var(--primary)]/35 ${focusRingSmClass}`;

export function MemberRegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          displayName: displayName.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="reg-name" className="block text-sm font-medium text-[var(--foreground)]">
          Display name <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
        </label>
        <input
          id="reg-name"
          type="text"
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="reg-email" className="block text-sm font-medium text-[var(--foreground)]">
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="reg-password" className="block text-sm font-medium text-[var(--foreground)]">
          Password
        </label>
        <input
          id="reg-password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">At least 8 characters.</p>
      </div>
      <div>
        <label htmlFor="reg-confirm" className="block text-sm font-medium text-[var(--foreground)]">
          Confirm password
        </label>
        <input
          id="reg-confirm"
          type="password"
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
      <Button type="submit" disabled={loading} className="w-full justify-center sm:w-auto">
        {loading ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-sm text-[var(--muted-foreground)]">
        Already registered?{" "}
        <Link href="/login" className={`${primaryLinkClass} font-semibold`}>
          Sign in
        </Link>
      </p>
    </form>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { safePostAuthRedirectPath } from "@/lib/member/safe-post-auth-redirect";
import { primaryLinkClass } from "@/lib/primary-link-styles";

export function MemberLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const next = safePostAuthRedirectPath(nextParam, "/account");
  const registerHref =
    nextParam != null && nextParam !== ""
      ? `/register?next=${encodeURIComponent(safePostAuthRedirectPath(nextParam, "/account"))}`
      : "/register";
  const configError = searchParams.get("error") === "config";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(configError ? "Member sign-in is not configured on this server." : null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Sign-in failed.");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FormField label="Email" htmlFor="login-email">
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormField>
      <FormField label="Password" htmlFor="login-password">
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormField>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" loading={loading} loadingLabel="Signing in…" className="w-full justify-center sm:w-auto">
        Sign in
      </Button>
      <p className="text-sm text-[var(--foreground-secondary)]">
        No account?{" "}
        <Link href={registerHref} className={`${primaryLinkClass} font-semibold`}>
          Create one
        </Link>
      </p>
      <p className="text-sm text-[var(--foreground-secondary)]">
        <Link href="/forgot-password" className={`${primaryLinkClass} font-semibold`}>
          Forgot password?
        </Link>
      </p>
    </form>
  );
}

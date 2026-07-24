"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { safePostAuthRedirectPath } from "@/lib/member/safe-post-auth-redirect";
import { primaryLinkClass } from "@/lib/primary-link-styles";

type RegionRow = { id: string; name: string; slug: string };
type ConstituencyRow = { id: string; name: string; slug: string };

export function MemberRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const postAuthPath = safePostAuthRedirectPath(nextParam, "/account");
  const loginHref =
    nextParam != null && nextParam !== ""
      ? `/login?next=${encodeURIComponent(safePostAuthRedirectPath(nextParam, "/account"))}`
      : "/login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [regionId, setRegionId] = useState("");
  const [constituencyId, setConstituencyId] = useState("");
  const [regions, setRegions] = useState<RegionRow[]>([]);
  const [constituencies, setConstituencies] = useState<ConstituencyRow[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [loadingConst, setLoadingConst] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedRegionSlug = useMemo(() => regions.find((r) => r.id === regionId)?.slug ?? "", [regions, regionId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/regions");
        const j = (await res.json()) as { regions?: RegionRow[] };
        if (!cancelled && res.ok && Array.isArray(j.regions)) {
          setRegions(j.regions);
        }
      } catch {
        /* leave empty */
      } finally {
        if (!cancelled) setLoadingRegions(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedRegionSlug) {
      setConstituencies([]);
      setConstituencyId("");
      return;
    }
    let cancelled = false;
    setLoadingConst(true);
    setConstituencyId("");
    (async () => {
      try {
        const res = await fetch(`/api/regions/${encodeURIComponent(selectedRegionSlug)}/constituencies`);
        const j = (await res.json()) as { constituencies?: ConstituencyRow[] };
        if (!cancelled && res.ok && Array.isArray(j.constituencies)) {
          setConstituencies(j.constituencies);
        } else if (!cancelled) {
          setConstituencies([]);
        }
      } catch {
        if (!cancelled) setConstituencies([]);
      } finally {
        if (!cancelled) setLoadingConst(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedRegionSlug]);

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
    if (!regionId) {
      setError("Please select your region of residence.");
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
          regionId,
          constituencyId: constituencyId || "",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        return;
      }
      router.push(
        postAuthPath.includes("?")
          ? `${postAuthPath}&welcome=1`
          : `${postAuthPath}?welcome=1`,
      );
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FormField label="Display name" htmlFor="reg-name" optional>
        <Input
          id="reg-name"
          type="text"
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </FormField>
      <FormField
        label="Region of residence"
        htmlFor="reg-region"
        required
        hint={`Used for regional chat, "who's online", and local Report Card filters. You can change this later in your account.`}
      >
        <Select
          id="reg-region"
          required
          value={regionId}
          onChange={(e) => setRegionId(e.target.value)}
          disabled={loadingRegions || regions.length === 0}
        >
          <option value="">{loadingRegions ? "Loading regions…" : "Select your region"}</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Constituency" htmlFor="reg-constituency" optional>
        <Select
          id="reg-constituency"
          value={constituencyId}
          onChange={(e) => setConstituencyId(e.target.value)}
          disabled={!regionId || loadingConst || constituencies.length === 0}
        >
          <option value="">
            {!regionId
              ? "Select a region first"
              : loadingConst
                ? "Loading…"
                : constituencies.length === 0
                  ? "No constituency list loaded"
                  : "Optional — select constituency"}
          </option>
          {constituencies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Email" htmlFor="reg-email">
        <Input
          id="reg-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormField>
      <FormField label="Password" htmlFor="reg-password" hint="At least 8 characters.">
        <Input
          id="reg-password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormField>
      <FormField label="Confirm password" htmlFor="reg-confirm">
        <Input
          id="reg-confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </FormField>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        loading={loading}
        loadingLabel="Creating account…"
        disabled={loadingRegions}
        className="w-full justify-center sm:w-auto"
      >
        Create account
      </Button>
      <p className="text-sm text-[var(--foreground-secondary)]">
        Already registered?{" "}
        <Link href={loginHref} className={`${primaryLinkClass} font-semibold`}>
          Sign in
        </Link>
      </p>
    </form>
  );
}

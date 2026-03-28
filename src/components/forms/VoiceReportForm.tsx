"use client";

import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

import { FormTurnstile, isTurnstileWidgetEnabled } from "./FormTurnstile";

/** Keep in sync with `report-attachment-limits` (client bundle cannot import server-only module). */
const MAX_ATTACH_FILES = 3;
const MAX_ATTACH_BYTES = 5 * 1024 * 1024;
const ATTACH_ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

type RegionOption = { id: string; name: string };

const KINDS = [
  { value: "VOICE", label: "MBKRU Voice" },
  { value: "SITUATIONAL_ALERT", label: "Situational alert" },
  { value: "ELECTION_OBSERVATION", label: "Election observation" },
] as const;

const inputClass =
  "mt-1 block w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20";

export function VoiceReportForm({ regions }: { regions: RegionOption[] }) {
  const [hasMember, setHasMember] = useState(false);
  const [kind, setKind] = useState<string>("VOICE");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [regionId, setRegionId] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { member?: unknown }) => setHasMember(Boolean(d.member)))
      .catch(() => setHasMember(false));
  }, []);

  function validateAttachmentList(list: File[]): string | null {
    if (list.length > MAX_ATTACH_FILES) {
      return `You can attach up to ${MAX_ATTACH_FILES} files.`;
    }
    const allowed = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
    for (const f of list) {
      if (f.size > MAX_ATTACH_BYTES) {
        return "Each file must be 5 MB or smaller.";
      }
      if (!allowed.has(f.type)) {
        return "Only JPEG, PNG, WebP, and PDF files are allowed.";
      }
    }
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setUploadNote(null);
    setLoading(true);
    setTrackingCode(null);

    const fileList = fileInputRef.current?.files ? Array.from(fileInputRef.current.files) : [];
    const attachErr = validateAttachmentList(fileList);
    if (attachErr) {
      setError(attachErr);
      setLoading(false);
      return;
    }

    if (isTurnstileWidgetEnabled && !turnstileToken) {
      setError("Please complete the security check below.");
      setLoading(false);
      return;
    }

    const lat = latitude.trim() === "" ? undefined : Number(latitude);
    const lng = longitude.trim() === "" ? undefined : Number(longitude);
    if (
      (lat !== undefined || lng !== undefined) &&
      (lat === undefined ||
        lng === undefined ||
        Number.isNaN(lat) ||
        Number.isNaN(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180)
    ) {
      setError("Enter valid latitude and longitude, or leave both fields blank.");
      setLoading(false);
      return;
    }

    const payload: Record<string, unknown> = {
      kind,
      title: title.trim(),
      body: body.trim(),
      category: category.trim() || undefined,
      regionId: regionId || undefined,
      submitterEmail: submitterEmail.trim() || undefined,
      turnstileToken: turnstileToken ?? undefined,
    };
    if (lat !== undefined && lng !== undefined) {
      payload.latitude = lat;
      payload.longitude = lng;
    }

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        trackingCode?: string;
        id?: string;
        attachmentUploadToken?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Submission failed.");
        turnstileRef.current?.reset();
        setTurnstileToken(null);
        return;
      }
      if (data.trackingCode) setTrackingCode(data.trackingCode);

      if (fileList.length > 0 && data.id) {
        const fd = new FormData();
        for (const f of fileList) {
          fd.append("file", f);
        }
        if (data.attachmentUploadToken) {
          fd.append("uploadToken", data.attachmentUploadToken);
        }
        const headers: HeadersInit = {};
        if (data.attachmentUploadToken) {
          headers["X-Report-Upload-Token"] = data.attachmentUploadToken;
        }
        const up = await fetch(`/api/reports/${data.id}/attachments`, {
          method: "POST",
          credentials: "include",
          headers,
          body: fd,
        });
        const upJson = (await up.json().catch(() => ({}))) as { error?: string };
        if (!up.ok) {
          setUploadNote(
            upJson.error ??
              "Your report was saved, but uploads failed. If you are signed in, try again from this browser; otherwise contact support with your tracking code.",
          );
        }
      } else if (fileList.length > 0 && !data.attachmentUploadToken && !hasMember) {
        setUploadNote(
          "Your report was saved, but file uploads require signing in or server configuration. Use your tracking code if you need help.",
        );
      }

      setTitle("");
      setBody("");
      setCategory("");
      setRegionId("");
      setSubmitterEmail("");
      setLatitude("");
      setLongitude("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-5">
      {trackingCode ? (
        <div
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-900"
          role="status"
        >
          <p className="font-semibold">Report received</p>
          <p className="mt-1 text-sm">
            Save your tracking code:{" "}
            <span className="font-mono text-base font-bold tracking-wide">{trackingCode}</span>
          </p>
          <p className="mt-2 text-sm">
            <Link href={`/track-report?code=${encodeURIComponent(trackingCode)}`} className="underline">
              Check status
            </Link>
          </p>
        </div>
      ) : null}

      {uploadNote ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="status">
          {uploadNote}
        </p>
      ) : null}

      <div>
        <label htmlFor="kind" className="block text-sm font-medium text-[var(--foreground)]">
          Report type
        </label>
        <select
          id="kind"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className={`${inputClass} cursor-pointer`}
        >
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-[var(--foreground)]">
          Short title
        </label>
        <input
          id="title"
          required
          minLength={5}
          maxLength={300}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="Summarise your report in one line"
        />
      </div>

      <div>
        <label htmlFor="body" className="block text-sm font-medium text-[var(--foreground)]">
          What happened?
        </label>
        <textarea
          id="body"
          required
          minLength={20}
          maxLength={50000}
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={`${inputClass} resize-y min-h-[160px]`}
          placeholder="Describe facts, location, time, and who was involved. Avoid hearsay where possible."
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-[var(--foreground)]">
          Category <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
        </label>
        <input
          id="category"
          maxLength={120}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="region" className="block text-sm font-medium text-[var(--foreground)]">
          Region <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
        </label>
        <select
          id="region"
          value={regionId}
          onChange={(e) => setRegionId(e.target.value)}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="">— Select —</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lat" className="block text-sm font-medium text-[var(--foreground)]">
            Latitude <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
          </label>
          <input
            id="lat"
            inputMode="decimal"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className={inputClass}
            placeholder="e.g. 5.6037"
          />
        </div>
        <div>
          <label htmlFor="lng" className="block text-sm font-medium text-[var(--foreground)]">
            Longitude <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
          </label>
          <input
            id="lng"
            inputMode="decimal"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className={inputClass}
            placeholder="e.g. -0.1870"
          />
        </div>
      </div>

      {!hasMember ? (
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)]">
            Your email (for status updates)
          </label>
          <input
            id="email"
            type="email"
            required={!hasMember}
            value={submitterEmail}
            onChange={(e) => setSubmitterEmail(e.target.value)}
            className={inputClass}
            autoComplete="email"
          />
        </div>
      ) : (
        <p className="text-sm text-[var(--muted-foreground)]">
          Signed in — we&apos;ll use your account email for updates. You can still add an alternate email in your
          profile later.
        </p>
      )}

      <div>
        <label htmlFor="report-files" className="block text-sm font-medium text-[var(--foreground)]">
          Evidence files <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
        </label>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Up to {MAX_ATTACH_FILES} files, 5 MB each — JPEG, PNG, WebP, or PDF.
          {!hasMember ? " Anonymous uploads work when the site is configured for it; otherwise sign in to attach files." : null}
        </p>
        <input
          ref={fileInputRef}
          id="report-files"
          type="file"
          multiple
          accept={ATTACH_ACCEPT}
          className={`${inputClass} cursor-pointer file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--primary)]/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-[var(--primary)]`}
        />
      </div>

      <FormTurnstile
        ref={turnstileRef}
        action="report-submit"
        onTokenChange={setTurnstileToken}
        className="flex justify-start"
      />

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={loading || (isTurnstileWidgetEnabled && !turnstileToken)}
        size="lg"
      >
        {loading ? "Submitting…" : "Submit report"}
      </Button>
    </form>
  );
}

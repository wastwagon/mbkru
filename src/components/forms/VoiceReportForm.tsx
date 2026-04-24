"use client";

import type { TurnstileInstance } from "@marsidev/react-turnstile";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

import { getPublicPlatformPhase, platformFeatures } from "@/config/platform";
import { formatSubmissionDateTime } from "@/lib/format-submission-datetime";
import { nearestRegionSlug } from "@/lib/geo/ghana-region-centroids";
import { focusRingSmClass, primaryLinkClass } from "@/lib/primary-link-styles";
import {
  enqueueReportDraft,
  isRetryableReportSubmitResponse,
  loadReportQueue,
  type QueuedReportPayload,
  type ReportQueueItem,
  removeReportQueueItem,
} from "@/lib/client/report-submit-queue";

import { FormTurnstile, isTurnstileWidgetEnabled } from "./FormTurnstile";

const ReportMapLazy = dynamic(() => import("./VoiceReportMapPicker"), {
  ssr: false,
  loading: () => (
    <p className="mt-2 text-sm text-[var(--muted-foreground)]">Loading map…</p>
  ),
});

/** Keep in sync with `report-attachment-limits` (client bundle cannot import server-only module). */
const MAX_ATTACH_FILES = 3;
const MAX_ATTACH_BYTES = 5 * 1024 * 1024;
const ATTACH_ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

export type RegionOption = { id: string; name: string; slug: string };

const ALL_KINDS = [
  { value: "VOICE", label: "MBKRU Voice" },
  { value: "SITUATIONAL_ALERT", label: "Situational alert" },
  { value: "ELECTION_OBSERVATION", label: "Election observation" },
] as const;

const inputClass = `mt-1 block w-full touch-manipulation rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)] transition-shadow focus-visible:border-[var(--primary)]/35 ${focusRingSmClass}`;

type LocalDraftResult = "saved" | "not_saved" | "storage_full";

function formatDraftSavedAt(ts: number): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toISOString();
  }
}

export type VoiceReportFormProps = {
  regions: RegionOption[];
  /** When set with `lockKind`, submission uses this kind only. */
  defaultKind?: (typeof ALL_KINDS)[number]["value"];
  /** Hide report-type selector (e.g. situational submit page). */
  lockKind?: boolean;
  /** Optional textarea placeholder override. */
  bodyPlaceholder?: string;
  /** Lazy OSM map to set coordinates (default true). */
  enableMapPicker?: boolean;
};

export function VoiceReportForm({
  regions,
  defaultKind = "VOICE",
  lockKind = false,
  bodyPlaceholder,
  enableMapPicker = true,
}: VoiceReportFormProps) {
  const phase = getPublicPlatformPhase();
  const electionOn = platformFeatures.electionObservatory(phase);
  const kindOptions = ALL_KINDS.filter((k) => k.value !== "ELECTION_OBSERVATION" || electionOn);

  const [hasMember, setHasMember] = useState(false);
  const [kind, setKind] = useState<string>(() => {
    if (lockKind && defaultKind) return defaultKind;
    if (defaultKind && kindOptions.some((k) => k.value === defaultKind)) return defaultKind;
    return kindOptions[0]?.value ?? "VOICE";
  });
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [regionId, setRegionId] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [submitterPhone, setSubmitterPhone] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [submittedAtIso, setSubmittedAtIso] = useState<string | null>(null);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [mapSectionOpen, setMapSectionOpen] = useState(false);
  const [queueItems, setQueueItems] = useState<ReportQueueItem[]>([]);
  const [localDraftNotice, setLocalDraftNotice] = useState<string | null>(null);
  const [onlineBanner, setOnlineBanner] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const syncQueue = useCallback(() => {
    setQueueItems(loadReportQueue());
  }, []);

  useEffect(() => {
    if (lockKind && defaultKind) setKind(defaultKind);
  }, [lockKind, defaultKind]);

  useEffect(() => {
    if (lockKind) return;
    if (!electionOn && kind === "ELECTION_OBSERVATION") setKind("VOICE");
  }, [electionOn, lockKind, kind]);

  const handleMapPick = useCallback(
    (lat: number, lng: number) => {
      setLatitude(lat.toFixed(5));
      setLongitude(lng.toFixed(5));
      const slug = nearestRegionSlug(lat, lng);
      const match = regions.find((r) => r.slug === slug);
      if (match) setRegionId(match.id);
    },
    [regions],
  );

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { member?: unknown }) => setHasMember(Boolean(d.member)))
      .catch(() => setHasMember(false));
  }, []);

  useEffect(() => {
    syncQueue();
    const onOnline = () => setOnlineBanner(true);
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [syncQueue]);

  useEffect(() => {
    if (!onlineBanner) return;
    const t = window.setTimeout(() => setOnlineBanner(false), 10_000);
    return () => window.clearTimeout(t);
  }, [onlineBanner]);

  const visibleQueueItems =
    lockKind && defaultKind
      ? queueItems.filter((item) => item.payload.kind === defaultKind)
      : queueItems;

  function buildQueuePayload(): QueuedReportPayload {
    const lat = latitude.trim() === "" ? undefined : Number(latitude);
    const lng = longitude.trim() === "" ? undefined : Number(longitude);
    const base: QueuedReportPayload = {
      kind: kind as QueuedReportPayload["kind"],
      title: title.trim(),
      body: body.trim(),
      category: category.trim() || undefined,
      regionId: regionId || undefined,
      submitterEmail: submitterEmail.trim() || undefined,
      submitterPhone: submitterPhone.trim() || undefined,
    };
    if (lat !== undefined && lng !== undefined && !Number.isNaN(lat) && !Number.isNaN(lng)) {
      base.latitude = lat;
      base.longitude = lng;
    }
    return base;
  }

  function applyPayloadToForm(p: QueuedReportPayload) {
    setKind(p.kind);
    setTitle(p.title);
    setBody(p.body);
    setCategory(p.category ?? "");
    setRegionId(p.regionId ?? "");
    setSubmitterEmail(p.submitterEmail ?? "");
    setSubmitterPhone(p.submitterPhone ?? "");
    if (p.latitude != null && p.longitude != null) {
      setLatitude(String(p.latitude));
      setLongitude(String(p.longitude));
    } else {
      setLatitude("");
      setLongitude("");
    }
  }

  function clearFormFieldsAfterQueue() {
    setTitle("");
    setBody("");
    setCategory("");
    setRegionId("");
    setSubmitterEmail("");
    setSubmitterPhone("");
    setLatitude("");
    setLongitude("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  }

  function trySaveDraftLocally(): LocalDraftResult {
    const fileList = fileInputRef.current?.files ? Array.from(fileInputRef.current.files) : [];
    if (fileList.length > 0) return "not_saved";
    try {
      enqueueReportDraft(buildQueuePayload());
      syncQueue();
      clearFormFieldsAfterQueue();
      setLocalDraftNotice(
        "Your report text is saved on this device. When you’re back online, open Pending drafts below, tap Restore, complete the security check, and submit.",
      );
      return "saved";
    } catch (e) {
      if (e instanceof Error && e.message === "STORAGE_FULL") {
        setError("This browser’s storage is full — we couldn’t keep a draft. Free some space and try again.");
        return "storage_full";
      }
      setError("Could not save a draft on this device.");
      return "not_saved";
    }
  }

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

    if (!hasMember) {
      const em = submitterEmail.trim();
      const ph = submitterPhone.trim();
      if (!em && !ph) {
        setError("Provide an email or an E.164 phone number (e.g. +233201234567) for status updates.");
        setLoading(false);
        return;
      }
      if (ph && !/^\+[1-9]\d{1,14}$/.test(ph)) {
        setError("Phone must be in international format (E.164), including country code with +.");
        setLoading(false);
        return;
      }
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
    if (!hasMember) {
      const ph = submitterPhone.trim();
      if (ph) payload.submitterPhone = ph;
    }
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
        submittedAt?: string;
      };
      if (!res.ok) {
        if (fileList.length === 0 && isRetryableReportSubmitResponse(res.status)) {
          const draft = trySaveDraftLocally();
          if (draft === "saved") {
            setError(null);
            return;
          }
          if (draft === "storage_full") {
            turnstileRef.current?.reset();
            setTurnstileToken(null);
            return;
          }
        }
        if (fileList.length > 0 && isRetryableReportSubmitResponse(res.status)) {
          setError(
            data.error ??
              "We couldn’t reach the server. Connect and try again, or remove attachments to save your text on this device for later.",
          );
        } else {
          setError(data.error ?? "Submission failed.");
        }
        turnstileRef.current?.reset();
        setTurnstileToken(null);
        return;
      }
      if (data.trackingCode) {
        setTrackingCode(data.trackingCode);
        setSubmittedAtIso(data.submittedAt ?? new Date().toISOString());
      }
      syncQueue();

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
      setSubmitterPhone("");
      setLatitude("");
      setLongitude("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } catch {
      if (fileList.length === 0) {
        const draft = trySaveDraftLocally();
        if (draft === "saved") {
          setError(null);
        }
        // not_saved / storage_full: trySaveDraftLocally already set a specific error
      } else {
        setError(
          "Connection problem. Your attachments can’t be stored offline. Connect and try again, or remove files and submit text only so we can save a draft on this device.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-5">
      {onlineBanner ? (
        <p
          className="rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-3 text-sm text-[var(--foreground)]"
          role="status"
        >
          You appear to be back online. Finish a pending draft below, then complete the security check and submit.
        </p>
      ) : null}

      {localDraftNotice ? (
        <div
          className="flex flex-col gap-2 rounded-xl border border-[var(--primary)]/25 bg-[var(--section-light)] px-4 py-3 text-sm text-[var(--foreground)] sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <span>{localDraftNotice}</span>
          <button
            type="button"
            className={`shrink-0 ${primaryLinkClass}`}
            onClick={() => setLocalDraftNotice(null)}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {lockKind && queueItems.length > visibleQueueItems.length ? (
        <p className="text-xs text-[var(--muted-foreground)]">
          You have other saved drafts on this device for different report types. Open{" "}
          <Link href="/citizens-voice/submit" className={primaryLinkClass}>
            Citizens Voice submit
          </Link>{" "}
          to restore them.
        </p>
      ) : null}

      {visibleQueueItems.length > 0 ? (
        <div
          className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 shadow-sm"
          aria-label="Pending drafts on this device"
        >
          <p className="text-sm font-semibold text-[var(--foreground)]">Pending drafts (this device)</p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Restored drafts still need the security check before submit. Attachments are not stored offline.
          </p>
          <ul className="mt-3 space-y-3">
            {visibleQueueItems.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 rounded-lg border border-[var(--border)] bg-[var(--section-light)]/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--foreground)]">{item.payload.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {ALL_KINDS.find((k) => k.value === item.payload.kind)?.label ?? item.payload.kind}
                    {" · "}
                    {formatDraftSavedAt(item.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--foreground)]"
                    onClick={() => {
                      applyPayloadToForm(item.payload);
                      removeReportQueueItem(item.id);
                      syncQueue();
                      setLocalDraftNotice(null);
                    }}
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-800"
                    onClick={() => {
                      removeReportQueueItem(item.id);
                      syncQueue();
                    }}
                  >
                    Discard
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {trackingCode ? (
        <div
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-900"
          role="status"
        >
          <p className="font-semibold">
            {kind === "SITUATIONAL_ALERT" ? "Situational report received" : "Report received"}
          </p>
          <p className="mt-1 text-sm">
            Save your tracking code:{" "}
            <span className="font-mono text-base font-bold tracking-wide">{trackingCode}</span>
          </p>
          {submittedAtIso ? (
            <p className="mt-2 text-sm text-green-900/90">
              <span className="font-medium">Recorded</span>{" "}
              <time dateTime={submittedAtIso}>{formatSubmissionDateTime(submittedAtIso)}</time>
              <span className="text-green-900/80"> (server time, Ghana programme use).</span>
            </p>
          ) : null}
          <p className="mt-2 text-sm">
            <Link href={`/track-report?code=${encodeURIComponent(trackingCode)}`} className={primaryLinkClass}>
              Check status
            </Link>
          </p>
          <details className="mt-4 rounded-lg border border-green-200/80 bg-white/60 px-3 py-2 text-sm text-green-950">
            <summary
              className={`cursor-pointer rounded-sm font-medium text-green-900 outline-none marker:text-green-700 ${focusRingSmClass}`}
            >
              How we use your report
            </summary>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-green-900/90">
              <li>Staff triage submissions for moderation and follow-up; we may contact you if you left an email.</li>
              <li>Your tracking code shows status updates as the team works the queue — not a court or regulator docket.</li>
              <li>
                For formal complaints, use official channels (e.g. CHRAJ, sector regulators, or the courts) where they
                apply.
              </li>
            </ul>
          </details>
        </div>
      ) : null}

      {uploadNote ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="status">
          {uploadNote}
        </p>
      ) : null}

      {lockKind ? (
        <div className="rounded-xl border border-[var(--border)] bg-white/80 px-4 py-3 text-sm text-[var(--muted-foreground)]">
          <span className="font-medium text-[var(--foreground)]">Report type: </span>
          {ALL_KINDS.find((k) => k.value === kind)?.label ?? kind}
        </div>
      ) : (
        <div>
          <label htmlFor="kind" className="block text-sm font-medium text-[var(--foreground)]">
            Report type
          </label>
          <select
            id="kind"
            value={kindOptions.some((k) => k.value === kind) ? kind : kindOptions[0]?.value}
            onChange={(e) => setKind(e.target.value)}
            className={`${inputClass} cursor-pointer`}
          >
            {kindOptions.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {kind === "ELECTION_OBSERVATION" ? (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="note"
        >
          <p className="font-semibold">Election-period reporting</p>
          <p className="mt-1 text-amber-900/95">
            MBKRU is not the Electoral Commission or a court. This channel is for documentation and staff triage only
            — not a formal election petition, legal outcome, or official results challenge. Do not submit threats or
            knowingly false information.
          </p>
        </div>
      ) : null}

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
          placeholder={
            bodyPlaceholder ??
            "Describe facts, location, time, and who was involved. Avoid hearsay where possible."
          }
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

      {enableMapPicker ? (
        <details
          className="rounded-xl border border-[var(--border)] bg-white/60 px-4 py-3 open:pb-4"
          onToggle={(e) => setMapSectionOpen((e.target as HTMLDetailsElement).open)}
        >
          <summary
            className={`cursor-pointer rounded-sm text-sm font-medium text-[var(--foreground)] ${focusRingSmClass}`}
          >
            Map: tap or drag pin <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
          </summary>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Loads when opened. Sets latitude and longitude; suggests the nearest region using approximate regional
            centres (not exact boundaries — you can change the region above).
          </p>
          {mapSectionOpen ? (
            <ReportMapLazy latitude={latitude} longitude={longitude} onPick={handleMapPick} />
          ) : null}
        </details>
      ) : null}

      {!hasMember ? (
        <fieldset className="space-y-4 rounded-xl border border-[var(--border)] bg-white/50 px-4 py-4">
          <legend className="px-1 text-sm font-medium text-[var(--foreground)]">
            How we reach you <span className="font-normal text-[var(--muted-foreground)]">(email or phone)</span>
          </legend>
          <p className="text-xs text-[var(--muted-foreground)]">
            Provide <strong className="text-[var(--foreground)]">at least one</strong>. For SMS alerts when enabled by
            MBKRU, use international format with + and country code (E.164).
          </p>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={submitterEmail}
              onChange={(e) => setSubmitterEmail(e.target.value)}
              className={inputClass}
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="submitter-phone" className="block text-sm font-medium text-[var(--foreground)]">
              Mobile (optional)
            </label>
            <input
              id="submitter-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+233201234567"
              value={submitterPhone}
              onChange={(e) => setSubmitterPhone(e.target.value)}
              className={`${inputClass} font-mono text-sm`}
            />
          </div>
        </fieldset>
      ) : (
        <p className="text-sm text-[var(--muted-foreground)]">
          Signed in — we&apos;ll use your account email for updates. If your profile has an E.164 mobile, SMS alerts may
          be sent when the organisation enables them.
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
        className="w-full min-w-0 justify-center sm:w-auto"
      >
        {loading ? "Submitting…" : "Submit report"}
      </Button>
    </form>
  );
}

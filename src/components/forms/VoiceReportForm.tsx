"use client";

import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

import { ACCOUNTABILITY_CATALOGUE_ROUTES } from "@/config/accountability-catalogue-destinations";
import { getPublicPlatformPhase, platformFeatures } from "@/config/platform";
import { formatSubmissionDateTime } from "@/lib/format-submission-datetime";
import { nearestRegionSlug } from "@/lib/geo/ghana-region-centroids";
import { roundApproximateCoord } from "@/lib/geo/round-approximate-coord";
import { focusRingSmClass, primaryLinkClass } from "@/lib/primary-link-styles";
import {
  enqueueReportDraft,
  isRetryableReportSubmitResponse,
  loadReportQueue,
  queuedReportPayloadSchema,
  type QueuedReportPayload,
  type ReportQueueItem,
  removeReportQueueItem,
} from "@/lib/client/report-submit-queue";
import { redirectToMemberLogin } from "@/lib/client/member-login-redirect";
import { useVoiceUiLanguageId } from "@/lib/client/use-voice-ui-language";
import {
  bodyPlaceholderForKind,
  formatEvidenceHint,
  getVoiceReportFormStrings,
  kindOptionLabel,
} from "@/lib/voice-report-form-i18n";

import { FormTurnstile, isTurnstileWidgetEnabled } from "./FormTurnstile";

/** Keep in sync with `@/lib/validation/reports` createReportBodySchema. */
const LOCAL_AREA_MIN_LEN = 3;
const LOCAL_AREA_MAX_LEN = 512;

/** Keep in sync with `report-attachment-limits` (client bundle cannot import server-only module). */
const MAX_ATTACH_FILES = 3;
const MAX_ATTACH_BYTES = 5 * 1024 * 1024;
const ATTACH_ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

export type RegionOption = { id: string; name: string; slug: string };

export type MpOption = { id: string; label: string };

const ALL_KIND_VALUES = [
  "VOICE",
  "MP_PERFORMANCE",
  "GOVERNMENT_PERFORMANCE",
  "SITUATIONAL_ALERT",
  "ELECTION_OBSERVATION",
] as const;

export type VoiceReportKindValue = (typeof ALL_KIND_VALUES)[number];

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
  /** Roster MPs for MP performance — label shown as Name · party · constituency. */
  mpOptions?: MpOption[];
  /** When set with `lockKind`, submission uses this kind only. */
  defaultKind?: VoiceReportKindValue;
  /** Hide report-type selector (e.g. situational submit page). */
  lockKind?: boolean;
  /** Optional textarea placeholder override. */
  bodyPlaceholder?: string;
};

export function VoiceReportForm({
  regions,
  mpOptions = [],
  defaultKind = "VOICE",
  lockKind = false,
  bodyPlaceholder,
}: VoiceReportFormProps) {
  const phase = getPublicPlatformPhase();
  const electionOn = platformFeatures.electionObservatory(phase);
  const langId = useVoiceUiLanguageId();
  const str = useMemo(() => getVoiceReportFormStrings(langId), [langId]);
  const kindOptions = ALL_KIND_VALUES.filter((v) => v !== "ELECTION_OBSERVATION" || electionOn);

  const router = useRouter();
  const pathname = usePathname();
  const [authStatus, setAuthStatus] = useState<"loading" | "signedOut" | "signedIn">("loading");
  const [kind, setKind] = useState<string>(() => {
    if (lockKind && defaultKind) return defaultKind;
    if (defaultKind && kindOptions.some((v) => v === defaultKind)) return defaultKind;
    return kindOptions[0] ?? "VOICE";
  });
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [regionId, setRegionId] = useState("");
  const [localArea, setLocalArea] = useState("");
  /** Internal only — rounded approximate GPS; never shown as editable coordinates. */
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "ok" | "denied" | "error">("idle");
  const [approxCaptured, setApproxCaptured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [submittedAtIso, setSubmittedAtIso] = useState<string | null>(null);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const [parliamentMemberId, setParliamentMemberId] = useState("");
  const [submittedMpSlug, setSubmittedMpSlug] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [queueItems, setQueueItems] = useState<ReportQueueItem[]>([]);
  const [localDraftNotice, setLocalDraftNotice] = useState<string | null>(null);
  const [onlineBanner, setOnlineBanner] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  /** Bump when restoring a queued draft so an in-flight geolocation callback cannot overwrite it. */
  const geoGenerationRef = useRef(0);
  /** Ensures we only auto-request browser geolocation once per signed-in session on this mount. */
  const autoGeoRanRef = useRef(false);

  const parsedRoundedCoords = useMemo(() => {
    const lat = latitude.trim() === "" ? NaN : Number(latitude);
    const lng = longitude.trim() === "" ? NaN : Number(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    return { lat, lng };
  }, [latitude, longitude]);

  const resolvedBodyPlaceholder = useMemo(() => {
    if (bodyPlaceholder) return bodyPlaceholder;
    return bodyPlaceholderForKind(str, kind);
  }, [bodyPlaceholder, kind, str]);

  const locationGateOk = useMemo(
    () =>
      Boolean(regionId) &&
      localArea.trim().length >= LOCAL_AREA_MIN_LEN &&
      approxCaptured &&
      parsedRoundedCoords !== null,
    [regionId, localArea, approxCaptured, parsedRoundedCoords],
  );

  const syncQueue = useCallback(() => {
    setQueueItems(loadReportQueue());
  }, []);

  useEffect(() => {
    if (lockKind && defaultKind) setKind(defaultKind);
  }, [lockKind, defaultKind]);

  useEffect(() => {
    if (kind !== "MP_PERFORMANCE") setParliamentMemberId("");
  }, [kind]);

  useEffect(() => {
    if (lockKind) return;
    if (!electionOn && kind === "ELECTION_OBSERVATION") setKind("VOICE");
  }, [electionOn, lockKind, kind]);

  const finalizeLocationFromCoords = useCallback(
    async (lat: number, lng: number) => {
      setLatitude(String(lat));
      setLongitude(String(lng));
      const slug = nearestRegionSlug(lat, lng);
      const match = regions.find((r) => r.slug === slug) ?? regions[0];
      if (match) setRegionId(match.id);
      setApproxCaptured(true);
      const regionName = match?.name ?? "";

      let areaLabel: string | null = null;
      try {
        const res = await fetch(
          `/api/geo/reverse?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lng))}`,
          { credentials: "same-origin" },
        );
        const data = (await res.json()) as { label?: string | null };
        const raw = typeof data.label === "string" ? data.label.trim() : "";
        if (raw.length >= LOCAL_AREA_MIN_LEN) areaLabel = raw.slice(0, LOCAL_AREA_MAX_LEN);
      } catch {
        areaLabel = null;
      }

      setLocalArea(
        areaLabel ??
          `Approximate area — ${regionName || "Ghana"}`.slice(0, LOCAL_AREA_MAX_LEN),
      );
      setGeoStatus("ok");
    },
    [regions],
  );

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { member?: unknown }) => setAuthStatus(d.member ? "signedIn" : "signedOut"))
      .catch(() => setAuthStatus("signedOut"));
  }, []);

  useEffect(() => {
    if (authStatus !== "signedOut") return;
    redirectToMemberLogin(router, pathname || "/citizens-voice/submit");
  }, [authStatus, pathname, router]);

  useEffect(() => {
    if (authStatus === "signedOut") autoGeoRanRef.current = false;
  }, [authStatus]);

  /** Auto-request rounded device location once signed in — region + approximate address are filled automatically (read-only). */
  useEffect(() => {
    if (authStatus !== "signedIn") return;
    if (!regions.length) return;
    if (autoGeoRanRef.current) return;
    autoGeoRanRef.current = true;
    setGeoStatus("loading");
    setError(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("error");
      return;
    }
    const gen = ++geoGenerationRef.current;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (geoGenerationRef.current !== gen) return;
        const lat = roundApproximateCoord(pos.coords.latitude);
        const lng = roundApproximateCoord(pos.coords.longitude);
        void finalizeLocationFromCoords(lat, lng);
      },
      (err) => {
        if (geoGenerationRef.current !== gen) return;
        setGeoStatus(err.code === 1 ? "denied" : "error");
      },
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 25_000 },
    );
  }, [authStatus, regions.length, finalizeLocationFromCoords]);

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

  function applyPayloadToForm(p: QueuedReportPayload) {
    geoGenerationRef.current += 1;
    setKind(p.kind);
    setTitle(p.title);
    setBody(p.body);
    setParliamentMemberId(p.parliamentMemberId ?? "");
    setRegionId(p.regionId ?? "");
    setLocalArea(p.localArea ?? "");
    if (p.latitude != null && p.longitude != null) {
      setLatitude(String(p.latitude));
      setLongitude(String(p.longitude));
      setApproxCaptured(true);
      setGeoStatus("ok");
      if (
        p.regionId &&
        (p.localArea?.trim().length ?? 0) >= LOCAL_AREA_MIN_LEN
      ) {
        autoGeoRanRef.current = true;
      }
    } else {
      setLatitude("");
      setLongitude("");
      setApproxCaptured(false);
      setGeoStatus("idle");
    }
  }

  function clearFormFieldsAfterQueue() {
    setTitle("");
    setBody("");
    setRegionId("");
    setLocalArea("");
    setLatitude("");
    setLongitude("");
    setApproxCaptured(false);
    setGeoStatus("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setTurnstileToken(null);
    turnstileRef.current?.reset();
    setParliamentMemberId("");
  }

  function trySaveDraftLocally(): LocalDraftResult {
    const fileList = fileInputRef.current?.files ? Array.from(fileInputRef.current.files) : [];
    if (fileList.length > 0) return "not_saved";
    try {
      const raw = {
        kind: kind as QueuedReportPayload["kind"],
        title: title.trim(),
        body: body.trim(),
        regionId,
        localArea: localArea.trim(),
        latitude: parsedRoundedCoords?.lat,
        longitude: parsedRoundedCoords?.lng,
        parliamentMemberId:
          kind === "MP_PERFORMANCE" && parliamentMemberId.trim() ? parliamentMemberId.trim() : undefined,
      };
      const parsed = queuedReportPayloadSchema.safeParse(raw);
      if (!parsed.success) {
        setError(
          "To save an offline draft, wait until region and the map address line are filled automatically from location, then try again.",
        );
        return "not_saved";
      }
      enqueueReportDraft(parsed.data);
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
    setSubmittedMpSlug(null);

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

    if (authStatus !== "signedIn") {
      setLoading(false);
      redirectToMemberLogin(router, pathname || "/citizens-voice/submit");
      return;
    }

    if (!regionId) {
      setError("Select your region.");
      setLoading(false);
      return;
    }
    if (localArea.trim().length < LOCAL_AREA_MIN_LEN) {
      setError(`Your address line from the map is too short (at least ${LOCAL_AREA_MIN_LEN} characters). Reload and allow location if this persists.`);
      setLoading(false);
      return;
    }
    if (kind === "MP_PERFORMANCE") {
      if (!parliamentMemberId.trim()) {
        setError("Select the Member of Parliament this MP performance report is about.");
        setLoading(false);
        return;
      }
      if (mpOptions.length > 0 && !mpOptions.some((m) => m.id === parliamentMemberId)) {
        setError("That MP is not in the current roster — refresh the page and try again.");
        setLoading(false);
        return;
      }
    }

    if (!locationGateOk || !parsedRoundedCoords) {
      setError(
        geoStatus === "denied"
          ? "Location access is blocked. Allow location for this site in your browser (and turn on device location if applicable), then reload the page so we can fill region and address automatically."
          : geoStatus === "error"
            ? "This browser could not provide location. Try another browser or device, enable location services, then reload the page."
            : geoStatus === "loading"
              ? "Still detecting your approximate location — wait a moment or reload if this persists."
              : "Location must be captured automatically before submit. Reload the page and allow location when prompted.",
      );
      setLoading(false);
      return;
    }

    const payload: Record<string, unknown> = {
      kind,
      title: title.trim(),
      body: body.trim(),
      regionId,
      localArea: localArea.trim(),
      latitude: parsedRoundedCoords.lat,
      longitude: parsedRoundedCoords.lng,
      turnstileToken: turnstileToken ?? undefined,
      ...(kind === "MP_PERFORMANCE" && parliamentMemberId.trim()
        ? { parliamentMemberId: parliamentMemberId.trim() }
        : {}),
    };

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
        parliamentMemberSlug?: string;
      };
      if (!res.ok) {
        if (res.status === 401) {
          turnstileRef.current?.reset();
          setTurnstileToken(null);
          redirectToMemberLogin(router, pathname || "/citizens-voice/submit");
          return;
        }
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
        setSubmittedMpSlug(data.parliamentMemberSlug ?? null);
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
              "Your report was saved, but uploads failed. Try again from this browser or contact support with your tracking code.",
          );
        }
      } else if (fileList.length > 0 && !data.attachmentUploadToken) {
        setUploadNote(
          "Your report was saved, but file uploads need server configuration (attachment token). Contact support with your tracking code if this persists.",
        );
      }

      setTitle("");
      setBody("");
      setRegionId("");
      setLocalArea("");
      setLatitude("");
      setLongitude("");
      setApproxCaptured(false);
      setGeoStatus("idle");
      setParliamentMemberId("");
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
          "Connection problem. Your attachments can’t be stored offline. Connect and try again, or remove files and wait until location fields have filled automatically so we can save text on this device.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  if (authStatus === "loading") {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-[var(--border)] bg-white/80 px-6 py-10 text-center">
        <p className="text-sm text-[var(--muted-foreground)]">{str.checkingSignIn}</p>
      </div>
    );
  }

  if (authStatus === "signedOut") {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-[var(--border)] bg-white/80 px-6 py-10 text-center">
        <p className="text-sm text-[var(--muted-foreground)]">{str.redirectingSignIn}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-5">
      {onlineBanner ? (
        <p
          className="rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-3 text-sm text-[var(--foreground)]"
          role="status"
        >
          {str.onlineBanner}
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
            {str.dismiss}
          </button>
        </div>
      ) : null}

      {lockKind && queueItems.length > visibleQueueItems.length ? (
        <p className="text-xs text-[var(--muted-foreground)]">
          {str.draftsOtherTypesBefore}
          <Link href="/citizens-voice/submit" className={primaryLinkClass}>
            {str.draftsOtherTypesLink}
          </Link>
          {str.draftsOtherTypesAfter}
        </p>
      ) : null}

      {visibleQueueItems.length > 0 ? (
        <div
          className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 shadow-sm"
          aria-label={str.pendingDraftsAria}
        >
          <p className="text-sm font-semibold text-[var(--foreground)]">{str.pendingDraftsTitle}</p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">{str.pendingDraftsHint}</p>
          <ul className="mt-3 space-y-3">
            {visibleQueueItems.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 rounded-lg border border-[var(--border)] bg-[var(--section-light)]/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--foreground)]">{item.payload.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {kindOptionLabel(str, item.payload.kind)}
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
                    {str.restore}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-800"
                    onClick={() => {
                      removeReportQueueItem(item.id);
                      syncQueue();
                    }}
                  >
                    {str.discard}
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
            {kind === "SITUATIONAL_ALERT" ? str.successSituationalReceived : str.successReportReceived}
          </p>
          <p className="mt-1 text-sm">
            {str.saveTrackingCode}{" "}
            <span className="font-mono text-base font-bold tracking-wide">{trackingCode}</span>
          </p>
          {submittedAtIso ? (
            <p className="mt-2 text-sm text-green-900/90">
              <span className="font-medium">{str.recordedPrefix}</span>{" "}
              <time dateTime={submittedAtIso}>{formatSubmissionDateTime(submittedAtIso)}</time>
              <span className="text-green-900/80">{str.recordedSuffix}</span>
            </p>
          ) : null}
          <p className="mt-2 text-sm">
            <Link href={`/track-report?code=${encodeURIComponent(trackingCode)}`} className={primaryLinkClass}>
              {str.checkStatus}
            </Link>
          </p>
          {submittedMpSlug ? (
            <p className="mt-2 text-sm text-green-900/95">
              <Link href={`/promises/${encodeURIComponent(submittedMpSlug)}`} className={primaryLinkClass}>
                {str.openMpCommitmentSheet}
              </Link>
            </p>
          ) : null}
          <details className="mt-4 rounded-lg border border-green-200/80 bg-white/60 px-3 py-2 text-sm text-green-950">
            <summary
              className={`cursor-pointer rounded-sm font-medium text-green-900 outline-none marker:text-green-700 ${focusRingSmClass}`}
            >
              {str.howWeUseTitle}
            </summary>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-green-900/90">
              <li>{str.howWeUseLi1}</li>
              <li>{str.howWeUseLi2}</li>
              <li>{str.howWeUseLi3}</li>
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
          <span className="font-medium text-[var(--foreground)]">{str.reportTypeLockedPrefix} </span>
          {kindOptionLabel(str, kind)}
        </div>
      ) : (
        <div>
          <label htmlFor="kind" className="block text-sm font-medium text-[var(--foreground)]">
            {str.reportTypeLabel}
          </label>
          <select
            id="kind"
            value={kindOptions.some((v) => v === kind) ? kind : kindOptions[0]}
            onChange={(e) => setKind(e.target.value)}
            className={`${inputClass} cursor-pointer`}
          >
            {kindOptions.map((value) => (
              <option key={value} value={value}>
                {kindOptionLabel(str, value)}
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
          <p className="font-semibold">{str.electionNoteTitle}</p>
          <p className="mt-1 text-amber-900/95">{str.electionNoteBody}</p>
        </div>
      ) : null}

      {kind === "MP_PERFORMANCE" ? (
        <div
          className="rounded-xl border border-[var(--primary)]/25 bg-[var(--primary)]/5 px-4 py-3 text-sm text-[var(--foreground)]"
          role="note"
        >
          <p className="font-semibold">{str.mpNoteTitle}</p>
          <p className="mt-1 text-[var(--muted-foreground)]">{str.mpNoteBody}</p>
          <p className="mt-2 text-[var(--muted-foreground)]">
            {str.mpNoteBody2Before}
            <Link href="/promises" className={primaryLinkClass}>
              {str.mpNoteBody2Link}
            </Link>
            {str.mpNoteBody2After}
          </p>
        </div>
      ) : null}

      {kind === "MP_PERFORMANCE" && !lockKind ? (
        <div>
          <label htmlFor="parliament-member" className="block text-sm font-medium text-[var(--foreground)]">
            {str.mpLabel} <span className="text-red-600">*</span>
          </label>
          <select
            id="parliament-member"
            required
            value={parliamentMemberId}
            onChange={(e) => setParliamentMemberId(e.target.value)}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="">{str.mpPlaceholder}</option>
            {mpOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          {mpOptions.length === 0 ? (
            <p className="mt-1 text-xs text-amber-800" role="status">
              {str.mpRosterUnavailable}
            </p>
          ) : null}
        </div>
      ) : null}

      {kind === "GOVERNMENT_PERFORMANCE" ? (
        <div
          className="rounded-xl border border-[var(--primary)]/25 bg-[var(--primary)]/5 px-4 py-3 text-sm text-[var(--foreground)]"
          role="note"
        >
          <p className="font-semibold">{str.govNoteTitle}</p>
          <p className="mt-1 text-[var(--muted-foreground)]">{str.govNoteBody}</p>
          <p className="mt-2 text-[var(--muted-foreground)]">
            {str.govNoteBody2Before}
            <Link href={ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments} className={primaryLinkClass}>
              {str.govNoteBody2Link}
            </Link>
            {str.govNoteBody2After}
          </p>
        </div>
      ) : null}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-[var(--foreground)]">
          {str.shortTitle}
        </label>
        <input
          id="title"
          required
          minLength={5}
          maxLength={300}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder={str.shortTitlePlaceholder}
        />
      </div>

      <div>
        <label htmlFor="body" className="block text-sm font-medium text-[var(--foreground)]">
          {str.bodyLabel}
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
          placeholder={resolvedBodyPlaceholder}
        />
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--section-light)]/40 px-4 py-4">
        <p className="text-sm font-medium text-[var(--foreground)]">{str.locationTitle}</p>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">{str.locationHelp}</p>
        {geoStatus === "loading" ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]" role="status">
            {str.geoLoadingBanner}
          </p>
        ) : null}
        {geoStatus === "denied" ? (
          <div
            className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-3 text-xs text-amber-950"
            role="alert"
          >
            <p className="font-semibold text-amber-950">{str.geoDeniedTitle}</p>
            <p className="mt-2 text-amber-950/95">{str.geoDeniedBody}</p>
          </div>
        ) : null}
        {geoStatus === "error" ? (
          <div
            className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-3 text-xs text-amber-950"
            role="alert"
          >
            <p className="font-semibold text-amber-950">{str.geoErrorTitle}</p>
            <p className="mt-2 text-amber-950/95">{str.geoErrorBody}</p>
          </div>
        ) : null}
      </div>

      <div>
        <label htmlFor="region" className="block text-sm font-medium text-[var(--foreground)]">
          {str.regionLabel} <span className="text-red-600">*</span>
        </label>
        <select
          id="region"
          disabled
          required
          value={regionId}
          className={`${inputClass} cursor-not-allowed opacity-90`}
          aria-readonly="true"
        >
          <option value="">
            {geoStatus === "loading" ? str.regionDetecting : str.regionDash}
          </option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">{str.regionHelp}</p>
      </div>

      <div>
        <label htmlFor="local-area" className="block text-sm font-medium text-[var(--foreground)]">
          {str.localAreaLabel} <span className="text-red-600">*</span>
        </label>
        <input
          id="local-area"
          readOnly
          disabled={geoStatus !== "ok"}
          required
          minLength={LOCAL_AREA_MIN_LEN}
          maxLength={LOCAL_AREA_MAX_LEN}
          value={localArea}
          className={`${inputClass} cursor-not-allowed opacity-90`}
          placeholder={geoStatus === "loading" ? str.localAreaPlaceholderLoading : ""}
          autoComplete="off"
          aria-readonly="true"
        />
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">{str.localAreaHelp}</p>
      </div>

      <p className="text-sm text-[var(--muted-foreground)]">{str.signedInFooter}</p>

      <div>
        <label htmlFor="report-files" className="block text-sm font-medium text-[var(--foreground)]">
          {str.evidenceLabel}{" "}
          <span className="font-normal text-[var(--muted-foreground)]">{str.evidenceOptional}</span>
        </label>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          {formatEvidenceHint(str, MAX_ATTACH_FILES, 5)}
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

      {!locationGateOk ? (
        <p className="text-sm text-[var(--muted-foreground)]" role="status">
          {str.submitDisabledHint}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={
          loading ||
          (isTurnstileWidgetEnabled && !turnstileToken) ||
          !locationGateOk ||
          (kind === "MP_PERFORMANCE" && !lockKind && (!parliamentMemberId.trim() || mpOptions.length === 0))
        }
        size="lg"
        className="w-full min-w-0 justify-center sm:w-auto"
      >
        {loading ? str.submitting : str.submit}
      </Button>
    </form>
  );
}

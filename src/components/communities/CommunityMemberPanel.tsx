"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { primaryLinkClass } from "@/lib/primary-link-styles";

type MembershipRow = { state: string; role: string };
type VerificationRow = {
  id: string;
  status: "SUBMITTED" | "APPROVED" | "REJECTED";
  reviewNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

type Props = {
  communitySlug: string;
  joinPolicy: "OPEN" | "APPROVAL_REQUIRED";
  visibility?: "PUBLIC" | "MEMBERS_ONLY";
  /** When true, viewer does not see full about/posts until they are an active member (MEMBERS_ONLY). */
  restrictedDetail?: boolean;
  /** Phase 2+ member accounts (still needs MEMBER_SESSION_SECRET at runtime). */
  memberAccountsEnabled: boolean;
};

export function CommunityMemberPanel({
  communitySlug,
  joinPolicy,
  visibility = "PUBLIC",
  restrictedDetail = false,
  memberAccountsEnabled,
}: Props) {
  const router = useRouter();
  const [membership, setMembership] = useState<MembershipRow | null | undefined>(undefined);
  const [authRequired, setAuthRequired] = useState(false);
  const [misconfigured, setMisconfigured] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [postKind, setPostKind] = useState<"GENERAL" | "CONCERN" | "ANNOUNCEMENT">("GENERAL");
  const [postBody, setPostBody] = useState("");
  const [verification, setVerification] = useState<VerificationRow | null>(null);
  const [verificationBusy, setVerificationBusy] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [verificationExtraIds, setVerificationExtraIds] = useState("");
  const [verificationNote, setVerificationNote] = useState("");
  const verificationFilesRef = useRef<HTMLInputElement>(null);

  const base = `/api/communities/${encodeURIComponent(communitySlug)}`;

  const loadMembership = useCallback(async () => {
    setMessage(null);
    const res = await fetch(`${base}/membership`, { credentials: "include" });
    if (res.status === 401) {
      setMembership(null);
      setAuthRequired(true);
      return;
    }
    if (res.status === 403 || res.status === 503) {
      setMisconfigured(true);
      setMembership(null);
      return;
    }
    if (!res.ok) {
      setMembership(null);
      return;
    }
    setAuthRequired(false);
    setMisconfigured(false);
    const data = (await res.json()) as { membership: MembershipRow | null };
    setMembership(data.membership ?? null);
  }, [base]);

  const loadVerification = useCallback(async () => {
    setVerificationMessage(null);
    const res = await fetch(`${base}/verification`, { credentials: "include" });
    if (!res.ok) {
      setVerification(null);
      return;
    }
    const data = (await res.json()) as { verification: VerificationRow | null };
    setVerification(data.verification ?? null);
  }, [base]);

  const canAnnounce =
    membership?.state === "ACTIVE" &&
    (membership.role === "MODERATOR" || membership.role === "QUEEN_MOTHER_VERIFIED");

  useEffect(() => {
    if (!memberAccountsEnabled) {
      setMembership(null);
      return;
    }
    void loadMembership();
  }, [memberAccountsEnabled, loadMembership]);

  useEffect(() => {
    if (!canAnnounce && postKind === "ANNOUNCEMENT") setPostKind("GENERAL");
  }, [canAnnounce, postKind]);

  useEffect(() => {
    if (membership?.state !== "ACTIVE") {
      setVerification(null);
      return;
    }
    void loadVerification();
  }, [membership?.state, loadVerification]);

  async function onJoin() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`${base}/join`, { method: "POST", credentials: "include" });
      const data = (await res.json().catch(() => ({}))) as { error?: string; membership?: MembershipRow };
      if (!res.ok) {
        setMessage(data.error ?? "Could not join.");
        return;
      }
      if (data.membership) setMembership(data.membership);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function onLeave() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`${base}/leave`, { method: "POST", credentials: "include" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setMessage(data.error ?? "Could not leave.");
        return;
      }
      setMembership(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function onPost(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`${base}/posts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: postKind, body: postBody }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "Could not post.");
        return;
      }
      setPostBody("");
      setPostKind("GENERAL");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function onSubmitVerification(e: React.FormEvent) {
    e.preventDefault();
    setVerificationBusy(true);
    setVerificationMessage(null);
    try {
      const fileList = verificationFilesRef.current?.files;
      const extraIds = verificationExtraIds
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if ((!fileList || fileList.length === 0) && extraIds.length === 0) {
        setVerificationMessage("Add at least one file or paste existing media IDs.");
        return;
      }

      const fd = new FormData();
      if (fileList && fileList.length > 0) {
        for (const f of Array.from(fileList)) {
          fd.append("documents", f);
        }
      }
      if (extraIds.length > 0) {
        fd.set("documentMediaIds", extraIds.join(" "));
      }
      const noteTrim = verificationNote.trim();
      if (noteTrim) fd.set("note", noteTrim);

      const res = await fetch(`${base}/verification`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setVerificationMessage(data.error ?? "Could not submit verification request.");
        return;
      }
      setVerificationExtraIds("");
      setVerificationNote("");
      if (verificationFilesRef.current) verificationFilesRef.current.value = "";
      setVerificationMessage("Verification request submitted.");
      await loadVerification();
      router.refresh();
    } finally {
      setVerificationBusy(false);
    }
  }

  if (!memberAccountsEnabled) {
    return (
      <p className="mt-8 text-sm text-[var(--muted-foreground)]">
        Member sign-in is not enabled on this deployment.
      </p>
    );
  }

  if (misconfigured) {
    return (
      <p className="mt-8 text-sm text-[var(--muted-foreground)]">
        Member accounts are not fully configured (server secret). Ask the operator to set{" "}
        <span className="font-mono">MEMBER_SESSION_SECRET</span>.
      </p>
    );
  }

  if (membership === undefined) {
    return <p className="mt-8 text-sm text-[var(--muted-foreground)]">Loading…</p>;
  }

  const next = encodeURIComponent(`/communities/${communitySlug}`);

  return (
    <div className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-[var(--foreground)]">Membership</h2>

      {restrictedDetail && visibility === "MEMBERS_ONLY" ? (
        <p className="mt-3 rounded-xl bg-[var(--section-light)] p-3 text-sm text-[var(--muted-foreground)]">
          This is a <strong>members-only</strong> community. Sign in and join to read the full description and posts.
        </p>
      ) : null}

      {authRequired ? (
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">
          <Link href={`/login?next=${next}`} className={primaryLinkClass}>
            Sign in
          </Link>{" "}
          to join or post in this community.
        </p>
      ) : null}

      {!authRequired && membership === null ? (
        <div className="mt-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            {joinPolicy === "OPEN"
              ? "Join this community to post updates and concerns."
              : "Request to join — an administrator will approve your membership."}
          </p>
          <Button type="button" variant="primary" size="sm" className="mt-3" disabled={busy} onClick={() => void onJoin()}>
            {joinPolicy === "OPEN" ? "Join community" : "Request to join"}
          </Button>
        </div>
      ) : null}

      {!authRequired && membership?.state === "PENDING_JOIN" ? (
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">
          Your join request is pending admin approval.
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-3"
            disabled={busy}
            onClick={() => void onLeave()}
          >
            Cancel request
          </Button>
        </p>
      ) : null}

      {!authRequired && membership?.state === "ACTIVE" ? (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            You are a member
            {membership.role !== "MEMBER" ? ` (${membership.role.replaceAll("_", " ").toLowerCase()})` : ""}.
          </p>
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => void onLeave()}>
            Leave community
          </Button>

          <form onSubmit={(e) => void onPost(e)} className="mt-6 border-t border-[var(--border)] pt-6">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">New post</h3>
            <label htmlFor="post-kind" className="mt-3 block text-xs font-medium text-[var(--foreground)]">
              Kind
            </label>
            <select
              id="post-kind"
              value={postKind}
              onChange={(e) => setPostKind(e.target.value as typeof postKind)}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm sm:max-w-xs"
            >
              <option value="GENERAL">General</option>
              <option value="CONCERN">Concern</option>
              {canAnnounce ? <option value="ANNOUNCEMENT">Announcement</option> : null}
            </select>
            <label htmlFor="post-body" className="mt-3 block text-xs font-medium text-[var(--foreground)]">
              Message
            </label>
            <textarea
              id="post-body"
              value={postBody}
              onChange={(e) => setPostBody(e.target.value)}
              rows={4}
              maxLength={20000}
              required
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
            <Button type="submit" variant="primary" size="sm" className="mt-3" disabled={busy}>
              Submit
            </Button>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Posts may be held for moderation depending on site settings.
            </p>
          </form>

          <div className="mt-6 border-t border-[var(--border)] pt-6">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Verification</h3>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Queen Mothers and traditional authorities can request verified status. Upload supporting documents
              (photos or PDF, up to 10 files, 8 MB each). You can optionally include existing media library IDs if an
              operator uploaded files for you.
            </p>
            {verification ? (
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                Latest request:{" "}
                <strong className="text-[var(--foreground)]">{verification.status.toLowerCase()}</strong> · submitted{" "}
                {new Date(verification.createdAt).toLocaleDateString("en-GB", { dateStyle: "medium" })}
                {verification.reviewedAt
                  ? ` · reviewed ${new Date(verification.reviewedAt).toLocaleDateString("en-GB", { dateStyle: "medium" })}`
                  : ""}
              </p>
            ) : null}
            {verification?.reviewNotes ? (
              <p className="mt-2 whitespace-pre-wrap rounded-lg bg-[var(--section-light)] p-3 text-xs text-[var(--foreground)]">
                {verification.reviewNotes}
              </p>
            ) : null}

            {membership.role !== "QUEEN_MOTHER_VERIFIED" && verification?.status !== "SUBMITTED" ? (
              <form onSubmit={(e) => void onSubmitVerification(e)} className="mt-4 space-y-3">
                <div>
                  <label htmlFor="verification-files" className="block text-xs font-medium text-[var(--foreground)]">
                    Documents
                  </label>
                  <input
                    ref={verificationFilesRef}
                    id="verification-files"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                    className="mt-1 block w-full text-sm text-[var(--muted-foreground)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--section-light)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[var(--foreground)]"
                  />
                </div>
                <div>
                  <label htmlFor="verification-extra-ids" className="block text-xs font-medium text-[var(--foreground)]">
                    Existing media IDs (optional)
                  </label>
                  <textarea
                    id="verification-extra-ids"
                    value={verificationExtraIds}
                    onChange={(e) => setVerificationExtraIds(e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 font-mono text-xs"
                    placeholder="Comma or space separated, if applicable"
                  />
                </div>
                <div>
                  <label htmlFor="verification-note" className="block text-xs font-medium text-[var(--foreground)]">
                    Note (optional)
                  </label>
                  <textarea
                    id="verification-note"
                    value={verificationNote}
                    onChange={(e) => setVerificationNote(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                  />
                </div>
                <Button type="submit" variant="outline" size="sm" disabled={verificationBusy}>
                  Submit verification request
                </Button>
              </form>
            ) : null}
            {verificationMessage ? <p className="mt-3 text-sm text-[var(--muted-foreground)]">{verificationMessage}</p> : null}
          </div>
        </div>
      ) : null}

      {message ? <p className="mt-4 text-sm text-red-600">{message}</p> : null}
    </div>
  );
}

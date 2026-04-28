"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { focusRingSmClass } from "@/lib/primary-link-styles";

type Props = {
  communitySlug: string;
};

export function CommunityForumCreateForm({ communitySlug }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const payload: Record<string, string> = { name };
      const s = slug.trim();
      if (s) payload.slug = s;
      const d = description.trim();
      if (d) payload.description = d;

      const res = await fetch(`/api/communities/${encodeURIComponent(communitySlug)}/forums`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; forum?: { slug: string } };
      if (!res.ok) {
        setMessage(data.error ?? "Could not create forum.");
        return;
      }
      setName("");
      setSlug("");
      setDescription("");
      router.refresh();
      if (data.forum?.slug) {
        router.push(`/communities/${encodeURIComponent(communitySlug)}/forums/${encodeURIComponent(data.forum.slug)}`);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--section-light)]/40 p-5"
    >
      <h3 className="text-sm font-semibold text-[var(--foreground)]">Create a forum</h3>
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
        Moderators and verified traditional leaders can add a new discussion space (slug is optional — we generate one
        from the name if empty).
      </p>
      <label htmlFor="forum-name" className="mt-4 block text-xs font-medium text-[var(--foreground)]">
        Name
      </label>
      <input
        id="forum-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        minLength={2}
        maxLength={120}
        className={`mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm ${focusRingSmClass}`}
      />
      <label htmlFor="forum-slug" className="mt-3 block text-xs font-medium text-[var(--foreground)]">
        Slug (optional)
      </label>
      <input
        id="forum-slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value.toLowerCase())}
        maxLength={60}
        pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
        title="Lowercase letters, numbers, and hyphens"
        placeholder="e.g. youth-programmes"
        className={`mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 font-mono text-sm ${focusRingSmClass}`}
      />
      <label htmlFor="forum-desc" className="mt-3 block text-xs font-medium text-[var(--foreground)]">
        Description (optional)
      </label>
      <textarea
        id="forum-desc"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        maxLength={5000}
        className={`mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm ${focusRingSmClass}`}
      />
      <Button type="submit" variant="primary" size="sm" className="mt-4" disabled={busy}>
        Create forum
      </Button>
      {message ? <p className="mt-3 text-sm text-red-600">{message}</p> : null}
    </form>
  );
}

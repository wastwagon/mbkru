"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MediaUploadForm() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(data.error || "Upload failed");
        setLoading(false);
        return;
      }
      form.reset();
      setStatus("Uploaded.");
      router.refresh();
    } catch {
      setStatus("Network error");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-[var(--foreground)]">Upload image</h2>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">JPEG, PNG, WebP or GIF · max 8MB</p>
      <div className="mt-4 space-y-3">
        <input
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          required
          className="block w-full text-sm text-[var(--foreground)]"
        />
        <input
          type="text"
          name="alt"
          placeholder="Alt text (optional)"
          className="w-full rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)]"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Uploading…" : "Upload"}
        </button>
        {status ? <p className="text-sm text-[var(--muted-foreground)]">{status}</p> : null}
      </div>
    </form>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

export type PickerMedia = {
  id: string;
  filename: string;
  storagePath: string;
  mimeType: string;
  alt: string | null;
};

const IMAGE_MIME = /^image\//;

/**
 * Visual media picker modal: choose from the public library or upload a new
 * image from your computer (stored in the library, then auto-selected).
 */
export function MediaPicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (media: PickerMedia) => void;
}) {
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [items, setItems] = useState<PickerMedia[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    fetch("/api/admin/media", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("load failed"))))
      .then((data: PickerMedia[]) => setItems(data.filter((m) => IMAGE_MIME.test(m.mimeType))))
      .catch(() => setError("Could not load the media library."));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (m) => m.filename.toLowerCase().includes(q) || (m.alt ?? "").toLowerCase().includes(q),
    );
  }, [items, query]);

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/media", { method: "POST", body: fd, credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Upload failed");
        setUploading(false);
        return;
      }
      onSelect(data as PickerMedia);
      onClose();
    } catch {
      setError("Network error during upload");
    }
    setUploading(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Choose an image"
    >
      <div
        ref={dialogRef}
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
          <div className="flex gap-1" role="tablist" aria-label="Image source">
            {(["library", "upload"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                  tab === t
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--foreground-secondary)] hover:bg-[var(--muted)]"
                }`}
              >
                {t === "library" ? "Media library" : "Upload new"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close picker"
            className="rounded-full border border-[var(--border)] px-3 py-1 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)]"
          >
            Close
          </button>
        </div>

        {error ? <p className="px-5 pt-3 text-sm text-red-600">{error}</p> : null}

        {tab === "library" ? (
          <div className="flex min-h-0 flex-1 flex-col p-5">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by filename or alt text…"
              aria-label="Search media library"
              className="w-full rounded-xl border border-[var(--border)] px-4 py-2 text-sm"
            />
            <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
              {items === null ? (
                <p className="text-sm text-[var(--foreground-secondary)]">Loading library…</p>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-[var(--foreground-secondary)]">
                  No images match. Upload one from the “Upload new” tab.
                </p>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {filtered.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelect(m);
                          onClose();
                        }}
                        className="group block w-full overflow-hidden rounded-xl border border-[var(--border)] text-left focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
                      >
                        <span className="relative block aspect-[4/3] bg-[var(--section-light)]">
                          <Image
                            src={m.storagePath}
                            alt={m.alt || m.filename}
                            fill
                            className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                            sizes="200px"
                          />
                        </span>
                        <span className="block truncate px-2 py-1.5 text-xs font-medium text-[var(--foreground)]">
                          {m.filename}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={onUpload} className="space-y-3 p-5">
            <p className="text-sm text-[var(--foreground-secondary)]">
              JPEG, PNG, WebP or GIF · max 8MB. The image is saved to the media library and selected.
            </p>
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
              placeholder="Alt text (describe the photo)"
              className="w-full rounded-xl border border-[var(--border)] px-4 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={uploading}
              className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {uploading ? "Uploading…" : "Upload & select"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

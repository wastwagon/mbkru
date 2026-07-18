"use client";

import Image from "next/image";
import { useState } from "react";

import { updateCommunityCoverAction } from "@/app/admin/communities/actions";
import { MediaPicker, type PickerMedia } from "@/components/admin/MediaPicker";

type CoverMedia = {
  id: string;
  storagePath: string;
  filename: string;
  alt: string | null;
};

export function CommunityCoverEditor({
  communityId,
  initialCover,
}: {
  communityId: string;
  initialCover: CoverMedia | null;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<PickerMedia | CoverMedia | null>(initialCover);

  return (
    <section className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-5">
      <h2 className="text-sm font-semibold text-[var(--foreground)]">Cover image</h2>
      <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
        Shown on the public community browse list and detail page. Use a public library image or upload a new one.
      </p>

      {selected ? (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="relative block h-24 w-40 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--section-light)]">
            <Image
              src={selected.storagePath}
              alt={selected.alt || selected.filename}
              fill
              className="object-cover"
              sizes="160px"
            />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{selected.filename}</p>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="mt-1 text-xs font-semibold text-[var(--primary)] underline"
            >
              Choose a different image
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="mt-4 rounded-xl border border-dashed border-[var(--border)] px-4 py-8 text-sm font-medium text-[var(--foreground-secondary)] hover:border-[var(--primary)]/40 hover:text-[var(--primary)]"
        >
          Select or upload a cover image
        </button>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {selected ? (
          <form action={updateCommunityCoverAction}>
            <input type="hidden" name="communityId" value={communityId} />
            <input type="hidden" name="coverMediaId" value={selected.id} />
            <button
              type="submit"
              className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
            >
              Save cover
            </button>
          </form>
        ) : null}
        {initialCover || selected ? (
          <form action={updateCommunityCoverAction}>
            <input type="hidden" name="communityId" value={communityId} />
            <input type="hidden" name="coverMediaId" value="" />
            <button
              type="submit"
              onClick={() => setSelected(null)}
              className="rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]"
            >
              Remove cover
            </button>
          </form>
        ) : null}
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(media) => {
          setSelected(media);
          setPickerOpen(false);
        }}
      />
    </section>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";

import { MediaPicker, type PickerMedia } from "@/components/admin/MediaPicker";

export type AdminMediaFieldValue = {
  id: string;
  storagePath: string;
  filename: string;
  alt: string | null;
};

/**
 * Single public-image field for admin forms: library/upload picker, preview,
 * hidden media id input, and clear control.
 */
export function AdminMediaField({
  name,
  label,
  help,
  initial,
}: {
  name: string;
  label: string;
  help?: string;
  initial?: AdminMediaFieldValue | null;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<AdminMediaFieldValue | null>(initial ?? null);

  return (
    <div className="sm:col-span-2">
      <p className="text-xs font-medium text-[var(--foreground)]">{label}</p>
      {help ? <p className="mt-1 text-xs text-[var(--foreground-secondary)]">{help}</p> : null}
      <input type="hidden" name={name} value={selected?.id ?? ""} />

      {selected ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="relative block h-20 w-28 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--section-light)]">
            <Image
              src={selected.storagePath}
              alt={selected.alt || selected.filename}
              fill
              className="object-cover"
              sizes="112px"
            />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{selected.filename}</p>
            <div className="mt-1 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="text-xs font-semibold text-[var(--primary)] underline"
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-xs font-semibold text-[var(--foreground-secondary)] underline"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="mt-3 rounded-xl border border-dashed border-[var(--border)] px-4 py-6 text-sm font-medium text-[var(--foreground-secondary)] hover:border-[var(--primary)]/40 hover:text-[var(--primary)]"
        >
          Select or upload image
        </button>
      )}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(media: PickerMedia) => {
          setSelected({
            id: media.id,
            storagePath: media.storagePath,
            filename: media.filename,
            alt: media.alt,
          });
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

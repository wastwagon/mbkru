"use client";

import Image from "next/image";
import { useState } from "react";

import {
  addRegionSectorImageAction,
  moveRegionSectorImageAction,
  removeRegionSectorImageAction,
  updateRegionSectorImageAction,
} from "@/app/admin/regions/[id]/gallery/actions";
import { MediaPicker, type PickerMedia } from "@/components/admin/MediaPicker";

export type GalleryRow = {
  id: string;
  sectorLabel: string;
  alt: string;
  credit: string | null;
  sortOrder: number;
  media: { id: string; storagePath: string; filename: string };
};

export function RegionGalleryManager({
  regionId,
  regionName,
  rows,
  suggestedSectors,
}: {
  regionId: string;
  regionName: string;
  rows: GalleryRow[];
  suggestedSectors: string[];
}) {
  const [pickerFor, setPickerFor] = useState<"new" | string | null>(null);
  const [newMedia, setNewMedia] = useState<PickerMedia | null>(null);
  const [replacements, setReplacements] = useState<Record<string, PickerMedia>>({});

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Add a sector photo</h2>
        <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
          Pick from the media library or upload from your computer. Suggested sectors for {regionName}:{" "}
          {suggestedSectors.join(", ") || "—"}.
        </p>

        {newMedia ? (
          <form action={addRegionSectorImageAction} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="regionId" value={regionId} />
            <input type="hidden" name="mediaId" value={newMedia.id} />
            <div className="sm:col-span-2 flex items-center gap-3">
              <span className="relative block h-20 w-28 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--section-light)]">
                <Image src={newMedia.storagePath} alt={newMedia.alt || newMedia.filename} fill className="object-cover" sizes="112px" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{newMedia.filename}</p>
                <button
                  type="button"
                  onClick={() => setPickerFor("new")}
                  className="mt-1 text-xs font-semibold text-[var(--primary)] underline"
                >
                  Choose a different image
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium" htmlFor="new-sector">
                Sector label
              </label>
              <input
                id="new-sector"
                name="sectorLabel"
                required
                maxLength={80}
                list="sector-suggestions"
                placeholder="e.g. Agriculture"
                className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
              />
              <datalist id="sector-suggestions">
                {suggestedSectors.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-medium" htmlFor="new-credit">
                Credit <span className="font-normal text-[var(--foreground-secondary)]">(optional)</span>
              </label>
              <input
                id="new-credit"
                name="credit"
                maxLength={200}
                placeholder="Photographer / source"
                className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium" htmlFor="new-alt">
                Alt text (describe the photo for screen readers)
              </label>
              <input
                id="new-alt"
                name="alt"
                required
                minLength={5}
                maxLength={300}
                defaultValue={newMedia.alt ?? ""}
                className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white">
                Add to gallery
              </button>
              <button
                type="button"
                onClick={() => setNewMedia(null)}
                className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setPickerFor("new")}
            className="mt-4 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Choose image…
          </button>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Gallery ({rows.length})</h2>
        {rows.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--foreground-secondary)]">
            No CMS images yet — the public page shows the bundled sector defaults until you add photos here.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {rows.map((row, i) => {
              const replacement = replacements[row.id];
              return (
                <li key={row.id} className="rounded-2xl border border-[var(--border)] bg-white p-4">
                  <div className="flex flex-wrap items-start gap-4">
                    <span className="relative block h-24 w-32 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--section-light)]">
                      <Image
                        src={(replacement ?? row.media).storagePath}
                        alt={row.alt}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </span>
                    <form action={updateRegionSectorImageAction} className="min-w-0 flex-1 space-y-2">
                      <input type="hidden" name="id" value={row.id} />
                      {replacement ? <input type="hidden" name="mediaId" value={replacement.id} /> : null}
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          name="sectorLabel"
                          required
                          maxLength={80}
                          defaultValue={row.sectorLabel}
                          aria-label="Sector label"
                          className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                        />
                        <input
                          name="credit"
                          maxLength={200}
                          defaultValue={row.credit ?? ""}
                          placeholder="Credit (optional)"
                          aria-label="Credit"
                          className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                        />
                      </div>
                      <input
                        name="alt"
                        required
                        minLength={5}
                        maxLength={300}
                        defaultValue={row.alt}
                        aria-label="Alt text"
                        className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="submit"
                          className="rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-4 py-1.5 text-sm font-medium hover:bg-[var(--muted)]"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setPickerFor(row.id)}
                          className="rounded-xl border border-[var(--border)] px-4 py-1.5 text-sm font-medium hover:bg-[var(--muted)]"
                        >
                          {replacement ? "Image replaced — pick again?" : "Replace image…"}
                        </button>
                      </div>
                    </form>
                    <div className="flex shrink-0 flex-col gap-2">
                      <form action={moveRegionSectorImageAction}>
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button
                          type="submit"
                          disabled={i === 0}
                          aria-label={`Move ${row.sectorLabel} up`}
                          className="w-full rounded-lg border border-[var(--border)] px-3 py-1 text-sm disabled:opacity-40"
                        >
                          ↑
                        </button>
                      </form>
                      <form action={moveRegionSectorImageAction}>
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button
                          type="submit"
                          disabled={i === rows.length - 1}
                          aria-label={`Move ${row.sectorLabel} down`}
                          className="w-full rounded-lg border border-[var(--border)] px-3 py-1 text-sm disabled:opacity-40"
                        >
                          ↓
                        </button>
                      </form>
                      <form action={removeRegionSectorImageAction}>
                        <input type="hidden" name="id" value={row.id} />
                        <button
                          type="submit"
                          aria-label={`Remove ${row.sectorLabel} photo from gallery`}
                          className="w-full rounded-lg border border-red-200 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <MediaPicker
        open={pickerFor !== null}
        onClose={() => setPickerFor(null)}
        onSelect={(media) => {
          if (pickerFor === "new") setNewMedia(media);
          else if (pickerFor) setReplacements((prev) => ({ ...prev, [pickerFor]: media }));
        }}
      />
    </div>
  );
}

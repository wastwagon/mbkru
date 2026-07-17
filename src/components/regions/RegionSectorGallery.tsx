"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import type { RegionGalleryImage } from "@/lib/regions/sector-images";

/**
 * Pictorial "Key sectors" gallery on regional hub pages. Renders bundled
 * sector defaults unless the CMS provides region-specific images. Hidden
 * entirely when there is nothing to show.
 */
export function RegionSectorGallery({
  regionName,
  images,
}: {
  regionName: string;
  images: RegionGalleryImage[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) => {
      setOpenIndex((current) => {
        if (current === null) return current;
        return (current + delta + images.length) % images.length;
      });
    },
    [images.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, close, step]);

  if (images.length === 0) return null;

  const active = openIndex === null ? null : images[openIndex];

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-sm font-semibold text-[var(--foreground)]">
        Key sectors in {regionName} — in pictures
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-[var(--foreground-secondary)]">
        A visual snapshot of the economic activity behind each listed sector. Select a photo to enlarge.
      </p>

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img, i) => (
          <li key={`${img.src}-${i}`} className={i === 0 ? "col-span-2 row-span-2 sm:col-span-2" : ""}>
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              className="group relative block w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--section-light)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              aria-label={`Enlarge photo: ${img.alt}`}
            >
              <span className={`relative block ${i === 0 ? "aspect-[4/3]" : "aspect-[4/3]"}`}>
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  sizes={i === 0 ? "(min-width: 640px) 480px, 100vw" : "(min-width: 640px) 240px, 50vw"}
                />
              </span>
              <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                {img.label}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${active.label} — enlarged photo`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={close}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[3/2] bg-[var(--section-light)]">
              <Image src={active.src} alt={active.alt} fill className="object-contain" sizes="768px" />
            </div>
            <div className="flex flex-wrap items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--foreground)]">{active.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--foreground-secondary)]">{active.alt}</p>
                {active.credit ? (
                  <p className="mt-1 text-[11px] text-[var(--foreground-secondary)]/80">Photo: {active.credit}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous photo"
                  className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)]"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next photo"
                  className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)]"
                >
                  →
                </button>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={close}
                  aria-label="Close enlarged photo"
                  className="rounded-full bg-[var(--primary)] px-3 py-1.5 text-sm font-semibold text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

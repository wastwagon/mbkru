"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { resolvePromisesBrowseEmbedUrlForHomepage } from "@/config/promises-browse-embed";

/**
 * Embeds the promises browse dashboard in an iframe. Remote app must allow framing
 * (no restrictive `X-Frame-Options` / CSP `frame-ancestors`); otherwise use “Open full dashboard”.
 */
export function HomePromisesBrowseDashboard() {
  const src = resolvePromisesBrowseEmbedUrlForHomepage();
  if (!src) return null;
  let host = "";
  try {
    host = new URL(src).hostname;
  } catch {
    host = "dashboard";
  }

  return (
    <section
      id="promises-browse-dashboard"
      className="section-spacing section-full border-y border-[var(--border)] bg-white"
      aria-labelledby="promises-browse-dashboard-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">Live catalogue</p>
          <h2
            id="promises-browse-dashboard-heading"
            className="mt-2 font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl"
          >
            Promises browse dashboard
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
            Interactive view of the promise catalogue (filters and rows). Embedded from{" "}
            <span className="font-medium text-[var(--foreground)]">{host}</span> — same experience as{" "}
            <Link href="/promises/browse" className="font-medium text-[var(--primary)] hover:underline">
              /promises/browse
            </Link>{" "}
            on this site when enabled.
          </p>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            If the frame stays blank, the host may block embedding; use &quot;Open full dashboard&quot; below.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8"
        >
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--section-light)] shadow-[var(--shadow-card)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-white px-4 py-3 sm:px-5">
              <p className="text-xs font-medium text-[var(--muted-foreground)]">
                Scroll inside the frame to use filters and the table.
              </p>
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-[var(--primary)] hover:underline"
              >
                Open full dashboard →
              </a>
            </div>
            <div className="relative min-h-[min(70vh,52rem)] w-full bg-[var(--section-light)]">
              <iframe
                title="MBKRU promises browse dashboard"
                src={src}
                className="absolute inset-0 h-full min-h-[min(70vh,52rem)] w-full border-0"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="clipboard-read; clipboard-write; fullscreen"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

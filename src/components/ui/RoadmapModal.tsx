"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { mobileIconButtonClass } from "@/lib/mobile-ui-classes";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

export type RoadmapPhase = {
  period: string;
  phase?: string;
  status?: "complete" | "upcoming";
  title: string;
  description: string;
  items?: readonly string[];
  detailContent?: string;
};

type RoadmapModalProps = {
  phase: RoadmapPhase | null;
  onClose: () => void;
};

export function RoadmapModal({ phase, onClose }: RoadmapModalProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  useBodyScrollLock(Boolean(phase));

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (phase) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [phase, onClose]);

  return (
    <AnimatePresence>
      {phase && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close dialog"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="roadmap-modal-title"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: "100%" }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: "100%" }}
            transition={
              prefersReducedMotion
                ? { duration: 0.15 }
                : { type: "spring", stiffness: 420, damping: 36, mass: 0.75 }
            }
            className="fixed inset-x-0 bottom-0 z-50 max-h-[min(90dvh,calc(100dvh-env(safe-area-inset-bottom)))] overflow-y-auto overscroll-contain rounded-t-2xl border border-[var(--border)] bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl focus-visible:outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[90vh] sm:w-[calc(100%-2rem)] sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--border)] sm:hidden" aria-hidden />
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block rounded-lg bg-[var(--accent-gold)]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--accent-gold)]">
                    {phase.period}
                  </span>
                  {phase.phase && (
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        phase.status === "complete"
                          ? "bg-green-100 text-green-800"
                          : "bg-[var(--primary)]/10 text-[var(--primary)]"
                      }`}
                    >
                      {phase.phase} {phase.status === "complete" ? "— Complete" : ""}
                    </span>
                  )}
                </div>
                <h3 id="roadmap-modal-title" className="mt-3 font-display text-xl font-bold text-[var(--foreground)] sm:text-2xl">
                  {phase.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={`shrink-0 ${mobileIconButtonClass} rounded-xl text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]`}
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[var(--foreground-secondary)]">
              {phase.description}
            </p>

            {phase.detailContent && (
              <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--section-light)] p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-secondary)]">
                  Full Details
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">
                  {phase.detailContent}
                </p>
              </div>
            )}

            {phase.items && phase.items.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-secondary)]">
                  {phase.status === "complete" ? "Completed" : "Planned"} Deliverables
                </h4>
                <ul className="mt-3 space-y-2">
                  {phase.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                          phase.status === "complete" ? "bg-green-500" : "bg-[var(--primary)]"
                        }`}
                        aria-hidden
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

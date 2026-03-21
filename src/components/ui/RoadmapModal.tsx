"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (phase) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [phase, onClose]);

  return (
    <AnimatePresence>
      {phase && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="roadmap-modal-title"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-[var(--border)] bg-white p-6 shadow-xl focus-visible:outline-none sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
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
                className="shrink-0 rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
              {phase.description}
            </p>

            {phase.detailContent && (
              <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--section-light)] p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Full Details
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">
                  {phase.detailContent}
                </p>
              </div>
            )}

            {phase.items && phase.items.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
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

            <p className="mt-6 text-xs text-[var(--muted-foreground)]">
              Click outside or press Escape to close
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

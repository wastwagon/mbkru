"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { focusRingSmClass } from "@/lib/primary-link-styles";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "instant" : "smooth" });
  }

  const motionTransition = reducedMotion ? { duration: 0.01 } : { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          transition={motionTransition}
          onClick={scrollToTop}
          className={`fixed bottom-4 right-4 z-40 flex h-12 w-12 touch-manipulation items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-lg ring-1 ring-black/5 transition-[background-color,box-shadow,transform] duration-300 ease-out hover:bg-[var(--primary-dark)] hover:shadow-xl active:scale-[0.96] motion-reduce:active:scale-100 sm:bottom-8 sm:right-8 sm:h-14 sm:w-14 ${focusRingSmClass}`}
          aria-label="Back to top"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

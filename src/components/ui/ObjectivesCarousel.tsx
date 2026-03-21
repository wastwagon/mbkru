"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";

export type ObjectiveCard = {
  title: string;
  description: string;
  href: string;
};

type ObjectivesCarouselProps = {
  objectives: ObjectiveCard[];
};

const AUTO_ADVANCE_MS = 4500;
const CARDS_PER_VIEW = 2;

export function ObjectivesCarousel({ objectives }: ObjectivesCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const slideCount = Math.ceil(objectives.length / CARDS_PER_VIEW);
  const [activeSlide, setActiveSlide] = useState(0);

  const scrollToSlide = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const slideIndex = Math.max(0, Math.min(index, slideCount - 1));
      const scrollLeft = (el.scrollWidth / slideCount) * slideIndex;
      el.scrollTo({ left: scrollLeft, behavior: "smooth" });
      setActiveSlide(slideIndex);
    },
    [slideCount]
  );

  const updateActiveFromScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const slideWidth = el.scrollWidth / slideCount;
    const idx = Math.round(el.scrollLeft / slideWidth);
    setActiveSlide(Math.min(idx, slideCount - 1));
  }, [slideCount]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateActiveFromScroll);
    window.addEventListener("resize", updateActiveFromScroll);
    return () => {
      el.removeEventListener("scroll", updateActiveFromScroll);
      window.removeEventListener("resize", updateActiveFromScroll);
    };
  }, [updateActiveFromScroll]);

  useEffect(() => {
    const id = setInterval(() => {
      scrollToSlide((activeSlide + 1) % slideCount);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [activeSlide, slideCount, scrollToSlide]);

  // Build slides: each slide has up to 2 cards (wrap last slide if needed)
  const slides: ObjectiveCard[][] = [];
  for (let i = 0; i < slideCount; i++) {
    const start = i * CARDS_PER_VIEW;
    const slideCards = objectives.slice(start, start + CARDS_PER_VIEW);
    if (slideCards.length < CARDS_PER_VIEW && objectives.length > 0) {
      // Wrap: add cards from start to fill the view
      while (slideCards.length < CARDS_PER_VIEW) {
        slideCards.push(objectives[(start + slideCards.length) % objectives.length]);
      }
    }
    slides.push(slideCards);
  }

  return (
    <div className="relative">
      {/* Carousel — 2 cards visible per slide */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scroll-smooth scrollbar-hide"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {slides.map((slideCards, slideIdx) => (
          <div
            key={slideIdx}
            className="grid min-w-full grid-cols-2 items-stretch gap-3 px-0.5 sm:gap-4"
            style={{ scrollSnapAlign: "start" }}
          >
            {slideCards.map((obj) => (
              <Link
                key={`${slideIdx}-${obj.title}`}
                href={obj.href}
                className="group flex h-full min-h-0 flex-col gap-2 rounded-xl border border-[var(--border)] bg-white p-3 shadow-[var(--shadow-card)] transition-all duration-300 hover:border-[var(--accent-warm)]/30 hover:shadow-[var(--shadow-card-hover)] sm:flex-row sm:gap-3 sm:p-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-warm)]/10 text-[var(--accent-warm)] transition-colors group-hover:bg-[var(--accent-warm)]/20 sm:h-10 sm:w-10">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-xs font-semibold text-[var(--foreground)] group-hover:text-[var(--accent-warm)] sm:text-sm">
                    {obj.title}
                  </h3>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-[var(--muted-foreground)] sm:mt-1 sm:text-sm">
                    {obj.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Navigation — dots match slide count, arrows move by slide */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          {Array.from({ length: slideCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeSlide
                  ? "w-5 bg-[var(--accent-warm)]"
                  : "w-1.5 bg-[var(--border)] hover:bg-[var(--accent-warm)]/50"
              }`}
            />
          ))}
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => scrollToSlide(activeSlide - 1)}
            aria-label="Previous"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] shadow-sm transition-all hover:border-[var(--accent-warm)] hover:bg-[var(--accent-warm)]/5 disabled:opacity-40 disabled:pointer-events-none"
            disabled={activeSlide === 0}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollToSlide(activeSlide + 1)}
            aria-label="Next"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--primary)] bg-[var(--primary)] text-white shadow-sm transition-all hover:bg-[var(--primary-dark)] disabled:opacity-40 disabled:pointer-events-none"
            disabled={activeSlide >= slideCount - 1}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

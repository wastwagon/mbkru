"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { heroContent, images } from "@/lib/site-content";

const AUTO_MS = 7500;

export type HeroNewsSlide = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  image: string;
  dateLabel: string;
};

type Slide =
  | { key: "brand"; kind: "brand" }
  | { key: string; kind: "news"; post: HeroNewsSlide }
  | { key: string; kind: "placeholder"; index: 1 | 2 };

function buildSlides(news: HeroNewsSlide[]): Slide[] {
  return [
    { key: "brand", kind: "brand" },
    news[0]
      ? { key: `news-${news[0].id}`, kind: "news", post: news[0] }
      : { key: "placeholder-1", kind: "placeholder", index: 1 },
    news[1]
      ? { key: `news-${news[1].id}`, kind: "news", post: news[1] }
      : { key: "placeholder-2", kind: "placeholder", index: 2 },
  ];
}

export function HomeHeroSlider({ newsForSlides }: { newsForSlides: HeroNewsSlide[] }) {
  const slides = useMemo(() => buildSlides(newsForSlides), [newsForSlides]);
  const [active, setActive] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((i: number) => {
    const n = slides.length;
    if (i < 0) setActive(n - 1);
    else if (i >= n) setActive(0);
    else setActive(i);
  }, [slides.length]);

  useEffect(() => {
    if (reducedMotion || slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActive((a) => (a + 1) % slides.length);
    }, AUTO_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [reducedMotion, slides.length]);

  const slide = slides[active];

  return (
    <section className="relative -mt-[9.25rem] min-h-[min(55vh,40rem)] overflow-hidden pt-[9.25rem] sm:-mt-[8.75rem] sm:pt-[8.75rem] lg:-mt-[8.25rem] lg:pt-[8.25rem]">
      {/* Background layers — crossfade per slide */}
      <div className="absolute inset-0">
        {slides.map((s, i) => {
          const src = s.kind === "brand" ? images.hero : s.kind === "news" ? s.post.image : images.news;
          const alt =
            s.kind === "brand"
              ? "Community gathering — illustrative photography for the hero"
              : s.kind === "news"
                ? s.post.title
                : "News and public updates — illustrative photography";
          return (
            <div
              key={s.key}
              className={`absolute inset-0 transition-opacity duration-[900ms] ease-out ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={i !== active}
            >
              <Image src={src} alt={alt} fill className="object-cover" priority={i === 0} sizes="100vw" />
            </div>
          );
        })}
        {/* Ghana-inspired wash: green base, gold warmth, subtle red depth — keeps professional dark hero */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[color-mix(in_oklab,var(--ghana-green)_55%,black)]/95 via-[color-mix(in_oklab,var(--section-dark)_88%,var(--ghana-green))]/90 to-[color-mix(in_oklab,var(--ghana-red)_18%,var(--section-dark))]/88"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[color-mix(in_oklab,var(--ghana-green)_40%,transparent)]/90 via-transparent to-[color-mix(in_oklab,var(--ghana-red)_12%,var(--ghana-green))]/55"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[var(--ghana-gold)]/10 to-transparent" aria-hidden />
        <div className="absolute left-4 right-4 top-[8.25rem] h-px bg-gradient-to-r from-transparent via-[var(--ghana-gold)]/50 to-transparent sm:left-6 sm:right-6 lg:left-8 lg:right-8" aria-hidden />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="flex flex-col items-start">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.key}
              initial={reducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -14 }}
              transition={{ duration: reducedMotion ? 0 : 0.38 }}
              className="w-full max-w-xl rounded-2xl border border-white/25 bg-white/10 p-5 shadow-xl backdrop-blur-md sm:p-6 lg:max-w-lg"
            >
              {slide.kind === "brand" ? (
                <>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--ghana-gold)]/55 bg-[color-mix(in_oklab,var(--ghana-gold)_22%,transparent)] px-3.5 py-1 text-xs font-medium tracking-wide text-[var(--accent-gold-light)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--ghana-gold)]" />
                    MBKRU
                  </span>
                  <h1 className="mt-2 font-logo text-lg font-bold leading-[1.15] tracking-tight text-white sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-[2.75rem]">
                    {heroContent.tagline.split("President")[0]}
                    <span className="text-[var(--ghana-gold)]">President</span>
                    {heroContent.tagline.split("President")[1]}
                  </h1>
                  <p className="mt-1.5 max-w-xl text-xs font-medium leading-snug text-white/95 sm:text-sm lg:text-base">
                    {heroContent.subhead}
                  </p>
                  <p className="mt-1 text-xs font-medium text-[var(--ghana-gold)]">{heroContent.motto}</p>
                  <div className="mt-5">
                    <Link
                      href="/about"
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-white/60 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-[var(--ghana-gold)] hover:bg-white/20"
                    >
                      Learn More
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </>
              ) : slide.kind === "news" ? (
                <>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--ghana-gold)]/50 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--ghana-gold)]">
                    From the newsroom
                  </span>
                  <p className="mt-2 text-xs font-medium text-white/80">{slide.post.dateLabel}</p>
                  <h2 className="mt-1 font-display text-xl font-bold leading-snug text-white sm:text-2xl lg:text-3xl">
                    {slide.post.title}
                  </h2>
                  {slide.post.excerpt ? (
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/90">{slide.post.excerpt}</p>
                  ) : null}
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button
                      href={`/news/${slide.post.slug}`}
                      variant="primary"
                      className="inline-flex items-center gap-2 border border-white/25 bg-[var(--ghana-green)] text-white hover:bg-[color-mix(in_oklab,var(--ghana-green)_85%,black)]"
                    >
                      Read full story
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Button>
                    <Link
                      href="/news"
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-white/45 px-5 py-2.5 text-sm font-semibold text-white hover:border-[var(--ghana-gold)] hover:bg-white/10"
                    >
                      All news
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--ghana-gold)]">
                    From the newsroom
                  </span>
                  <h2 className="mt-3 font-display text-xl font-bold text-white sm:text-2xl">Latest updates</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/88">
                    New stories will appear here as soon as they are published. Browse the news archive for programme
                    updates and accountability explainers.
                  </p>
                  <div className="mt-5">
                    <Button
                      href="/news"
                      variant="primary"
                      className="inline-flex items-center gap-2 border border-white/25 bg-[var(--ghana-green)] text-white hover:bg-[color-mix(in_oklab,var(--ghana-green)_85%,black)]"
                    >
                      Go to news
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Slider controls */}
          <div className="mt-4 flex w-full max-w-xl flex-wrap items-center gap-3 lg:max-w-lg">
            <div className="flex items-center gap-2" role="tablist" aria-label="Hero highlights">
              {slides.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={s.kind === "brand" ? "Home message" : s.kind === "news" ? `News: ${s.post.title}` : "News highlight"}
                  onClick={() => go(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === active ? "w-8 bg-[var(--ghana-gold)]" : "w-2.5 bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
            <div className="ml-auto flex gap-1">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => go(active - 1)}
                className="rounded-lg border border-white/25 bg-white/10 p-2 text-white transition hover:bg-white/20"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => go(active + 1)}
                className="rounded-lg border border-white/25 bg-white/10 p-2 text-white transition hover:bg-white/20"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Impact metrics — shared across slides */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-6 w-full rounded-2xl border border-white/30 bg-[color-mix(in_oklab,white_12%,transparent)] px-4 py-4 backdrop-blur-md sm:px-6 sm:py-5"
        >
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ghana-gold)] sm:text-xs">
            At a glance
          </p>
          <div className="mt-3 flex flex-wrap items-stretch justify-center gap-6 sm:justify-between sm:gap-8 lg:gap-10">
            {[
              { value: "5", label: "Operational Pillars" },
              { value: "16", label: "Regions of Ghana" },
              { value: "100%", label: "Non-Partisan" },
              { value: "SDG 1", label: "Poverty Eradication" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex min-w-[5.5rem] flex-col items-center text-center sm:min-w-0 sm:items-start sm:text-left"
              >
                <span className="font-display text-xl font-bold tabular-nums text-white sm:text-2xl lg:text-3xl">
                  {stat.value}
                </span>
                <span className="mt-1 max-w-[10rem] text-[10px] font-medium uppercase leading-snug tracking-wide text-white/80 sm:max-w-none sm:text-xs">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

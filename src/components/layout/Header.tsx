"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { getPublicPlatformPhase, platformFeatures } from "@/config/platform";

type NavItem = { href: string; label: string };

function buildMainNav(phase: ReturnType<typeof getPublicPlatformPhase>): NavItem[] {
  const items: NavItem[] = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/citizens-voice", label: "MBKRU Voice" },
    { href: "/situational-alerts", label: "Engagement" },
    { href: "/parliament-tracker", label: "Accountability" },
  ];
  if (platformFeatures.legalEmpowermentDesk(phase)) {
    items.push({ href: "/legal-empowerment", label: "Legal desk" });
  }
  if (platformFeatures.townHallDirectory(phase)) {
    items.push({ href: "/town-halls", label: "Town halls" });
  }
  items.push({ href: "/news", label: "News & Updates" }, { href: "/diaspora", label: "Diaspora" });
  return items;
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const phase = getPublicPlatformPhase();
  const navStructure = buildMainNav(phase);
  const showMemberAuth = platformFeatures.authentication(phase);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isSticky = scrolled;
  const isHomeHero = pathname === "/" && !scrolled;

  return (
    <header
      className={`top-0 z-50 w-full transition-all duration-[400ms] ease-in-out ${
        isSticky
          ? "fixed bg-white shadow-[var(--shadow-dropdown)]"
          : isHomeHero
            ? "relative bg-[var(--section-dark)]"
            : "relative bg-white/95 backdrop-blur-sm"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl min-h-[60px] items-center justify-between gap-4 overflow-visible px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        {/* Logo — premium MBKRU icon + wordmark */}
        <Logo href="/" className="gap-2.5" theme={isHomeHero ? "dark" : "light"} />

        {/* Desktop nav — standalone menu items */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:gap-8">
          {navStructure.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-base font-medium transition-colors ${
                  isHomeHero
                    ? `hover:text-[var(--accent-gold)] ${isActive ? "text-[var(--accent-gold)] font-semibold" : "text-white/90"}`
                    : `hover:text-[var(--primary)] ${isActive ? "text-[var(--primary)] font-semibold" : "text-[var(--foreground)]"}`
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop CTA — Get in Touch */}
        <div className="hidden lg:flex lg:shrink-0 lg:items-center lg:gap-4">
          {showMemberAuth ? (
            <Link
              href="/login"
              className={`text-sm font-semibold transition-colors ${
                isHomeHero ? "text-white/90 hover:text-[var(--accent-gold)]" : "text-[var(--foreground)] hover:text-[var(--primary)]"
              }`}
            >
              Sign in
            </Link>
          ) : null}
          <Link
            href="/contact"
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md transition-all duration-[400ms] ease-in-out ${
              isHomeHero
                ? "bg-white text-[var(--section-dark)] hover:bg-white/90 hover:shadow-lg"
                : "bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] hover:shadow-lg"
            }`}
          >
            Get in Touch
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl lg:hidden ${
            isHomeHero ? "text-white hover:bg-white/10" : "text-[var(--foreground)] hover:bg-[var(--muted)]"
          }`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[var(--border)] bg-white lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {navStructure.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex min-h-[44px] items-center rounded-xl px-4 py-3 text-base font-medium transition-all hover:bg-[var(--muted)] ${
                    pathname === item.href ? "font-semibold text-[var(--primary)]" : "text-[var(--foreground)]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {showMemberAuth ? (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[44px] items-center rounded-xl px-4 py-3 text-base font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
                >
                  Sign in
                </Link>
              ) : null}
              <div className="pt-4">
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[48px] items-center justify-center rounded-xl bg-[var(--primary)] px-6 font-semibold text-white"
                >
                  Get in Touch
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { getPublicPlatformPhase, platformFeatures } from "@/config/platform";
import { useMemberMe } from "@/hooks/useMemberMe";

type NavItem = { href: string; label: string };

function UserMenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function ChevronDownIcon({ className, open }: { className?: string; open?: boolean }) {
  return (
    <svg
      className={`${className ?? ""} shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

const accountMenuItemClass =
  "flex min-h-[40px] w-full items-center px-4 py-2.5 text-left text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] focus-visible:bg-[var(--muted)] focus-visible:outline-none";

function MemberAuthNav({
  isHomeHero,
  pathname,
  variant,
  onNavigate,
}: {
  isHomeHero: boolean;
  pathname: string;
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { member, setMember } = useMemberMe(true, pathname);

  const phase = getPublicPlatformPhase();
  const showMyReports = platformFeatures.citizensVoicePlatform(phase);

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  async function signOut() {
    setMenuOpen(false);
    onNavigate?.();
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      /* still clear local UI */
    }
    setMember(null);
    router.push("/");
    router.refresh();
  }

  const signedIn = member != null;
  const href = signedIn ? "/account" : "/login";
  const label =
    signedIn && member
      ? member.displayName?.trim() || member.email.split("@")[0] || "Account"
      : "Sign in";
  const busy = member === undefined;

  const active =
    (!signedIn && (pathname === "/login" || pathname === "/register")) ||
    (signedIn && pathname.startsWith("/account"));

  const tone = isHomeHero
    ? active
      ? "text-[var(--accent-gold)]"
      : "text-white/90 hover:text-[var(--accent-gold)]"
    : active
      ? "text-[var(--primary)]"
      : "text-[var(--foreground)] hover:text-[var(--primary)]";

  if (variant === "desktop") {
    if (!signedIn) {
      return (
        <Link
          href={href}
          className={`inline-flex max-w-[200px] items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold transition-colors ${tone} ${busy ? "opacity-80" : ""}`}
          aria-busy={busy}
          aria-label="Sign in"
        >
          <UserMenuIcon className="h-5 w-5 shrink-0" />
          <span className="truncate">{label}</span>
        </Link>
      );
    }

    return (
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className={`inline-flex max-w-[220px] items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold transition-colors ${tone} ${busy ? "opacity-80" : ""}`}
          aria-busy={busy}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label={`Account menu: ${label}`}
        >
          <UserMenuIcon className="h-5 w-5 shrink-0" />
          <span className="truncate">{label}</span>
          <ChevronDownIcon open={menuOpen} className={isHomeHero ? "opacity-90" : ""} />
        </button>
        {menuOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-[60] mt-2 min-w-[220px] rounded-xl border border-[var(--border)] bg-white py-1 shadow-[var(--shadow-dropdown)]"
          >
            <Link
              role="menuitem"
              href="/account"
              className={accountMenuItemClass}
              onClick={() => setMenuOpen(false)}
            >
              Account overview
            </Link>
            {showMyReports ? (
              <Link
                role="menuitem"
                href="/account/reports"
                className={accountMenuItemClass}
                onClick={() => setMenuOpen(false)}
              >
                My reports
              </Link>
            ) : null}
            <button type="button" role="menuitem" className={accountMenuItemClass} onClick={() => void signOut()}>
              Sign out
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  if (!signedIn) {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className={`flex min-h-[44px] items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all hover:bg-[var(--muted)] ${
          active ? "font-semibold text-[var(--primary)]" : "text-[var(--foreground)]"
        } ${busy ? "opacity-80" : ""}`}
        aria-busy={busy}
      >
        <UserMenuIcon className="h-5 w-5 shrink-0" />
        {label}
      </Link>
    );
  }

  return (
    <div className="space-y-0 border-t border-[var(--border)] pt-2">
      <p className="px-4 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
        Account
      </p>
      <Link
        href="/account"
        onClick={onNavigate}
        className={`flex min-h-[44px] items-center rounded-xl px-4 py-3 text-base font-medium transition-all hover:bg-[var(--muted)] ${
          pathname === "/account" ? "font-semibold text-[var(--primary)]" : "text-[var(--foreground)]"
        }`}
      >
        Overview
      </Link>
      {showMyReports ? (
        <Link
          href="/account/reports"
          onClick={onNavigate}
          className={`flex min-h-[44px] items-center rounded-xl px-4 py-3 text-base font-medium transition-all hover:bg-[var(--muted)] ${
            pathname.startsWith("/account/reports") ? "font-semibold text-[var(--primary)]" : "text-[var(--foreground)]"
          }`}
        >
          My reports
        </Link>
      ) : null}
      <button
        type="button"
        onClick={() => void signOut()}
        className="flex min-h-[44px] w-full items-center rounded-xl px-4 py-3 text-left text-base font-medium text-[var(--foreground)] transition-all hover:bg-[var(--muted)]"
      >
        Sign out
      </button>
    </div>
  );
}

function buildMainNav(phase: ReturnType<typeof getPublicPlatformPhase>): NavItem[] {
  const items: NavItem[] = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/citizens-voice", label: "Voice" },
    { href: "/situational-alerts", label: "Engagement" },
    { href: "/parliament-tracker", label: "Accountability" },
  ];
  if (platformFeatures.legalEmpowermentDesk(phase)) {
    items.push({ href: "/legal-empowerment", label: "Legal" });
  }
  if (platformFeatures.townHallDirectory(phase)) {
    items.push({ href: "/town-halls", label: "Forums" });
  }
  items.push({ href: "/news", label: "News" }, { href: "/diaspora", label: "Diaspora" });
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
            <MemberAuthNav isHomeHero={isHomeHero} pathname={pathname} variant="desktop" />
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
                <MemberAuthNav
                  isHomeHero={false}
                  pathname={pathname}
                  variant="mobile"
                  onNavigate={() => setMobileMenuOpen(false)}
                />
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

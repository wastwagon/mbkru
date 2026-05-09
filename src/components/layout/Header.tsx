"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback, type FocusEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { getPublicPlatformPhase, platformFeatures } from "@/config/platform";
import {
  getAccountabilityNavLinks,
  getDiscoverNavLinks,
  getGuidanceNavLinks,
  getParticipateNavLinks,
  type PublicNavLink,
} from "@/config/public-platform-nav";
import { useMemberMe } from "@/hooks/useMemberMe";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { AccessibilityMenuIcon } from "@/components/ui/AccessibilityMenuIcon";
import { openAccessibilityTools } from "@/lib/a11y-voice-dispatch";
import { focusRingSmClass } from "@/lib/primary-link-styles";
import { publicNavLeafIsActive } from "@/lib/public-nav-active";

type NavLeaf = PublicNavLink;

type NavEntry =
  | { kind: "link"; leaf: NavLeaf }
  | { kind: "group"; id: string; label: string; items: NavLeaf[] };

function leafIsActive(pathname: string, searchParams: URLSearchParams, leaf: NavLeaf): boolean {
  return publicNavLeafIsActive(pathname, searchParams, leaf);
}

function groupIsActive(pathname: string, searchParams: URLSearchParams, items: NavLeaf[]): boolean {
  return items.some((item) => leafIsActive(pathname, searchParams, item));
}

function headerA11yButtonClass(isHomeHero: boolean) {
  const base = `inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 transition ${focusRingSmClass} touch-manipulation `;
  return isHomeHero
    ? `${base} border-white/50 bg-white/10 text-white hover:bg-white/20`
    : `${base} border-[var(--primary)]/35 bg-[var(--primary)]/10 text-[var(--section-dark)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/[0.12]`;
}

function buildMainNav(phase: ReturnType<typeof getPublicPlatformPhase>): NavEntry[] {
  const entries: NavEntry[] = [
    { kind: "link", leaf: { href: "/", label: "Home" } },
    { kind: "link", leaf: { href: "/about", label: "About" } },
  ];

  const participate = getParticipateNavLinks(phase) as PublicNavLink[];
  entries.push({ kind: "group", id: "participate", label: "Participate", items: participate });

  const accountability = getAccountabilityNavLinks(phase) as PublicNavLink[];
  if (accountability.length === 1) {
    entries.push({ kind: "link", leaf: accountability[0] });
  } else {
    entries.push({ kind: "group", id: "accountability", label: "Accountability", items: accountability });
  }

  const guidance = getGuidanceNavLinks(phase) as PublicNavLink[];
  if (guidance.length === 1) {
    entries.push({ kind: "link", leaf: guidance[0] });
  } else if (guidance.length > 1) {
    entries.push({ kind: "group", id: "guidance", label: "Guidance", items: guidance });
  }

  entries.push({
    kind: "group",
    id: "updates",
    label: "News & resources",
    items: getDiscoverNavLinks(phase) as PublicNavLink[],
  });

  return entries;
}

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

const dropdownItemClass =
  "flex min-h-[40px] items-center px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--section-light)] focus-visible:bg-[var(--section-light)] focus-visible:outline-none";

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
            className="absolute right-0 top-full z-[60] min-w-[220px] -mt-px rounded-xl border border-[var(--border)] bg-white pb-1 pt-[calc(0.5rem+1px)] shadow-[var(--shadow-dropdown)]"
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

function desktopLinkClass(isHomeHero: boolean, active: boolean): string {
  if (isHomeHero) {
    return active
      ? "text-[var(--accent-gold)] font-semibold"
      : "text-white/90 hover:text-[var(--accent-gold)]";
  }
  return active ? "text-[var(--primary)] font-semibold" : "text-[var(--foreground)] hover:text-[var(--primary)]";
}

function DesktopNavDropdown({
  entry,
  pathname,
  searchParams,
  isHomeHero,
  open,
  onOpen,
  onClose,
  onCancelDelayedFlyoutClose,
}: {
  entry: Extract<NavEntry, { kind: "group" }>;
  pathname: string;
  searchParams: URLSearchParams;
  isHomeHero: boolean;
  open: boolean;
  onOpen: () => void;
  /** Immediate close: outside click, Escape, blur leaving the flyout. */
  onClose: () => void;
  /** Clears the header’s delayed flyout close (scheduled when the pointer leaves the whole desktop nav cluster). */
  onCancelDelayedFlyoutClose: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const active = groupIsActive(pathname, searchParams, entry.items);

  const handleEnter = useCallback(() => {
    onCancelDelayedFlyoutClose();
    onOpen();
  }, [onCancelDelayedFlyoutClose, onOpen]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  function handleContainerBlur(e: FocusEvent<HTMLDivElement>) {
    const next = e.relatedTarget as Node | null;
    if (next && wrapRef.current?.contains(next)) return;
    requestAnimationFrame(() => {
      if (wrapRef.current?.contains(document.activeElement)) return;
      onClose();
    });
  }

  const btnClass = `inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-base font-medium transition-colors touch-manipulation ${desktopLinkClass(isHomeHero, active)}`;

  return (
    <div
      className="relative inline-flex shrink-0 flex-col items-start"
      ref={wrapRef}
      onMouseEnter={handleEnter}
      onBlur={handleContainerBlur}
    >
      <button
        type="button"
        className={btnClass}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={`nav-menu-${entry.id}`}
        id={`nav-trigger-${entry.id}`}
        onFocus={handleEnter}
        onClick={() => (open ? onClose() : onOpen())}
      >
        {entry.label}
        <ChevronDownIcon open={open} className={isHomeHero ? "opacity-90" : ""} />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-[60] min-w-[min(100vw-2rem,16rem)] max-w-[calc(100vw-2rem)] -mt-px pt-[calc(0.375rem+1px)]">
          <div
            role="menu"
            id={`nav-menu-${entry.id}`}
            aria-labelledby={`nav-trigger-${entry.id}`}
            className="w-full min-w-0 rounded-xl border border-[var(--border)] bg-white py-1 shadow-[var(--shadow-dropdown)]"
          >
            {entry.items.map((item) => {
              const isItemActive = leafIsActive(pathname, searchParams, item);
              return (
                <Link
                  key={`${item.label}-${item.href}`}
                  role="menuitem"
                  href={item.href}
                  className={`${dropdownItemClass} ${isItemActive ? "bg-[var(--section-light)] font-semibold text-[var(--primary)]" : ""}`}
                  onClick={onClose}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedId, setMobileExpandedId] = useState<string | null>(null);
  const [desktopOpenId, setDesktopOpenId] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const phase = getPublicPlatformPhase();
  const navStructure = buildMainNav(phase);
  const showMemberAuth = platformFeatures.authentication(phase);
  const prefersReducedMotion = usePrefersReducedMotion();

  const desktopFlyoutLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelDesktopFlyoutLeaveTimer = useCallback(() => {
    if (desktopFlyoutLeaveTimerRef.current) {
      clearTimeout(desktopFlyoutLeaveTimerRef.current);
      desktopFlyoutLeaveTimerRef.current = null;
    }
  }, []);

  const closeDesktopMenus = useCallback(() => {
    cancelDesktopFlyoutLeaveTimer();
    setDesktopOpenId(null);
  }, [cancelDesktopFlyoutLeaveTimer]);

  const scheduleDesktopFlyoutClose = useCallback(() => {
    cancelDesktopFlyoutLeaveTimer();
    desktopFlyoutLeaveTimerRef.current = setTimeout(() => {
      desktopFlyoutLeaveTimerRef.current = null;
      setDesktopOpenId(null);
    }, 220);
  }, [cancelDesktopFlyoutLeaveTimer]);

  useEffect(() => () => cancelDesktopFlyoutLeaveTimer(), [cancelDesktopFlyoutLeaveTimer]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHomeHero = pathname === "/" && !scrolled;
  const useLightChrome = pathname !== "/" || scrolled;

  return (
    <header
      className={`relative w-full transition-[background-color,box-shadow,backdrop-filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        useLightChrome
          ? "bg-white/95 shadow-[var(--shadow-md)] backdrop-blur-md supports-[backdrop-filter]:bg-white/80"
          : "bg-[var(--section-dark)] shadow-none backdrop-blur-none"
      }`}
    >
      <nav className="relative z-50 mx-auto flex max-w-7xl min-h-[60px] items-center justify-between gap-4 overflow-visible px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <Logo href="/" className="gap-2.5" theme={isHomeHero ? "dark" : "light"} />

        <div
          className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:gap-1 lg:flex"
          onMouseEnter={cancelDesktopFlyoutLeaveTimer}
          onMouseLeave={scheduleDesktopFlyoutClose}
        >
          {navStructure.map((entry) => {
            if (entry.kind === "link") {
              const active = leafIsActive(pathname, searchParams, entry.leaf);
              return (
                <Link
                  key={entry.leaf.href}
                  href={entry.leaf.href}
                  className={`shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors xl:text-base touch-manipulation ${desktopLinkClass(isHomeHero, active)}`}
                >
                  {entry.leaf.label}
                </Link>
              );
            }
            return (
              <DesktopNavDropdown
                key={entry.id}
                entry={entry}
                pathname={pathname}
                searchParams={searchParams}
                isHomeHero={isHomeHero}
                open={desktopOpenId === entry.id}
                onOpen={() => setDesktopOpenId(entry.id)}
                onClose={closeDesktopMenus}
                onCancelDelayedFlyoutClose={cancelDesktopFlyoutLeaveTimer}
              />
            );
          })}
        </div>

        <div className="hidden shrink-0 items-center gap-2.5 lg:flex xl:gap-3">
          {showMemberAuth ? (
            <MemberAuthNav isHomeHero={isHomeHero} pathname={pathname} variant="desktop" />
          ) : null}
          <button
            type="button"
            data-mbkru-a11y-trigger
            onClick={() => openAccessibilityTools()}
            className={headerA11yButtonClass(isHomeHero)}
            title="Accessibility and voice tools"
            aria-label="Open accessibility and voice tools"
          >
            <AccessibilityMenuIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 lg:ml-0">
          <button
            type="button"
            data-mbkru-a11y-trigger
            onClick={() => openAccessibilityTools()}
            className={`${headerA11yButtonClass(isHomeHero)} lg:hidden`}
            title="Accessibility and voice tools"
            aria-label="Open accessibility and voice tools"
          >
            <AccessibilityMenuIcon className="h-6 w-6" />
          </button>
          <button
            type="button"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl touch-manipulation lg:hidden ${
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
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen ? (
          <>
            <motion.button
              key="mobile-nav-backdrop"
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.01 : 0.24 }}
              className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[3px] lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              key="mobile-nav-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0.15 }
                  : { type: "spring", stiffness: 460, damping: 34, mass: 0.62 }
              }
              className="relative z-50 overflow-hidden border-t border-[var(--border)] bg-white shadow-[var(--shadow-lg)] lg:hidden"
            >
            <div className="max-h-[min(72vh,calc(100dvh-6rem))] space-y-0 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4">
              {navStructure.map((entry) => {
                if (entry.kind === "link") {
                  const active = leafIsActive(pathname, searchParams, entry.leaf);
                  return (
                    <Link
                      key={entry.leaf.href}
                      href={entry.leaf.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex min-h-[48px] items-center rounded-xl px-4 py-3 text-base font-medium transition-all hover:bg-[var(--muted)] touch-manipulation ${
                        active ? "font-semibold text-[var(--primary)]" : "text-[var(--foreground)]"
                      }`}
                    >
                      {entry.leaf.label}
                    </Link>
                  );
                }
                const expanded = mobileExpandedId === entry.id;
                const gActive = groupIsActive(pathname, searchParams, entry.items);
                return (
                  <div key={entry.id} className="rounded-xl">
                    <button
                      type="button"
                      className={`flex min-h-[48px] w-full items-center justify-between gap-2 rounded-xl px-4 py-3 text-left text-base font-medium transition-all hover:bg-[var(--muted)] touch-manipulation ${
                        gActive ? "text-[var(--primary)]" : "text-[var(--foreground)]"
                      }`}
                      aria-expanded={expanded}
                      onClick={() => setMobileExpandedId((id) => (id === entry.id ? null : entry.id))}
                    >
                      <span className={gActive ? "font-semibold" : ""}>{entry.label}</span>
                      <ChevronDownIcon open={expanded} />
                    </button>
                    <AnimatePresence initial={false}>
                      {expanded ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: prefersReducedMotion ? 0.01 : 0.22 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-0 border-l-2 border-[var(--border)] pb-2 pl-3 ml-3">
                            {entry.items.map((item) => {
                              const active = leafIsActive(pathname, searchParams, item);
                              return (
                                <Link
                                  key={`${item.label}-${item.href}`}
                                  href={item.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={`flex min-h-[44px] items-center rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors hover:bg-[var(--muted)] touch-manipulation ${
                                    active ? "font-semibold text-[var(--primary)]" : "text-[var(--foreground)]"
                                  }`}
                                >
                                  {item.label}
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
              {showMemberAuth ? (
                <MemberAuthNav
                  isHomeHero={false}
                  pathname={pathname}
                  variant="mobile"
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              ) : null}
              <div className="sticky bottom-0 border-t border-[var(--border)]/60 bg-white pt-3 pb-1">
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[48px] items-center justify-center rounded-xl border-2 border-[var(--primary)]/25 bg-white px-6 text-sm font-semibold text-[var(--primary)] touch-manipulation"
                >
                  Contact
                </Link>
                <p className="mt-2 text-center text-[11px] text-[var(--muted-foreground)]">
                  Or use <strong>Get in touch</strong> in the gold top bar
                </p>
              </div>
            </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

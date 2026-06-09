"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { getPublicPlatformPhase, platformFeatures } from "@/config/platform";
import { getMobileBottomNavLinks } from "@/config/public-platform-nav";
import {
  MBKRU_VOICE_OPEN_CHANGE_EVENT,
  openVoiceChat,
} from "@/lib/a11y-voice-dispatch";
import { focusRingSmClass } from "@/lib/primary-link-styles";

function NavIcon({ name }: { name: "home" | "voice" | "tracker" | "communities" | "account" }) {
  const cls = "h-5 w-5";
  switch (name) {
    case "home":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case "voice":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      );
    case "tracker":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case "communities":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "account":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
  }
}

function isActive(pathname: string, href: string, activePrefix?: string) {
  if (href === "/") return pathname === "/";
  if (activePrefix) return pathname === activePrefix || pathname.startsWith(`${activePrefix}/`);
  return pathname === href || pathname.startsWith(`${href}/`);
}

const tabClass = (active: boolean) =>
  `flex min-h-11 w-full flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[10px] font-semibold leading-none touch-manipulation transition-colors ${focusRingSmClass} ${
    active ? "text-[var(--primary)]" : "text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
  }`;

/** Native-style bottom tab bar — primary destinations on small screens. */
export function MobileBottomNav() {
  const pathname = usePathname() ?? "/";
  const phase = getPublicPlatformPhase();
  const memberAuth = platformFeatures.authentication(phase);
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);

  const links = getMobileBottomNavLinks(phase).map((item) =>
    item.icon === "account" && !memberAuth ? { ...item, href: "/login", label: "Sign in" } : item,
  );

  useEffect(() => {
    function onVoiceOpenChange(event: Event) {
      const open = (event as CustomEvent<{ open?: boolean }>).detail?.open ?? false;
      setVoiceChatOpen(open);
    }
    window.addEventListener(MBKRU_VOICE_OPEN_CHANGE_EVENT, onVoiceOpenChange);
    return () => window.removeEventListener(MBKRU_VOICE_OPEN_CHANGE_EVENT, onVoiceOpenChange);
  }, []);

  if (links.length === 0) return null;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-[var(--border)] bg-white/95 pb-[max(0.25rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgb(0_0_0_/0.08)] backdrop-blur-md supports-[backdrop-filter]:bg-white/85 lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around gap-0.5 px-1 pt-1">
        {links.map((item) => {
          const routeActive = isActive(pathname, item.href, item.activeWhenPathStartsWith);
          const active = item.opensVoiceChat ? voiceChatOpen || routeActive : routeActive;

          if (item.opensVoiceChat) {
            return (
              <li key={item.href} className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => openVoiceChat()}
                  className={tabClass(active)}
                  aria-current={active ? "page" : undefined}
                  aria-label="Open MBKRU Voice chat"
                >
                  <NavIcon name={item.icon} />
                  <span className="max-w-full truncate">{item.label}</span>
                </button>
              </li>
            );
          }

          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link href={item.href} className={tabClass(active)} aria-current={active ? "page" : undefined}>
                <NavIcon name={item.icon} />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

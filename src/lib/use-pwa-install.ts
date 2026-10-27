"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const DISMISS_KEY = "mbkru_pwa_install_dismissed_v1";
const DISMISS_DAYS = 14;

export type PwaInstallMode = "android" | "ios" | null;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua) && !ua.includes("crios") && !ua.includes("fxios");
}

function isDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number.parseInt(raw, 10);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

/** Shared PWA install detection for banner + account card. */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [bannerHidden, setBannerHidden] = useState(true);

  const mode = useMemo((): PwaInstallMode => {
    if (deferredPrompt) return "android";
    if (iosHint) return "ios";
    return null;
  }, [deferredPrompt, iosHint]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandaloneDisplay()) {
      setBannerHidden(true);
      setStorageReady(true);
      return;
    }
    setBannerHidden(isDismissedRecently());

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    if (isIosSafari()) setIosHint(true);
    setStorageReady(true);

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* private mode */
    }
    setBannerHidden(true);
    setDeferredPrompt(null);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        dismiss();
        return true;
      }
      return false;
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt, dismiss]);

  const canPrompt = mode !== null && !isStandaloneDisplay();
  const showBanner = storageReady && canPrompt && !bannerHidden;
  const showAccountCard = canPrompt;

  return {
    mode,
    installing,
    install,
    dismiss,
    showBanner,
    showAccountCard,
    isInstalled: isStandaloneDisplay(),
  };
}

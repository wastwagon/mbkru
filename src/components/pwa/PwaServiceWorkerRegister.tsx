"use client";

import { useEffect } from "react";

/** Registers the PWA service worker in supporting browsers (production-safe). */
export function PwaServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV === "development") return;

    void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      /* non-fatal — site works without install */
    });
  }, []);

  return null;
}

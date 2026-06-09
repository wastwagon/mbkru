"use client";

import { useEffect } from "react";

/**
 * Locks document scroll while overlays (menus, modals, sheets) are open.
 * Restores prior overflow and scroll position on unlock (helps iOS).
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked || typeof document === "undefined") return;

    const scrollY = window.scrollY;
    const { overflow, position, top, width } = document.body.style;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.position = position;
      document.body.style.top = top;
      document.body.style.width = width;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}

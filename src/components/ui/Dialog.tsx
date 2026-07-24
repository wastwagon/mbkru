"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/Button";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { mobileIconButtonClass } from "@/lib/mobile-ui-classes";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

const sizeClass = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
} as const;

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  /** Visible heading; pairs with aria-labelledby. */
  title?: ReactNode;
  titleId?: string;
  /** Used when title is omitted (e.g. custom header inside children). */
  ariaLabel?: string;
  size?: keyof typeof sizeClass;
  /** Hide the default X control (provide your own close affordance). */
  hideCloseButton?: boolean;
  /**
   * Skip default title bar / padded body / safe-area footer.
   * Use when the caller owns the full panel chrome (tabs, toolbars).
   */
  bare?: boolean;
  children: ReactNode;
  /** Extra classes on the panel. */
  panelClassName?: string;
  footer?: ReactNode;
};

/**
 * Accessible modal shell (Untitled UI Modals → MBKRU tokens).
 * Mobile: bottom sheet. Desktop: centered card.
 */
export function Dialog({
  open,
  onClose,
  title,
  titleId = "dialog-title",
  ariaLabel,
  size = "md",
  hideCloseButton = false,
  bare = false,
  children,
  panelClassName = "",
  footer,
}: DialogProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close dialog"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title != null ? titleId : undefined}
            aria-label={title == null ? ariaLabel : undefined}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: "100%" }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: "100%" }}
            transition={
              prefersReducedMotion
                ? { duration: 0.15 }
                : { type: "spring", stiffness: 420, damping: 36, mass: 0.75 }
            }
            className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[min(90dvh,calc(100dvh-env(safe-area-inset-bottom)))] w-full flex-col overflow-hidden overscroll-contain rounded-t-2xl border border-[var(--border)] bg-white shadow-xl focus-visible:outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[calc(100%-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl ${sizeClass[size]} ${panelClassName}`}
            onClick={(e) => e.stopPropagation()}
          >
            {bare ? (
              children
            ) : (
              <>
                <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-[var(--border)] sm:hidden" aria-hidden />
                {title != null || !hideCloseButton ? (
                  <div className="flex shrink-0 items-start justify-between gap-4 px-5 pt-3 sm:px-6 sm:pt-5">
                    {title != null ? (
                      <h3
                        id={titleId}
                        className="min-w-0 flex-1 font-display text-lg font-bold text-[var(--foreground)] sm:text-xl"
                      >
                        {title}
                      </h3>
                    ) : (
                      <span className="flex-1" />
                    )}
                    {!hideCloseButton ? (
                      <button
                        type="button"
                        onClick={onClose}
                        className={`shrink-0 ${mobileIconButtonClass} rounded-xl text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]`}
                        aria-label="Close"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    ) : null}
                  </div>
                ) : null}
                <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 sm:px-6">{children}</div>
                {footer ? (
                  <div className="shrink-0 border-t border-[var(--border)] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
                    {footer}
                  </div>
                ) : (
                  <div className="shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-5" />
                )}
              </>
            )}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  titleId?: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Destructive confirm (red primary action). */
  destructive?: boolean;
  confirmDisabled?: boolean;
  busy?: boolean;
  busyLabel?: string;
  children?: ReactNode;
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  titleId = "confirm-dialog-title",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  confirmDisabled = false,
  busy = false,
  busyLabel = "Working…",
  children,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      titleId={titleId}
      size="sm"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="surface" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "primary"}
            onClick={onConfirm}
            disabled={confirmDisabled}
            loading={busy}
            loadingLabel={busyLabel}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      {description ? <p className="mt-2 text-sm text-[var(--foreground-secondary)]">{description}</p> : null}
      {children}
    </Dialog>
  );
}

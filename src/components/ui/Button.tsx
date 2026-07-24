"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

import {
  buttonClass,
  type ButtonDensity,
  type ButtonSize,
  type ButtonVariant,
} from "@/lib/ui/button-styles";

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden
    />
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  density?: ButtonDensity;
  /** Shows a spinner and disables the control. */
  loading?: boolean;
  loadingLabel?: ReactNode;
  asChild?: boolean;
  href?: string;
};

export function Button({
  variant = "primary",
  size = "md",
  density = "public",
  loading = false,
  loadingLabel,
  className = "",
  asChild,
  href,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const classes = buttonClass({ variant, size, density, className });
  const submitWrapClass = /\bw-full\b/.test(className)
    ? "flex w-full min-w-0 sm:inline-flex sm:w-auto"
    : "inline-flex";
  const isDisabled = Boolean(disabled || loading);
  const content = loading ? (
    <>
      <Spinner />
      {loadingLabel ?? children}
    </>
  ) : (
    children
  );

  if (asChild && href) {
    return (
      <Link href={href} className={classes} aria-disabled={isDisabled || undefined}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <Link href={href} className={`${classes}${isDisabled ? " pointer-events-none opacity-50" : ""}`}>
        {content}
      </Link>
    );
  }

  return (
    <motion.div
      whileHover={isDisabled ? undefined : { scale: 1.01 }}
      whileTap={isDisabled ? undefined : { scale: 0.99 }}
      className={submitWrapClass}
    >
      <button
        className={classes}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    </motion.div>
  );
}

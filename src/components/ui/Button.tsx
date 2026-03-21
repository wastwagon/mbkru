"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";

const baseStyles =
  "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-[400ms] ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary:
    "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md hover:bg-[var(--primary-dark)] hover:shadow-lg active:scale-[0.98]",
  secondary:
    "bg-[var(--secondary)] text-white hover:bg-[var(--primary)] active:scale-[0.98]",
  outline:
    "border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white active:scale-[0.98]",
  ghost: "text-[var(--primary)] hover:bg-[var(--muted)]",
  pill: "rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md hover:bg-[var(--primary-dark)] hover:shadow-lg active:scale-[0.98]",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
  href?: string;
};

const sizeStyles = {
  sm: "h-9 rounded-lg px-4 text-sm",
  md: "h-11 rounded-xl px-6 text-base",
  lg: "h-12 rounded-xl px-8 text-base",
};

const pillSizeStyles = {
  sm: "h-9 rounded-full px-5 text-sm",
  md: "h-12 rounded-full px-6 py-3 text-base",
  lg: "h-14 rounded-full px-8 py-4 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  asChild,
  href,
  children,
  ...props
}: ButtonProps) {
  const sizeClass = variant === "pill" ? pillSizeStyles[size] : sizeStyles[size];
  const classes = `${baseStyles} ${variants[variant]} ${sizeClass} ${className}`;

  if (asChild && href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="inline-flex">
      <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
        {children}
      </button>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

interface CardProps {
  title: string;
  description: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string;
  className?: string;
  children?: React.ReactNode;
}

export function Card({
  title,
  description,
  href,
  icon,
  badge,
  className = "",
  children,
}: CardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        {icon && (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)]/15 to-[var(--accent)]/10 text-[var(--primary)]">
            {icon}
          </div>
        )}
        {badge && <Badge variant="gold">{badge}</Badge>}
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold text-[var(--foreground)]">{title}</h3>
      <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">{description}</p>
      {children}
    </>
  );

  const baseClasses =
    "rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-card)] transition-all duration-[400ms] ease-in-out hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--primary)]/20";

  if (href) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className={className}
      >
        <Link href={href} className={`block ${baseClasses}`}>
          {content}
          <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)]">
            Learn more
            <svg
              className="ml-1 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`${baseClasses} ${className}`}
    >
      {content}
    </motion.div>
  );
}

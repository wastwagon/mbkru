"use client";

import Link from "next/link";

type LogoProps = {
  variant?: "full" | "icon";
  theme?: "light" | "dark";
  className?: string;
  href?: string;
};

/** Text logo — MBKRU / ADVOCATES / CIVIC ACCOUNTABILITY */
export function Logo({ variant = "full", theme = "light", className = "", href = "/" }: LogoProps) {
  const textColor = theme === "dark" ? "text-white/95" : "text-[var(--foreground)]";

  const content = (
    <div className={`flex flex-col overflow-visible py-0.5 leading-snug ${textColor}`}>
      <span className="font-logo text-base font-semibold tracking-[0.12em] sm:text-lg md:text-xl" style={{ lineHeight: 1.35 }}>
        MBKRU
      </span>
      <span className="font-logo text-[10px] font-medium tracking-[0.2em] sm:text-xs">
        ADVOCATES
      </span>
      <span className="font-logo text-[8px] font-normal tracking-[0.15em] opacity-90 sm:text-[10px]">
        CIVIC ACCOUNTABILITY
      </span>
    </div>
  );

  const wrapperClass = `flex min-w-0 shrink-0 items-center gap-3 overflow-visible transition-opacity hover:opacity-90 ${className}`;

  if (href) {
    return (
      <Link href={href} className={wrapperClass} aria-label="MBKRU Advocates — Home">
        {content}
      </Link>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
}

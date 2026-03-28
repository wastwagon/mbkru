"use client";

import { content } from "@/lib/placeholders";

const contactInfo = {
  address: content.address,
  email: content.email,
  tel: content.phone,
};

const socialLinks = [
  { href: content.social.facebook, label: "Facebook", icon: "facebook" },
  { href: content.social.linkedin, label: "LinkedIn", icon: "linkedin" },
  { href: content.social.twitter, label: "Twitter", icon: "twitter" },
].filter((l) => l.href.startsWith("http"));

export function TopBar() {
  return (
    <div className="relative z-40 overflow-hidden bg-[var(--accent-gold)] text-white">
      <div className="relative mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-2 lg:px-8">
        <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent sm:left-6 sm:right-6 lg:left-8 lg:right-8" aria-hidden />
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm sm:justify-start">
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(contactInfo.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/95 transition-colors hover:text-white"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{contactInfo.address}</span>
          </a>
          <a
            href={`mailto:${contactInfo.email}`}
            className="flex items-center gap-2 text-white/95 transition-colors hover:text-white"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{contactInfo.email}</span>
          </a>
          {contactInfo.tel ? (
            <a
              href={`tel:${contactInfo.tel.replace(/\s/g, "")}`}
              className="flex items-center gap-2 text-white/95 transition-colors hover:text-white"
            >
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{contactInfo.tel}</span>
            </a>
          ) : null}
        </div>
        <div className="flex items-center justify-center gap-2 sm:justify-end">
          {socialLinks.map(({ href, label, icon }) => (
            <a
              key={icon}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white transition-all duration-300 hover:bg-white hover:text-[var(--section-dark)]"
              aria-label={label}
            >
              {icon === "facebook" && (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              )}
              {icon === "linkedin" && (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              )}
              {icon === "twitter" && (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

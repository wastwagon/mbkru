import Link from "next/link";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { Logo } from "@/components/ui/Logo";
import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { content, heroContent, footerGalleryImages } from "@/lib/placeholders";
import {
  isLegalEmpowermentPageEnabled,
  isPromisesBrowseEnabled,
  isReportCardPublicEnabled,
  isTownHallDirectoryPageEnabled,
} from "@/lib/reports/accountability-pages";

const footerLinks = {
  organization: [
    { href: "/methodology", label: "Accountability methodology" },
    { href: "/about", label: "About Us" },
    { href: "/news", label: "News & Updates" },
    { href: "/diaspora", label: "Diaspora (17th Region)" },
    { href: "/resources", label: "Resources" },
    { href: "/faq", label: "FAQ" },
    { href: "/partners", label: "Partners & Supporters" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Use" },
  ],
};

export async function Footer() {
  const currentYear = new Date().getFullYear();
  const phase = getServerPlatformPhase();
  const voiceOn = platformFeatures.citizensVoicePlatform(phase);

  const platformLinks: { href: string; label: string }[] = [{ href: "/citizens-voice", label: "MBKRU Voice" }];
  if (voiceOn) {
    platformLinks.push(
      { href: "/citizens-voice/submit", label: "Submit a report" },
      { href: "/track-report", label: "Track a report" },
    );
  }
  platformLinks.push(
    { href: "/situational-alerts", label: "Engagement" },
    { href: "/parliament-tracker", label: "Accountability" },
  );
  if (isPromisesBrowseEnabled()) platformLinks.push({ href: "/promises", label: "Campaign promises" });
  if (isReportCardPublicEnabled()) platformLinks.push({ href: "/report-card", label: "Report card" });
  if (isLegalEmpowermentPageEnabled()) platformLinks.push({ href: "/legal-empowerment", label: "Legal desk" });
  if (isTownHallDirectoryPageEnabled()) platformLinks.push({ href: "/town-halls", label: "Town halls" });

  return (
    <footer className="relative bg-[var(--footer-bg)] text-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        {/* Upper CTA section */}
        <div className="flex flex-col items-start gap-6 border-b border-white/20 py-10 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-base font-bold text-white sm:text-lg lg:text-xl">
              Stay close to accountability news and citizen-voice tools
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/85 sm:text-base">
              MBKRU is deploying non-partisan tools for Ghanaians to follow public commitments, share concerns safely, and
              access clear information — Voice reporting, accountability datasets, and methodology scale with your
              deployment phase.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Button href="/citizens-voice">
              Join MBKRU Voice
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/50 bg-white px-6 py-3 text-sm font-semibold text-[var(--footer-bg)] transition-all duration-[400ms] hover:border-white hover:bg-white/90"
            >
              Get in Touch
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Main columns */}
        <div className="grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-3 sm:py-12">
          {/* Brand — premium logo */}
          <div className="lg:col-span-1">
            <Logo href="/" theme="dark" className="gap-2.5" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/80">
              {heroContent.tagline}. {heroContent.motto}
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href={content.social.facebook}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-[var(--accent-warm)]"
                aria-label="Facebook"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href={content.social.linkedin}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-[var(--accent-warm)]"
                aria-label="LinkedIn"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href={content.social.twitter}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-[var(--accent-warm)]"
                aria-label="Twitter"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Platform — index2 "Our services" */}
          <div className="pl-4 lg:pl-6">
            <h3 className="text-base font-semibold text-white">Our Platform</h3>
            <ul className="mt-5 space-y-3">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/80 transition-colors hover:pl-2 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Organization — index2 "Useful links" */}
          <div>
            <h3 className="text-base font-semibold text-white">Useful Links</h3>
            <ul className="mt-5 space-y-3">
              {footerLinks.organization.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/80 transition-colors hover:pl-2 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact — index2 style */}
          <div>
            <h3 className="text-base font-semibold text-white">Contact Us</h3>
            <div className="mt-5 space-y-4">
              <a href="mailto:info@mbkruadvocates.org" className="flex items-start gap-3 text-sm text-white/80 transition-colors hover:text-white">
                <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@mbkruadvocates.org
              </a>
              <p className="flex items-start gap-3 text-sm text-white/80">
                <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {content.officeDetails}
              </p>
            </div>
          </div>

          {/* Engagement gallery — 3x3 grid */}
          <div>
            <h3 className="text-base font-semibold text-white">Engagement</h3>
            <div className="mt-5 grid grid-cols-3 gap-1.5">
              {footerGalleryImages.map((src, i) => (
                <a
                  key={i}
                  href="/situational-alerts"
                  className="group relative aspect-square overflow-hidden rounded-md ring-1 ring-white/10 transition-all hover:ring-white/30"
                >
                  <Image
                    src={src}
                    alt="Engagement gallery image"
                    fill
                    className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
                    sizes="80px"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar — logo, legal links, copyright */}
        <div className="border-t border-white/20 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <Logo href="/" theme="dark" className="scale-75 origin-left opacity-90 sm:scale-90" />
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <p className="text-sm text-white/60">
              © {currentYear} My Brother&apos;s Keeper Restoration United (MBKRU). All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { Logo } from "@/components/ui/Logo";
import { FooterMemberAuth } from "@/components/layout/FooterMemberAuth";
import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { getFooterPlatformFlowLinks } from "@/config/public-platform-nav";
import {
  focusRingOnDark50Class,
  focusRingOnDark60Class,
  focusRingOnDark70IconClass,
  focusRingOnDarkSolidClass,
} from "@/lib/primary-link-styles";
import { content, footerGalleryAlts, footerGalleryImages } from "@/lib/site-content";

const footerNavLinkClass = `inline-flex min-h-10 max-w-full items-center rounded-md px-1 py-1.5 -mx-1 text-sm text-white/80 transition-[color,transform] duration-200 ease-out hover:text-white hover:translate-x-0.5 motion-reduce:hover:translate-x-0 ${focusRingOnDark60Class}`;

const footerLinks = {
  organization: [
    { href: "/methodology", label: "Accountability methodology" },
    { href: "/about", label: "About" },
    { href: "/news", label: "News" },
    { href: "/diaspora", label: "Diaspora (17th Region)" },
    { href: "/diaspora/feedback", label: "Diaspora visit feedback" },
    { href: "/resources", label: "Resources" },
    { href: "/faq", label: "FAQ" },
    { href: "/data-sources", label: "Data sources" },
    { href: "/partners", label: "Partners & Supporters" },
  ],
  legal: [
    { href: "/accessibility", label: "Accessibility" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Use" },
  ],
};

export async function Footer() {
  const currentYear = new Date().getFullYear();
  const phase = getServerPlatformPhase();
  const platformLinks = getFooterPlatformFlowLinks(phase);
  const organizationLinks = (() => {
    const links = [...footerLinks.organization];
    if (platformFeatures.partnerJsonProgramme(phase)) {
      const idx = links.findIndex((l) => l.href === "/data-sources");
      if (idx >= 0) {
        links.splice(idx + 1, 0, { href: "/partner-api", label: "Partner data & API" });
      } else {
        links.push({ href: "/partner-api", label: "Partner data & API" });
      }
    }
    return links;
  })();

  const platformSplitAt = Math.ceil(platformLinks.length / 2);
  const platformLinksCol1 = platformLinks.slice(0, platformSplitAt);
  const platformLinksCol2 = platformLinks.slice(platformSplitAt);

  const socialLinks = (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      <a
        href={content.social.facebook}
        className={`flex h-11 w-11 touch-manipulation items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-[var(--accent-warm)] sm:h-10 sm:w-10 ${focusRingOnDark70IconClass}`}
        aria-label="Facebook"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>
      <a
        href={content.social.linkedin}
        className={`flex h-11 w-11 touch-manipulation items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-[var(--accent-warm)] sm:h-10 sm:w-10 ${focusRingOnDark70IconClass}`}
        aria-label="LinkedIn"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </a>
      <a
        href={content.social.twitter}
        className={`flex h-11 w-11 touch-manipulation items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-[var(--accent-warm)] sm:h-10 sm:w-10 ${focusRingOnDark70IconClass}`}
        aria-label="Twitter"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
    </div>
  );

  return (
    <footer className="relative bg-[var(--footer-bg)] text-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        {/* Upper CTA section */}
        <div className="flex flex-col items-stretch gap-8 border-b border-white/20 py-11 sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:py-12">
          <div className="max-w-2xl">
            <h2 className="font-display text-base font-bold leading-snug text-white sm:text-lg lg:text-xl">
              Stay close to accountability news and citizen-voice tools
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/85 sm:mt-5 sm:text-base">
              MBKRU is deploying non-partisan tools for Ghanaians to follow public commitments, share concerns safely, and
              access clear information — Voice reporting, accountability datasets, and methodology scale with your
              deployment phase.
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Button href="/citizens-voice" className="w-full justify-center sm:w-auto">
              Join Voice
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
            <Link
              href="/contact"
              className={`inline-flex w-full touch-manipulation items-center justify-center gap-2 rounded-xl border-2 border-white/50 bg-white px-6 py-3.5 text-sm font-semibold text-[var(--footer-bg)] transition-all duration-[400ms] hover:border-white hover:bg-white/90 sm:w-auto sm:py-3 active:scale-[0.99] motion-reduce:active:scale-100 ${focusRingOnDarkSolidClass}`}
            >
              Get in Touch
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Main columns — platform spans two columns (split list); brand block removed (logo + socials live in bottom bar). */}
        <div className="grid gap-10 py-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-5 lg:gap-6 sm:py-12">
          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="text-base font-semibold text-white">Our Platform</h3>
            <div className="mt-5 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-10">
              <ul className="space-y-3">
                <FooterMemberAuth />
                {platformLinksCol1.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={footerNavLinkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div>
                <h4 className="sr-only">More platform links</h4>
                <ul className="space-y-3">
                  {platformLinksCol2.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={footerNavLinkClass}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Organization — index2 "Useful links" */}
          <div>
            <h3 className="text-base font-semibold text-white">Useful Links</h3>
            <ul className="mt-5 space-y-3">
              {organizationLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerNavLinkClass}>
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
              <a
                href="mailto:info@mbkruadvocates.org"
                className={`flex min-h-10 items-start gap-3 rounded-md px-1 py-1.5 -mx-1 text-sm text-white/80 transition-colors hover:text-white ${focusRingOnDark60Class}`}
              >
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
                  className={`group relative aspect-square overflow-hidden rounded-md ring-1 ring-white/10 transition-[box-shadow,transform] duration-200 hover:ring-white/30 motion-reduce:transition-none active:scale-[0.98] motion-reduce:active:scale-100 ${focusRingOnDark60Class}`}
                >
                  <Image
                    src={src}
                    alt={footerGalleryAlts[i] ?? "MBKRU engagement"}
                    fill
                    className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
                    sizes="80px"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar — logo, socials, legal, copyright */}
        <div className="border-t border-white/20 py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-3">
              <Logo href="/" theme="dark" className="w-fit scale-90 origin-left opacity-90 sm:scale-95" />
              {socialLinks}
              <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Legal">
                {footerLinks.legal.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-md px-1 py-1 text-sm text-white/60 transition-colors hover:text-white ${focusRingOnDark50Class}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <p className="text-sm text-white/60 lg:max-w-md lg:text-right">
              © {currentYear} My Brother&apos;s Keeper Restoration United (MBKRU). All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

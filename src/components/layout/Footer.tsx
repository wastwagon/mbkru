import Link from "next/link";
import { FooterMobileInstallLink } from "@/components/pwa/FooterMobileInstallLink";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { Logo } from "@/components/ui/Logo";
import { FooterDeveloperCredit } from "@/components/layout/FooterDeveloperCredit";
import { FooterMemberAuth } from "@/components/layout/FooterMemberAuth";
import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isFocusedMemberRoute } from "@/lib/platform/focused-member-routes";
import { getRequestPathname } from "@/lib/platform/request-pathname";
import {
  getFooterLegalLinks,
  getFooterOrganizationLinks,
  getFooterPlatformFlowLinks,
} from "@/config/public-platform-nav";
import { footerTrustLine } from "@/config/site-disclaimers";
import {
  focusRingOnDark50Class,
  focusRingOnDark60Class,
  focusRingOnDarkSolidClass,
} from "@/lib/primary-link-styles";
import { PublicSocialLinks } from "@/components/layout/PublicSocialLinks";
import { content, footerGalleryAlts, footerGalleryImages, getPublicSocialLinks } from "@/lib/site-content";

const footerNavLinkClass = `inline-flex min-h-11 max-w-full items-center rounded-md px-1 py-1.5 -mx-1 text-sm text-white/80 transition-[color,transform] duration-200 ease-out hover:text-white hover:translate-x-0.5 motion-reduce:hover:translate-x-0 ${focusRingOnDark60Class}`;

export async function Footer() {
  const currentYear = new Date().getFullYear();
  const phase = getServerPlatformPhase();
  const launchPolish = platformFeatures.publicLaunchPolish(phase);
  const pathname = await getRequestPathname();
  const focusedFooter = launchPolish && isFocusedMemberRoute(pathname);
  const platformLinks = getFooterPlatformFlowLinks(phase);
  const organizationLinks = getFooterOrganizationLinks(phase);
  const legalLinks = getFooterLegalLinks();
  const resolvedSocialLinks = getPublicSocialLinks();

  const platformSplitAt = Math.ceil(platformLinks.length / 2);
  const platformLinksCol1 = platformLinks.slice(0, platformSplitAt);
  const platformLinksCol2 = platformLinks.slice(platformSplitAt);

  const socialLinks = (
    <PublicSocialLinks links={resolvedSocialLinks} variant="footer" className="flex flex-wrap gap-2 sm:gap-3" />
  );

  return (
    <footer
      className="relative bg-[var(--footer-bg)] text-white pb-[calc(var(--mobile-bottom-nav-height)+max(0.5rem,env(safe-area-inset-bottom)))] lg:pb-0"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        {focusedFooter ? (
          <div className="border-b border-white/20 py-8">
            <p className="max-w-2xl text-sm leading-relaxed text-white/85">{footerTrustLine.body}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button href="/citizens-voice/submit" className="justify-center">
                Submit a report
              </Button>
              <Link
                href="/account"
                className={`inline-flex min-h-11 items-center justify-center rounded-xl border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 ${focusRingOnDarkSolidClass}`}
              >
                My account
              </Link>
            </div>
          </div>
        ) : launchPolish ? (
          <div className="flex flex-col gap-4 border-b border-white/20 py-8 sm:flex-row sm:items-center sm:justify-between sm:py-9">
            <p className="max-w-xl text-sm leading-relaxed text-white/90">
              Report an issue, track a submission, or explore public accountability data.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href="/citizens-voice/submit" className="w-full justify-center sm:w-auto">
                Submit a report
              </Button>
              <Link
                href="/contact"
                className={`inline-flex w-full touch-manipulation items-center justify-center rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto ${focusRingOnDarkSolidClass}`}
              >
                Contact
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-stretch gap-8 border-b border-white/20 py-11 sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:py-12">
            <div className="max-w-2xl">
              <h2 className="font-display text-base font-bold leading-snug text-white sm:text-lg lg:text-xl">
                Stay close to accountability news and citizen-voice tools
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/85 sm:mt-5 sm:text-base">
                MBKRU is deploying non-partisan tools for Ghanaians to follow public commitments, share concerns safely,
                and access clear information — Voice reporting, accountability datasets, and methodology scale with your
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
        )}

        {!focusedFooter ? (
        <div className="grid gap-10 py-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-5 lg:gap-6 sm:py-12">
          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="text-base font-semibold text-white">Our Platform</h3>
            <div className="mt-5 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-10">
              <ul className="space-y-3">
                <FooterMemberAuth />
                <FooterMobileInstallLink />
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
        ) : null}

        {/* Bottom bar — logo, socials, legal, copyright */}
        <div className="border-t border-white/20 py-6">
          <p className="mb-5 max-w-4xl text-xs leading-relaxed text-white/65">
            {footerTrustLine.body} {footerTrustLine.emergencyNote}{" "}
            <Link href="/methodology" className={`font-medium text-white/80 underline-offset-2 hover:text-white hover:underline ${focusRingOnDark50Class}`}>
              {footerTrustLine.methodologyLabel}
            </Link>
            {" · "}
            <Link href="/terms" className={`text-white/80 underline-offset-2 hover:text-white hover:underline ${focusRingOnDark50Class}`}>
              {footerTrustLine.termsLabel}
            </Link>
          </p>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-3">
              <Logo href="/" theme="dark" className="w-fit scale-90 origin-left opacity-90 sm:scale-95" />
              {socialLinks}
              <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Legal">
                {legalLinks.map((link) => (
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
            <div className="flex flex-col gap-4 lg:max-w-sm lg:shrink-0">
              <p className="text-sm text-white/60 lg:text-right">
                © {currentYear} My Brother&apos;s Keeper Restoration United (MBKRU). All rights reserved.
              </p>
              <FooterDeveloperCredit />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

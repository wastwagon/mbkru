import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPublishedPartners, partnerCategoryLabel } from "@/lib/content/partners-cms";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";
import { images } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Partners & Supporters",
  description:
    "Development partners, corporate supporters, and foundations backing MBKRU's mission for citizen accountability and poverty eradication in Ghana.",
};

export default async function PartnersPage() {
  const partners = await getPublishedPartners();

  return (
    <div>
      <PageHeader
        title="Partners & Supporters"
        description="We work with development partners, civil society, and foundations committed to governance, citizen voice, and poverty eradication in Ghana."
      />

      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-10">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src={images.partnership}
                alt="Partnership and collaboration"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-[var(--foreground)]">
                Building Partnerships for Impact
              </h2>
              <p className="mt-4 text-[var(--foreground-secondary)] leading-relaxed">
                MBKRU respectfully seeks partnership with the Government of Ghana, civil society organizations, development partners, and international foundations to advance our mission: a direct voice between citizens and the Presidency, accountability at every level, and tangible progress toward poverty eradication.
              </p>
              <p className="mt-4 text-[var(--foreground-secondary)] leading-relaxed">
                Our proposed funding model includes grants from development partners focused on governance and citizen engagement, corporate social responsibility contributions for accountability programs, and support from international foundations backing democratic accountability.
              </p>
              <div className="mt-6">
                <Button href="/contact">
                  Get in Touch
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="font-display text-xl font-bold text-[var(--foreground)]">
              Our Partners & Supporters
            </h2>
            <p className="mt-2 text-[var(--foreground-secondary)]">
              Confirmed partners and logos will be listed here. We do not display stand-in or unconfirmed organisation names.
            </p>
            {partners.length > 0 ? (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {partners.map((partner) => (
                  <li
                    key={partner.id}
                    className="rounded-2xl border border-[var(--border)] bg-white px-5 py-6 text-center"
                  >
                    {partner.logoMedia ? (
                      <span className="relative mx-auto block h-20 w-full max-w-[180px]">
                        <Image
                          src={partner.logoMedia.storagePath}
                          alt={partner.logoMedia.alt || `${partner.name} logo`}
                          fill
                          className="object-contain"
                          sizes="180px"
                        />
                      </span>
                    ) : (
                      <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--foreground-secondary)]">
                        {partnerCategoryLabel(partner.category)}
                      </p>
                    )}
                    <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                      {partner.websiteUrl ? (
                        <a
                          href={partner.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[var(--primary)]"
                        >
                          {partner.name}
                        </a>
                      ) : (
                        partner.name
                      )}
                    </p>
                    {partner.summary ? (
                      <p className="mt-1 text-xs text-[var(--foreground-secondary)]">{partner.summary}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "Government of Ghana", detail: "Governance & citizen engagement partners" },
                    { label: "Civil society", detail: "Accountability and rights organisations" },
                    { label: "Development partners", detail: "Bilateral and multilateral programmes" },
                    { label: "Foundations", detail: "Democratic accountability funders" },
                  ].map((slot) => (
                    <li
                      key={slot.label}
                      className="rounded-2xl border border-dashed border-[var(--border)] bg-white px-5 py-6 text-center"
                    >
                      <p className="text-sm font-semibold text-[var(--foreground)]">{slot.label}</p>
                      <p className="mt-1 text-xs text-[var(--foreground-secondary)]">{slot.detail}</p>
                      <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-[var(--foreground-secondary)]">
                        Logo slot reserved
                      </p>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-center text-sm text-[var(--foreground-secondary)]">
                  No partner listings published yet.
                </p>
              </>
            )}
          </div>

          <div className="mt-12 rounded-xl border-2 border-[var(--primary)]/20 bg-[var(--muted)] p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold text-[var(--foreground)]">
              Partner With Us
            </h2>
            <p className="mt-3 text-[var(--foreground-secondary)] leading-relaxed">
              If your organization shares our commitment to citizen voice, accountability, and poverty eradication in Ghana, we would welcome a conversation. Use our contact form to reach out for partnership enquiries.
            </p>
            <Link href="/contact" className={`${primaryNavLinkClass} mt-4 gap-2 text-sm font-semibold`}>
              Contact us for partnership enquiries
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

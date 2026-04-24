import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";
import { images } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Partners & Supporters",
  description:
    "Development partners, corporate supporters, and foundations backing MBKRU's mission for citizen accountability and poverty eradication in Ghana.",
};

export default function PartnersPage() {
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
              <p className="mt-4 text-[var(--muted-foreground)] leading-relaxed">
                MBKRU respectfully seeks partnership with the Government of Ghana, civil society organizations, development partners, and international foundations to advance our mission: a direct voice between citizens and the Presidency, accountability at every level, and tangible progress toward poverty eradication.
              </p>
              <p className="mt-4 text-[var(--muted-foreground)] leading-relaxed">
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
            <p className="mt-2 text-[var(--muted-foreground)]">
              Confirmed partners and logos will be listed here. We do not display stand-in or unconfirmed organisation names.
            </p>
            <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] bg-white px-6 py-14 text-center text-sm text-[var(--muted-foreground)]">
              No partner listings published yet.
            </div>
          </div>

          <div className="mt-12 rounded-xl border-2 border-[var(--primary)]/20 bg-[var(--muted)] p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold text-[var(--foreground)]">
              Partner With Us
            </h2>
            <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
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

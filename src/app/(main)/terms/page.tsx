import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "MBKRU Terms of Use — terms and conditions for using our website and services.",
};

export default function TermsPage() {
  return (
    <div>
      <PageHeader
        title="Terms of Use"
        description="Last updated: March 2026"
      />

      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="prose prose-slate mx-auto max-w-4xl prose-headings:font-display prose-headings:text-[var(--foreground)] prose-p:text-[var(--muted-foreground)] prose-li:text-[var(--muted-foreground)] prose-a:text-[var(--primary)] prose-a:no-underline hover:prose-a:underline prose-a:transition-all prose-a:duration-[400ms]">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the My Brother&apos;s Keeper Restoration United (MBKRU) website and services, you
            agree to be bound by these Terms of Use. If you do not agree, please
            do not use our services.
          </p>

          <h2>2. Use of the Website</h2>
          <p>You agree to use our website only for lawful purposes. You must not:</p>
          <ul>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe the rights of others</li>
            <li>Transmit harmful or malicious content</li>
            <li>Attempt to gain unauthorized access to our systems</li>
          </ul>

          <h2>3. Intellectual Property</h2>
          <p>
            All content on this website (text, graphics, logos, etc.) is owned by
            My Brother&apos;s Keeper Restoration United (MBKRU) or its licensors. You may not reproduce, distribute,
            or create derivative works without our written permission.
          </p>

          <h2>4. User-Generated Content</h2>
          <p>
            When our interactive features (e.g., Citizens Voice, Situational
            Alerts) are launched, you may submit content. You retain ownership
            but grant us a license to use, display, and process such content
            for the operation of our services. You are responsible for ensuring
            your submissions are accurate and do not violate any laws.
          </p>

          <h2>5. Disclaimer</h2>
          <p>
            Our website and services are provided &quot;as is&quot;. We do not
            guarantee accuracy, completeness, or suitability of any content.
            We are not liable for any reliance you place on information
            published on our platform.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, My Brother&apos;s Keeper Restoration United (MBKRU) shall not be
            liable for any indirect, incidental, special, or consequential
            damages arising from your use of our services.
          </p>

          <h2>7. Links to Third-Party Sites</h2>
          <p>
            Our website may contain links to external sites. We are not
            responsible for the content or practices of third-party websites.
          </p>

          <h2>8. Changes</h2>
          <p>
            We may update these Terms from time to time. Continued use of our
            services after changes constitutes acceptance of the updated Terms.
          </p>

          <h2>9. Governing Law</h2>
          <p>
            These Terms are governed by the laws of Ghana. Any disputes shall be
            subject to the exclusive jurisdiction of the courts of Ghana.
          </p>

          <h2>10. Contact</h2>
          <p>
            For questions about these Terms, please{" "}
            <Link href="/contact" className="text-[var(--primary)] hover:underline">
              contact us
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

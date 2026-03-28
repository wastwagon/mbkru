import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { content } from "@/lib/placeholders";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "MBKRU Privacy Policy — how we collect, use, and protect your data. GDPR and Ghana Data Protection Act aligned.",
};

export default function PrivacyPage() {
  return (
    <div>
      <PageHeader
        title="Privacy Policy"
        description="Last updated: March 2026"
      />

      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="prose prose-slate mx-auto max-w-4xl prose-headings:font-display prose-headings:text-[var(--foreground)] prose-p:text-[var(--muted-foreground)] prose-li:text-[var(--muted-foreground)] prose-a:text-[var(--primary)] prose-a:no-underline hover:prose-a:underline prose-a:transition-all prose-a:duration-[400ms]">
          <h2>1. Introduction</h2>
          <p>
            My Brother&apos;s Keeper Restoration United (MBKRU) (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to
            protecting your privacy. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you use our website
            and services. We comply with the Ghana Data Protection Act, 2012 (Act
            843) and, where applicable, the General Data Protection Regulation
            (GDPR).
          </p>

          <h2>2. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul>
            <li>
              <strong>Personal data you provide:</strong> Name, email address,
              and other contact details when you subscribe to our newsletter,
              register for early access, contact us, or (in Phase 2+) submit MBKRU Voice reports
              (including narrative text you choose to include and optional location fields).
            </li>
            <li>
              <strong>Usage data:</strong> Information about how you use our
              website (e.g., pages visited, time spent) via analytics tools.
            </li>
            <li>
              <strong>Technical data:</strong> IP address, browser type, device
              information.
            </li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Send newsletters and updates (with your consent)</li>
            <li>Respond to your enquiries</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. Legal Basis for Processing (GDPR)</h2>
          <p>
            Where GDPR applies, we process your data based on: consent (e.g.,
            newsletter signup), legitimate interests (e.g., website analytics),
            or legal obligation.
          </p>

          <h2>5. Data Retention</h2>
          <p>
            We retain your data only for as long as necessary to fulfil the
            purposes for which it was collected, or as required by law.
          </p>

          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing</li>
            <li>Withdraw consent</li>
            <li>Lodge a complaint with the Data Protection Commission (Ghana)
              or your local supervisory authority</li>
          </ul>

          <h2>7. Cookies</h2>
          <p>
            We use essential cookies for website functionality and analytics
            cookies to understand usage. You can manage cookie preferences in
            your browser.
          </p>

          <h2>8. Third-Party Services</h2>
          <p>
            We may use third-party services (e.g., analytics, email providers)
            that process data on our behalf. These providers are bound by
            appropriate data processing agreements.
          </p>

          <h2>9. Member accounts (Phase 2+)</h2>
          <p>
            If you create an MBKRU <strong>member</strong> account (separate from newsletter sign-ups and
            from staff admin access), we process your email address and a password stored only as a
            cryptographic hash. We may also store optional details you provide, such as display name,
            phone number, or region, to operate member-only features (for example MBKRU Voice as they
            launch).
          </p>
          <p>
            Member sign-in uses an <strong>httpOnly</strong> session cookie. When our infrastructure
            includes <strong>Redis</strong>, we may store a short-lived server-side session identifier
            linked to that cookie so that <strong>sign-out</strong> can end the session immediately on
            the server. Without Redis, the cookie still expires automatically after a limited time.
          </p>
          <p>
            We retain member account data until you ask us to delete your account or as required by law.
            To exercise access, correction, deletion, or portability for member data, contact us using
            the details below.
          </p>

          <h2>10. Contact</h2>
          <p>
            For privacy-related enquiries, contact us via the Contact page or
            email {content.privacyContact}.
          </p>
        </div>
      </section>
    </div>
  );
}

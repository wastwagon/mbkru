const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mbkru.org";

/** Organization + WebSite JSON-LD for phase 4+ builds (see root layout). */
export function OrganizationJsonLd() {
  const payload = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "MBKRU Advocates",
        alternateName: "My Brother's Keeper Restoration United",
        url: siteUrl,
        logo: `${siteUrl}/icons/icon-512.png`,
      },
      {
        "@type": "WebSite",
        name: "MBKRU Advocates",
        url: siteUrl,
        publisher: { "@type": "Organization", name: "MBKRU Advocates" },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

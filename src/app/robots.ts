import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mbkruadvocates.org";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      /** API, CMS, and member-only surfaces — keep crawl budget on public programme pages. */
      disallow: ["/api/", "/admin/", "/account"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

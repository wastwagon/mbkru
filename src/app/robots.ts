import { MetadataRoute } from "next";

import { isPublicSiteUnderConstruction } from "@/lib/server/site-config";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mbkruadvocates.org";
  const underConstruction = await isPublicSiteUnderConstruction();

  if (underConstruction) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

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

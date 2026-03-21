import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mbkruadvocates.org";
  const routes = [
    "",
    "/about",
    "/citizens-voice",
    "/situational-alerts",
    "/parliament-tracker",
    "/news",
    "/contact",
    "/privacy",
    "/terms",
  ];
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly" as const,
    priority: route === "" ? 1 : 0.8,
  }));
}

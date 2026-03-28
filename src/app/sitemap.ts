import { MetadataRoute } from "next";

import {
  isLegalEmpowermentPageEnabled,
  isPromisesBrowseEnabled,
  isReportCardPublicEnabled,
  isTownHallDirectoryPageEnabled,
} from "@/lib/reports/accountability-pages";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mbkruadvocates.org";
  const routes = [
    "",
    "/about",
    "/citizens-voice",
    "/situational-alerts",
    "/parliament-tracker",
    "/methodology",
    "/news",
    "/diaspora",
    "/contact",
    "/privacy",
    "/terms",
  ];
  if (isPromisesBrowseEnabled()) routes.push("/promises");
  if (isReportCardPublicEnabled()) routes.push("/report-card");
  if (isLegalEmpowermentPageEnabled()) routes.push("/legal-empowerment");
  if (isTownHallDirectoryPageEnabled()) routes.push("/town-halls");
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly" as const,
    priority: route === "" ? 1 : 0.8,
  }));
}

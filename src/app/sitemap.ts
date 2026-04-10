import { MetadataRoute } from "next";

import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";
import {
  isCommunitiesBrowseEnabled,
  isLegalEmpowermentPageEnabled,
  isPromisesBrowseEnabled,
  isPublicVoiceStatisticsEnabled,
  isReportCardPublicEnabled,
  isTownHallDirectoryPageEnabled,
  isWhistleblowerGuidancePageEnabled,
} from "@/lib/reports/accountability-pages";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mbkruadvocates.org";
  const routes: string[] = [
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

  if (isPromisesBrowseEnabled()) {
    routes.push("/promises", "/promises/browse", "/government-commitments");
  }
  if (isReportCardPublicEnabled()) routes.push("/report-card");
  if (isLegalEmpowermentPageEnabled()) routes.push("/legal-empowerment");
  if (isTownHallDirectoryPageEnabled()) {
    routes.push("/town-halls", "/debates");
  }
  if (isCitizensVoiceEnabled()) {
    routes.push("/citizens-voice/submit", "/track-report");
  }
  if (isPublicVoiceStatisticsEnabled()) {
    routes.push("/transparency");
  }
  if (isCommunitiesBrowseEnabled()) routes.push("/communities");
  if (isWhistleblowerGuidancePageEnabled()) routes.push("/whistleblowing");

  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
    priority: route === "" ? 1 : 0.8,
  }));

  const communityEntries: MetadataRoute.Sitemap = [];
  if (isCommunitiesBrowseEnabled() && isDatabaseConfigured()) {
    try {
      const communities = await prisma.community.findMany({
        where: { status: "ACTIVE" },
        select: { slug: true, updatedAt: true },
      });
      for (const c of communities) {
        communityEntries.push({
          url: `${baseUrl}/communities/${c.slug}`,
          lastModified: c.updatedAt,
          changeFrequency: "weekly",
          priority: 0.65,
        });
      }
    } catch {
      /* e.g. DB unreachable during build */
    }
  }

  const newsEntries: MetadataRoute.Sitemap = [];
  if (isDatabaseConfigured()) {
    try {
      const posts = await prisma.post.findMany({
        where: { publishedAt: { not: null } },
        select: { slug: true, updatedAt: true },
      });
      for (const p of posts) {
        newsEntries.push({
          url: `${baseUrl}/news/${p.slug}`,
          lastModified: p.updatedAt,
          changeFrequency: "weekly",
          priority: 0.65,
        });
      }
    } catch {
      /* DB unreachable during build */
    }
  }

  const reportCardYearEntries: MetadataRoute.Sitemap = [];
  if (isReportCardPublicEnabled() && isDatabaseConfigured()) {
    try {
      const cycles = await prisma.reportCardCycle.findMany({
        where: { publishedAt: { not: null } },
        select: { year: true, publishedAt: true },
      });
      for (const c of cycles) {
        reportCardYearEntries.push({
          url: `${baseUrl}/report-card/${c.year}`,
          lastModified: c.publishedAt ?? new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    } catch {
      /* DB unreachable during build */
    }
  }

  const promisesMemberEntries: MetadataRoute.Sitemap = [];
  if (isPromisesBrowseEnabled() && isDatabaseConfigured()) {
    try {
      const members = await prisma.parliamentMember.findMany({
        where: { active: true, promises: { some: {} } },
        select: { slug: true, updatedAt: true },
      });
      for (const m of members) {
        promisesMemberEntries.push({
          url: `${baseUrl}/promises/${m.slug}`,
          lastModified: m.updatedAt,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    } catch {
      /* DB unreachable during build */
    }
  }

  return [
    ...staticEntries,
    ...communityEntries,
    ...newsEntries,
    ...reportCardYearEntries,
    ...promisesMemberEntries,
  ];
}

import { MetadataRoute } from "next";

import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { getServerPlatformPhase } from "@/config/platform";
import {
  isCivicPetitionsAndPublicCausesEnabled,
  isCommunitiesBrowseEnabled,
  isPromisesBrowseEnabled,
  isReportCardPublicEnabled,
} from "@/lib/reports/accountability-pages";
import { getPublicSitemapStaticPaths } from "@/config/public-platform-nav";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mbkruadvocates.org";
  const phase = getServerPlatformPhase();
  const routes = getPublicSitemapStaticPaths(phase);

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

  const petitionEntries: MetadataRoute.Sitemap = [];
  if (isCivicPetitionsAndPublicCausesEnabled() && isDatabaseConfigured()) {
    try {
      const openPetitions = await prisma.petition.findMany({
        where: { status: "OPEN" },
        select: { slug: true, updatedAt: true },
      });
      for (const p of openPetitions) {
        petitionEntries.push({
          url: `${baseUrl}/petitions/${p.slug}`,
          lastModified: p.updatedAt,
          changeFrequency: "weekly",
          priority: 0.55,
        });
      }
    } catch {
      /* DB unreachable during build */
    }
  }

  const resourceDocumentEntries: MetadataRoute.Sitemap = [];
  if (isDatabaseConfigured()) {
    try {
      const resourceDocs = await prisma.resourceDocument.findMany({
        where: { publishedAt: { not: null } },
        select: { slug: true, updatedAt: true },
      });
      for (const r of resourceDocs) {
        resourceDocumentEntries.push({
          url: `${baseUrl}/resources/${r.slug}`,
          lastModified: r.updatedAt,
          changeFrequency: "monthly",
          priority: 0.55,
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
    ...resourceDocumentEntries,
    ...petitionEntries,
    ...promisesMemberEntries,
  ];
}

import "server-only";

import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";

import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import {
  DEFAULT_PUBLIC_SITE_CONFIG,
  SITE_CONFIG_CACHE_TAG,
  type PublicSiteConfig,
} from "@/lib/site-config-types";

const SITE_CONFIG_ID = "default";

function envConstructionOverride(): boolean {
  const raw = process.env.PUBLIC_UNDER_CONSTRUCTION?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

async function loadSiteConfigFromDb(): Promise<PublicSiteConfig> {
  if (!isDatabaseConfigured()) return DEFAULT_PUBLIC_SITE_CONFIG;
  try {
    const row = await prisma.siteConfig.findUnique({ where: { id: SITE_CONFIG_ID } });
    if (!row) return DEFAULT_PUBLIC_SITE_CONFIG;
    return {
      publicUnderConstruction: row.publicUnderConstruction,
      constructionHeadline: row.constructionHeadline,
      constructionBody: row.constructionBody,
      updatedAt: row.updatedAt.toISOString(),
    };
  } catch {
    return DEFAULT_PUBLIC_SITE_CONFIG;
  }
}

export async function getPublicSiteConfig(): Promise<PublicSiteConfig> {
  if (envConstructionOverride()) {
    return { ...DEFAULT_PUBLIC_SITE_CONFIG, publicUnderConstruction: true };
  }
  if (!isDatabaseConfigured()) return DEFAULT_PUBLIC_SITE_CONFIG;
  return unstable_cache(loadSiteConfigFromDb, ["site-config-row"], {
    tags: [SITE_CONFIG_CACHE_TAG],
    revalidate: 5,
  })();
}

export async function isPublicSiteUnderConstruction(): Promise<boolean> {
  const cfg = await getPublicSiteConfig();
  return cfg.publicUnderConstruction;
}

export async function updatePublicSiteConfig(params: {
  adminId: string;
  publicUnderConstruction: boolean;
  constructionHeadline?: string | null;
  constructionBody?: string | null;
}): Promise<PublicSiteConfig> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const headline =
    params.constructionHeadline === undefined
      ? undefined
      : params.constructionHeadline?.trim().slice(0, 200) || null;
  const body =
    params.constructionBody === undefined ? undefined : params.constructionBody?.trim().slice(0, 4000) || null;

  const row = await prisma.siteConfig.upsert({
    where: { id: SITE_CONFIG_ID },
    create: {
      id: SITE_CONFIG_ID,
      publicUnderConstruction: params.publicUnderConstruction,
      constructionHeadline: headline ?? null,
      constructionBody: body ?? null,
      updatedByAdminId: params.adminId,
    },
    update: {
      publicUnderConstruction: params.publicUnderConstruction,
      ...(headline !== undefined ? { constructionHeadline: headline } : {}),
      ...(body !== undefined ? { constructionBody: body } : {}),
      updatedByAdminId: params.adminId,
    },
  });

  revalidateTag(SITE_CONFIG_CACHE_TAG, "max");

  return {
    publicUnderConstruction: row.publicUnderConstruction,
    constructionHeadline: row.constructionHeadline,
    constructionBody: row.constructionBody,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function ensureSiteConfigRow(): Promise<void> {
  if (!isDatabaseConfigured()) return;
  await prisma.siteConfig.upsert({
    where: { id: SITE_CONFIG_ID },
    create: { id: SITE_CONFIG_ID },
    update: {},
  });
}

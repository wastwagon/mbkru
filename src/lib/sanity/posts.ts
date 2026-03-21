import { sanityClient, isSanityConfigured } from "./client";
import { postBySlugQuery, postSlugsQuery, postsIndexQuery } from "./queries";

export type PostSummary = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: string | null;
  mainImage: unknown;
  _createdAt?: string;
};

export type PostDetail = PostSummary & {
  body: unknown;
  _createdAt?: string;
};

export async function getPostSummaries(): Promise<PostSummary[]> {
  if (!isSanityConfigured()) return [];
  try {
    return await sanityClient.fetch<PostSummary[]>(postsIndexQuery);
  } catch {
    return [];
  }
}

export async function getPostSlugs(): Promise<string[]> {
  if (!isSanityConfigured()) return [];
  try {
    const rows = await sanityClient.fetch<{ slug: string }[]>(postSlugsQuery);
    return rows.map((r) => r.slug).filter(Boolean);
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  if (!isSanityConfigured()) return null;
  try {
    return await sanityClient.fetch<PostDetail | null>(postBySlugQuery, { slug });
  } catch {
    return null;
  }
}

export function formatPostDate(iso: string | null, createdFallback?: string): string {
  const raw = iso || createdFallback;
  if (!raw) return "";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(raw));
  } catch {
    return "";
  }
}

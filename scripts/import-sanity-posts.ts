/**
 * One-off migration: fetch documents from Sanity’s HTTP API and upsert Prisma `Post` (+ optional `Media` from main image).
 *
 * Required env: DATABASE_URL, SANITY_PROJECT_ID
 * Optional: SANITY_DATASET (default production), SANITY_API_READ_TOKEN (private datasets),
 *           SANITY_DOC_TYPE (default post) — must match /^[a-zA-Z0-9_-]+$/
 *
 * Edit buildSanityQuery() if your schema uses different field names (e.g. heroImage instead of mainImage).
 */

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SanityRow = {
  _id: string;
  title?: string;
  slug?: string | null;
  publishedAt?: string | null;
  excerpt?: string | null;
  body?: unknown;
  imageUrl?: string | null;
};

function sanitizeDocType(t: string): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(t)) {
    throw new Error("SANITY_DOC_TYPE must be alphanumeric with _ or - only");
  }
  return t;
}

function portableTextToMarkdown(body: unknown): string {
  if (body == null) return "";
  if (typeof body === "string") return body;
  if (!Array.isArray(body)) return "";

  const lines: string[] = [];
  for (const block of body) {
    if (!block || typeof block !== "object") continue;
    const b = block as Record<string, unknown>;
    if (b._type === "block" && Array.isArray(b.children)) {
      let line = "";
      for (const ch of b.children) {
        if (!ch || typeof ch !== "object") continue;
        const c = ch as Record<string, unknown>;
        if (c._type === "span" && typeof c.text === "string") line += c.text;
      }
      const style = typeof b.style === "string" ? b.style : "normal";
      if (style === "h1") lines.push(`# ${line}`);
      else if (style === "h2") lines.push(`## ${line}`);
      else if (style === "h3") lines.push(`### ${line}`);
      else lines.push(line);
    } else if (b._type === "image") {
      const asset = b.asset as Record<string, unknown> | undefined;
      const url = asset && typeof asset.url === "string" ? asset.url : null;
      if (url) lines.push(`![image](${url})`);
    }
  }
  return lines.filter((l) => l.length > 0).join("\n\n");
}

function buildSanityQuery(docType: string): string {
  return `*[_type == "${docType}"] | order(coalesce(publishedAt, _createdAt) desc) {
    _id,
    title,
    "slug": coalesce(slug.current, slug),
    "publishedAt": coalesce(publishedAt, _createdAt),
    excerpt,
    "body": (coalesce(body, []))[]{
      ...,
      _type == "image" => {
        ...,
        "asset": asset->{ url }
      }
    },
    "imageUrl": mainImage.asset->url
  }`;
}

async function sanityFetch(
  projectId: string,
  dataset: string,
  query: string,
  token?: string,
): Promise<unknown> {
  const u = new URL(`https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}`);
  u.searchParams.set("query", query);
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(u, { headers });
  if (!res.ok) {
    throw new Error(`Sanity API ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as { result?: unknown };
  return data.result;
}

async function downloadToUploads(
  url: string,
  alt: string,
): Promise<{ id: string } | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  const mimeType =
    res.headers.get("content-type")?.split(";")[0]?.trim() || "image/jpeg";
  if (!mimeType.startsWith("image/")) return null;
  const ext = mimeType.includes("png")
    ? ".png"
    : mimeType.includes("webp")
      ? ".webp"
      : mimeType.includes("gif")
        ? ".gif"
        : ".jpg";
  const filename = `${randomUUID()}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);
  const storagePath = `/uploads/${filename}`;
  const media = await prisma.media.create({
    data: {
      filename: `sanity-import${ext}`,
      storagePath,
      mimeType,
      alt: alt.slice(0, 200) || null,
    },
  });
  return { id: media.id };
}

function slugify(s: string): string {
  const base = s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
  return base || "post";
}

function dedupeSlug(seen: Set<string>, base: string): string {
  let s = base;
  let i = 0;
  while (seen.has(s)) {
    i += 1;
    s = `${base}-${i}`;
  }
  seen.add(s);
  return s;
}

async function main() {
  const projectId = process.env.SANITY_PROJECT_ID?.trim();
  const dataset = process.env.SANITY_DATASET?.trim() || "production";
  const token = process.env.SANITY_API_READ_TOKEN?.trim();
  const docType = process.env.SANITY_DOC_TYPE
    ? sanitizeDocType(process.env.SANITY_DOC_TYPE.trim())
    : "post";

  if (!projectId) {
    console.error("Missing SANITY_PROJECT_ID. Set it with your Sanity project id.");
    process.exit(1);
  }

  const query = buildSanityQuery(docType);
  const result = await sanityFetch(projectId, dataset, query, token);
  const rows = result as SanityRow[];

  if (!Array.isArray(rows)) {
    console.error("Unexpected Sanity response:", result);
    process.exit(1);
  }

  const seenSlugs = new Set<string>();
  let ok = 0;

  for (const row of rows) {
    const title = row.title?.trim() || "Untitled";
    const rawSlug =
      typeof row.slug === "string" && row.slug.trim()
        ? row.slug.trim()
        : slugify(`${title}-${row._id.slice(-8)}`);
    const slug = dedupeSlug(seenSlugs, rawSlug);
    const bodyMd = portableTextToMarkdown(row.body);
    const publishedAt = row.publishedAt ? new Date(row.publishedAt) : null;

    let featuredMediaId: string | null | undefined;
    if (row.imageUrl) {
      const media = await downloadToUploads(row.imageUrl, title);
      featuredMediaId = media?.id ?? undefined;
    }

    const data = {
      title,
      excerpt: row.excerpt?.trim() || null,
      body: bodyMd.trim() || "_Imported from Sanity; body was empty._",
      publishedAt,
      ...(featuredMediaId ? { featuredMediaId } : {}),
    };

    await prisma.post.upsert({
      where: { slug },
      create: { slug, ...data },
      update: data,
    });
    ok += 1;
    console.log("Upserted:", slug);
  }

  console.log(`Done. ${ok} document(s) processed.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

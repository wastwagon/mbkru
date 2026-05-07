"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

import { ResourceDocumentCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { randomSlugSuffix, slugifyTitleSegment } from "@/lib/civic/slug";
import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";
import { MalwareScanError, scanUploadedFileOrThrow } from "@/lib/server/upload-malware-scan";

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.oasis.opendocument.text",
  "text/plain",
]);

function extForMime(mime: string, originalName: string): string {
  const fromName = path.extname(originalName).toLowerCase();
  if (fromName.match(/^\.[a-z0-9]{2,8}$/)) return fromName;
  if (mime === "application/pdf") return ".pdf";
  if (mime === "application/msword") return ".doc";
  if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return ".docx";
  if (mime === "application/vnd.oasis.opendocument.text") return ".odt";
  return ".bin";
}

function slugFromTitleOrInput(title: string, slugInput: string): string {
  const manual = slugInput
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  if (manual.length >= 2 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manual)) return manual;
  const fromTitle = slugifyTitleSegment(title).slice(0, 100);
  return fromTitle.length > 0 ? fromTitle : "document";
}

async function allocateUniqueResourceSlug(base: string): Promise<string> {
  let candidate = base.slice(0, 120) || "document";
  for (let attempt = 0; attempt < 24; attempt++) {
    const clash = await prisma.resourceDocument.findUnique({ where: { slug: candidate } });
    if (!clash) return candidate;
    candidate = `${base.slice(0, 72)}-${randomSlugSuffix()}`;
  }
  throw new Error("Could not allocate unique slug");
}

function parseCategory(raw: unknown): ResourceDocumentCategory {
  const s = typeof raw === "string" ? raw.trim().toUpperCase() : "";
  if (s === "REPORTS" || s === "POLICY_BRIEFS" || s === "RESEARCH" || s === "OTHER") {
    return s as ResourceDocumentCategory;
  }
  return ResourceDocumentCategory.OTHER;
}

export async function createResourceDocumentAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const summaryRaw = String(formData.get("summary") ?? "").trim();
  const summary = summaryRaw.length > 0 ? summaryRaw.slice(0, 600) : null;
  const category = parseCategory(formData.get("category"));
  const publishNow = formData.get("publishNow") === "on";
  const sortOrderRaw = Number.parseInt(String(formData.get("sortOrder") ?? "0"), 10);
  const sortOrder = Number.isFinite(sortOrderRaw) ? Math.min(999_999, Math.max(0, sortOrderRaw)) : 0;

  const file = formData.get("file");
  if (!title || title.length < 2 || !(file instanceof File) || file.size === 0) return;
  if (file.size > MAX_BYTES) return;
  if (!ALLOWED_MIME.has(file.type)) return;

  const baseSlug = slugFromTitleOrInput(title, slugInput);
  const slug = await allocateUniqueResourceSlug(baseSlug);

  const ext = extForMime(file.type, file.name);
  const diskName = `${randomUUID()}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "resources");
  await mkdir(uploadDir, { recursive: true });
  const diskPath = path.join(uploadDir, diskName);
  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    await scanUploadedFileOrThrow(buffer, "admin-resource");
  } catch (err) {
    if (err instanceof MalwareScanError) {
      console.error("[admin/resources] malware scan blocked upload", {
        reason: err.code,
        message: err.message,
      });
      return;
    }
    throw err;
  }
  await writeFile(diskPath, buffer);

  const filePath = `/uploads/resources/${diskName}`;
  const publishedAt = publishNow ? new Date() : null;

  try {
    await prisma.resourceDocument.create({
      data: {
        title: title.slice(0, 240),
        slug,
        summary,
        category,
        filePath,
        originalFilename: file.name.slice(0, 280),
        mimeType: file.type.slice(0, 120),
        fileSize: file.size,
        publishedAt,
        sortOrder,
      },
    });
  } catch (e) {
    try {
      await unlink(diskPath);
    } catch {
      /* ignore */
    }
    console.error("[admin/resources] create failed", e);
    return;
  }

  revalidatePath("/admin/resources");
  revalidatePath("/resources", "layout");
  if (publishedAt) {
    revalidatePath(`/resources/${slug}`);
  }
}

export async function publishResourceDocumentAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const updated = await prisma.resourceDocument.update({
    where: { id },
    data: { publishedAt: new Date() },
    select: { slug: true },
  });
  revalidatePath("/admin/resources");
  revalidatePath("/resources", "layout");
  revalidatePath(`/resources/${updated.slug}`);
}

export async function unpublishResourceDocumentAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const existing = await prisma.resourceDocument.findUnique({
    where: { id },
    select: { slug: true },
  });
  if (!existing) return;
  await prisma.resourceDocument.update({
    where: { id },
    data: { publishedAt: null },
  });
  revalidatePath("/admin/resources");
  revalidatePath("/resources", "layout");
  revalidatePath(`/resources/${existing.slug}`);
}

export async function deleteResourceDocumentAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const row = await prisma.resourceDocument.findUnique({ where: { id } });
  if (!row) return;

  await prisma.resourceDocument.delete({ where: { id } });

  const relative = row.filePath.replace(/^\//, "");
  const abs = path.join(process.cwd(), "public", relative);
  try {
    await unlink(abs);
  } catch {
    /* file may already be missing */
  }

  revalidatePath("/admin/resources");
  revalidatePath("/resources", "layout");
  revalidatePath(`/resources/${row.slug}`);
}

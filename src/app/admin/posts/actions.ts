"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

export async function savePostAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") || "").trim() || undefined;
  const title = String(formData.get("title") || "").trim();
  let slug = String(formData.get("slug") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim() || null;
  const body = String(formData.get("body") || "");
  const published = formData.get("published") === "on";
  const featuredRaw = String(formData.get("featuredMediaId") || "").trim();
  const featuredMediaId = featuredRaw || null;

  if (!title || !body) {
    throw new Error("Title and body are required.");
  }
  if (!slug) slug = slugify(title);
  if (!slug) throw new Error("Could not derive slug.");

  const publishedAt = published ? new Date() : null;

  try {
    if (id) {
      await prisma.post.update({
        where: { id },
        data: {
          title,
          slug,
          excerpt,
          body,
          publishedAt,
          featuredMediaId,
        },
      });
    } else {
      await prisma.post.create({
        data: {
          title,
          slug,
          excerpt,
          body,
          publishedAt,
          featuredMediaId,
        },
      });
    }
  } catch (e) {
    console.error(e);
    throw new Error("Save failed (check slug is unique).");
  }

  revalidatePath("/news");
  revalidatePath(`/news/${slug}`);
  redirect("/admin/posts");
}

export async function deletePostAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "").trim();
  if (!id) throw new Error("Missing id.");
  await prisma.post.delete({ where: { id } });
  revalidatePath("/news");
  redirect("/admin/posts");
}

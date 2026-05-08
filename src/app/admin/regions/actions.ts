"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";

const cuid = z.string().cuid();

const regionSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .min(2)
  .max(80);

const createSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: regionSlugSchema,
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
});

const updateSchema = z.object({
  id: cuid,
  name: z.string().trim().min(2).max(120),
  slug: regionSlugSchema,
  sortOrder: z.coerce.number().int().min(0).max(9999),
});

export async function createRegionAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sortOrder: formData.get("sortOrder") ?? undefined,
  });
  if (!parsed.success) return;

  const maxRow = await prisma.region.aggregate({ _max: { sortOrder: true } });
  const nextOrder = parsed.data.sortOrder ?? (maxRow._max.sortOrder ?? 0) + 1;

  try {
    await prisma.region.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        sortOrder: nextOrder,
      },
    });
  } catch {
    return;
  }

  revalidatePath("/admin/regions");
  revalidatePath("/admin/town-halls");
  revalidatePath("/admin/communities");
}

export async function updateRegionAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    sortOrder: formData.get("sortOrder"),
  });
  if (!parsed.success) return;

  const exists = await prisma.region.findUnique({ where: { id: parsed.data.id }, select: { id: true } });
  if (!exists) return;

  try {
    await prisma.region.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        sortOrder: parsed.data.sortOrder,
      },
    });
  } catch {
    return;
  }

  revalidatePath("/admin/regions");
  revalidatePath("/admin/town-halls");
  revalidatePath("/admin/communities");
}

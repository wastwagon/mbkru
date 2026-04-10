"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";

import type { PetitionStatus } from "@prisma/client";

const STATUSES: PetitionStatus[] = ["OPEN", "CLOSED", "ARCHIVED"];

export async function updatePetitionStatusAction(formData: FormData) {
  await requireAdminSession();

  const id = formData.get("id");
  const statusRaw = formData.get("status");
  if (typeof id !== "string" || !id) {
    redirect("/admin/petitions?error=invalid");
  }
  if (typeof statusRaw !== "string" || !STATUSES.includes(statusRaw as PetitionStatus)) {
    redirect("/admin/petitions?error=invalid");
  }
  const status = statusRaw as PetitionStatus;

  const p = await prisma.petition.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });
  if (!p) {
    redirect("/admin/petitions?error=notfound");
  }

  await prisma.petition.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/petitions");
  revalidatePath(`/petitions/${p.slug}`);
  revalidatePath("/admin/petitions");

  redirect("/admin/petitions?saved=1");
}

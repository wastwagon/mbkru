"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";
import {
  publicCauseSlugField,
  publicCauseSummaryField,
  publicCauseTitleField,
} from "@/lib/validation/civic-engagement";

export async function updatePublicCauseThreadAction(formData: FormData) {
  await requireAdminSession();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) redirect("/admin/reports?error=invalid");

  const slugRaw = formData.get("publicCauseSlug");
  const titleRaw = formData.get("publicCauseTitle");
  const summaryRaw = formData.get("publicCauseSummary");
  const publish = formData.get("publish") === "on";
  const close = formData.get("close") === "on";
  const unpublish = formData.get("unpublish") === "on";

  const report = await prisma.citizenReport.findUnique({
    where: { id },
    select: {
      id: true,
      publicCauseSlug: true,
    },
  });
  if (!report) redirect("/admin/reports?error=notfound");

  if (unpublish) {
    await prisma.citizenReport.update({
      where: { id },
      data: {
        publicCauseSlug: null,
        publicCauseTitle: null,
        publicCauseSummary: null,
        publicCauseOpenedAt: null,
        publicCauseClosed: false,
      },
    });
    revalidatePath("/citizens-voice/causes");
    if (report.publicCauseSlug) {
      revalidatePath(`/citizens-voice/causes/${report.publicCauseSlug}`);
    }
    redirect(`/admin/reports/${id}?saved=cause`);
  }

  const slugParsed = publicCauseSlugField.safeParse(
    typeof slugRaw === "string" ? slugRaw : "",
  );
  const titleParsed = publicCauseTitleField.safeParse(
    typeof titleRaw === "string" ? titleRaw : "",
  );
  const summaryParsed = publicCauseSummaryField.safeParse(
    typeof summaryRaw === "string" ? summaryRaw : "",
  );

  if (!slugParsed.success || !titleParsed.success || !summaryParsed.success) {
    redirect(`/admin/reports/${id}?error=cause_invalid`);
  }

  const slug = slugParsed.data.toLowerCase();
  const clash = await prisma.citizenReport.findFirst({
    where: {
      publicCauseSlug: slug,
      NOT: { id },
    },
    select: { id: true },
  });
  if (clash) {
    redirect(`/admin/reports/${id}?error=cause_slug_clash`);
  }

  const before = await prisma.citizenReport.findUnique({
    where: { id },
    select: { publicCauseOpenedAt: true },
  });

  await prisma.citizenReport.update({
    where: { id },
    data: {
      publicCauseSlug: slug,
      publicCauseTitle: titleParsed.data,
      publicCauseSummary: summaryParsed.data,
      publicCauseClosed: close,
      ...(publish && !before?.publicCauseOpenedAt ? { publicCauseOpenedAt: new Date() } : {}),
    },
  });

  revalidatePath("/citizens-voice/causes");
  revalidatePath(`/citizens-voice/causes/${slug}`);
  redirect(`/admin/reports/${id}?saved=cause`);
}

export async function hidePublicCauseCommentAction(formData: FormData) {
  await requireAdminSession();

  const commentId = formData.get("commentId");
  const reportId = formData.get("reportId");
  if (typeof commentId !== "string" || typeof reportId !== "string") {
    redirect("/admin/reports?error=invalid");
  }

  await prisma.citizenReportPublicComment.updateMany({
    where: { id: commentId, reportId },
    data: { status: "HIDDEN" },
  });

  const r = await prisma.citizenReport.findUnique({
    where: { id: reportId },
    select: { publicCauseSlug: true },
  });
  revalidatePath("/citizens-voice/causes");
  if (r?.publicCauseSlug) revalidatePath(`/citizens-voice/causes/${r.publicCauseSlug}`);

  redirect(`/admin/reports/${reportId}?saved=comment`);
}

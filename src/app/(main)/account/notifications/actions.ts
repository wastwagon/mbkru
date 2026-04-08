"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getMemberSession } from "@/lib/member/session";
import { markMemberNotificationsRead } from "@/lib/server/member-notification-read";

export async function markOneNotificationReadAction(formData: FormData): Promise<void> {
  const session = await getMemberSession();
  if (!session) return;

  const id = z.string().cuid().safeParse(formData.get("notificationId"));
  if (!id.success) return;

  await markMemberNotificationsRead(session.memberId, { notificationId: id.data });
  revalidatePath("/account/notifications");
  revalidatePath("/account");
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const session = await getMemberSession();
  if (!session) return;

  await markMemberNotificationsRead(session.memberId, { markAllRead: true });
  revalidatePath("/account/notifications");
  revalidatePath("/account");
}

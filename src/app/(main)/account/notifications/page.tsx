import Link from "next/link";

import {
  markAllNotificationsReadAction,
  markOneNotificationReadAction,
} from "@/app/(main)/account/notifications/actions";
import {
  memberNotificationHref,
  memberNotificationSummary,
} from "@/lib/member/notification-labels";
import { prisma } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/member/session";

export const dynamic = "force-dynamic";

export default async function AccountNotificationsPage() {
  const session = await getMemberSession();
  if (!session) return null;

  const notifications = await prisma.memberNotification.findMany({
    where: { memberId: session.memberId },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      type: true,
      payload: true,
      readAt: true,
      createdAt: true,
    },
  });

  const unreadCount = notifications.filter((n) => n.readAt == null).length;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--muted-foreground)]">
            <Link href="/account" className="text-[var(--primary)] hover:underline">
              ← Your account
            </Link>
          </p>
          <h1 className="mt-3 font-display text-2xl font-bold text-[var(--foreground)]">Notifications</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Updates from communities and moderation. Unread: {unreadCount}.
          </p>
        </div>
        {unreadCount > 0 ? (
          <form action={markAllNotificationsReadAction}>
            <button
              type="submit"
              className="rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
            >
              Mark all read
            </button>
          </form>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <p className="mt-10 text-sm text-[var(--muted-foreground)]">No notifications yet.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {notifications.map((n) => {
            const href = memberNotificationHref(n.type, n.payload);
            const unread = n.readAt == null;
            return (
              <li
                key={n.id}
                className={`rounded-xl border border-[var(--border)] p-4 ${
                  unread ? "bg-[var(--section-light)]/60" : "bg-white"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${unread ? "font-semibold text-[var(--foreground)]" : "text-[var(--foreground)]"}`}>
                      {memberNotificationSummary(n.type, n.payload)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {n.createdAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                    {href ? (
                      <p className="mt-2">
                        <Link href={href} className="text-sm font-medium text-[var(--primary)] hover:underline">
                          Open community
                        </Link>
                      </p>
                    ) : null}
                  </div>
                  {unread ? (
                    <form action={markOneNotificationReadAction}>
                      <input type="hidden" name="notificationId" value={n.id} />
                      <button
                        type="submit"
                        className="shrink-0 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--muted)]"
                      >
                        Mark read
                      </button>
                    </form>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

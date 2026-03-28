import Link from "next/link";
import { notFound } from "next/navigation";

import {
  createCampaignPromiseAction,
  updateCampaignPromiseStatusAction,
} from "@/app/admin/parliament/actions";
import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";

import type { PromiseStatus } from "@prisma/client";

const STATUS_OPTIONS: { value: PromiseStatus; label: string }[] = [
  { value: "TRACKING", label: "Tracking" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "FULFILLED", label: "Fulfilled" },
  { value: "BROKEN", label: "Broken" },
  { value: "DEFERRED", label: "Deferred" },
];

type Props = { params: Promise<{ id: string }> };

export default async function AdminParliamentMemberPage({ params }: Props) {
  await requireAdminSession();
  const { id } = await params;

  const member = await prisma.parliamentMember.findUnique({
    where: { id },
    include: {
      constituency: true,
      promises: { orderBy: { updatedAt: "desc" } },
    },
  });

  if (!member) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-sm text-[var(--muted-foreground)]">
        <Link href="/admin/parliament" className="text-[var(--primary)] hover:underline">
          ← Parliament &amp; promises
        </Link>
      </p>

      <h1 className="mt-4 font-display text-2xl font-bold text-[var(--foreground)]">{member.name}</h1>
      <dl className="mt-2 grid gap-1 text-sm text-[var(--muted-foreground)]">
        <div>
          <dt className="inline font-medium text-[var(--foreground)]">Slug: </dt>
          <dd className="inline font-mono">{member.slug}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-[var(--foreground)]">Role: </dt>
          <dd className="inline">{member.role}</dd>
        </div>
        {member.party ? (
          <div>
            <dt className="inline font-medium text-[var(--foreground)]">Party: </dt>
            <dd className="inline">{member.party}</dd>
          </div>
        ) : null}
        {member.constituency ? (
          <div>
            <dt className="inline font-medium text-[var(--foreground)]">Constituency: </dt>
            <dd className="inline">{member.constituency.name}</dd>
          </div>
        ) : null}
        <div>
          <dt className="inline font-medium text-[var(--foreground)]">Active: </dt>
          <dd className="inline">{member.active ? "Yes" : "No"}</dd>
        </div>
      </dl>

      <section className="mt-10 rounded-xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Add campaign promise</h2>
        <form action={createCampaignPromiseAction} className="mt-4 space-y-3">
          <input type="hidden" name="memberId" value={member.id} />
          <div>
            <label htmlFor="title" className="block text-xs font-medium text-[var(--foreground)]">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              minLength={3}
              maxLength={500}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-xs font-medium text-[var(--foreground)]">
              Description <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              maxLength={50000}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="sourceLabel" className="block text-xs font-medium text-[var(--foreground)]">
              Source (e.g. manifesto page, speech date)
            </label>
            <input
              id="sourceLabel"
              name="sourceLabel"
              required
              maxLength={200}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="sourceDate" className="block text-xs font-medium text-[var(--foreground)]">
              Source date <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
            </label>
            <input
              id="sourceDate"
              name="sourceDate"
              type="date"
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm sm:max-w-xs"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-xs font-medium text-[var(--foreground)]">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue="TRACKING"
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm sm:max-w-xs"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
          >
            Save promise
          </button>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Promises</h2>
        {member.promises.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">None yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {member.promises.map((p) => (
              <li key={p.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <p className="font-medium text-[var(--foreground)]">{p.title}</p>
                {p.description ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--muted-foreground)]">
                    {p.description}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  {p.sourceLabel}
                  {p.sourceDate
                    ? ` · ${p.sourceDate.toLocaleDateString("en-GB", { dateStyle: "medium" })}`
                    : ""}
                </p>
                <form action={updateCampaignPromiseStatusAction} className="mt-3 flex flex-wrap items-end gap-2">
                  <input type="hidden" name="promiseId" value={p.id} />
                  <input type="hidden" name="memberId" value={member.id} />
                  <label htmlFor={`st-${p.id}`} className="sr-only">
                    Status for {p.title}
                  </label>
                  <select
                    id={`st-${p.id}`}
                    name="status"
                    defaultValue={p.status}
                    className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]"
                  >
                    Update status
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

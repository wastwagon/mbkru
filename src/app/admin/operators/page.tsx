import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/db/prisma";

import {
  changeOwnAdminPasswordAction,
  createAdminOperatorAction,
  setAdminOperatorActiveAction,
  setAdminOperatorPasswordAction,
} from "./actions";

type Props = {
  searchParams?: Promise<{ saved?: string; error?: string }>;
};

export default async function AdminOperatorsPage({ searchParams }: Props) {
  const session = await requireAdminSession();
  const sp = (await searchParams) ?? {};

  const admins = await prisma.admin.findMany({
    orderBy: { email: "asc" },
    select: { id: true, email: true, active: true, createdAt: true },
  });

  return (
    <AdminPageContainer width="narrow">
      <AdminPageHeader
        title="Operators"
        description="Admin sign-ins for this deployment. Disabling an account blocks login immediately. Use strong unique passwords (12+ characters)."
      />

      {sp.saved === "created" ? (
        <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900" role="status">
          New operator created.
        </p>
      ) : null}
      {sp.saved === "status" ? (
        <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900" role="status">
          Access status updated.
        </p>
      ) : null}
      {sp.saved === "password" ? (
        <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900" role="status">
          Operator password reset.
        </p>
      ) : null}
      {sp.saved === "own" ? (
        <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900" role="status">
          Your password was updated.
        </p>
      ) : null}

      {sp.error === "invalid" ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          Check the form fields and try again.
        </p>
      ) : null}
      {sp.error === "mismatch" ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          New passwords do not match.
        </p>
      ) : null}
      {sp.error === "duplicate" ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          That email is already registered.
        </p>
      ) : null}
      {sp.error === "last_active" ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          Keep at least one active operator.
        </p>
      ) : null}
      {sp.error === "notfound" ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          Operator not found.
        </p>
      ) : null}
      {sp.error === "current" ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          Current password was incorrect.
        </p>
      ) : null}

      <section className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Add operator</h2>
        <form action={createAdminOperatorAction} className="mt-4 grid max-w-xl gap-3">
          <div>
            <label htmlFor="email" className="block text-xs font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="off"
              required
              maxLength={320}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={200}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="passwordConfirm" className="block text-xs font-medium">
              Confirm password
            </label>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={200}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-fit rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
          >
            Create operator
          </button>
        </form>
      </section>

      <section className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Change your password</h2>
        <form action={changeOwnAdminPasswordAction} className="mt-4 grid max-w-xl gap-3">
          <div>
            <label htmlFor="currentPassword" className="block text-xs font-medium">
              Current password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="ownNew" className="block text-xs font-medium">
              New password
            </label>
            <input
              id="ownNew"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={200}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="ownConfirm" className="block text-xs font-medium">
              Confirm new password
            </label>
            <input
              id="ownConfirm"
              name="passwordConfirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={200}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-fit rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-5 py-2.5 text-sm font-semibold hover:bg-[var(--muted)]"
          >
            Update my password
          </button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">All operators</h2>
        <ul className="mt-4 space-y-8">
          {admins.map((a) => (
            <li key={a.id} className="rounded-2xl border border-[var(--border)] bg-white p-5">
              <p className="font-medium text-[var(--foreground)]">{a.email}</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Added {a.createdAt.toLocaleString("en-GB")}
                {a.id === session.adminId ? " · you" : ""}
                {!a.active ? " · disabled" : ""}
              </p>

              <form action={setAdminOperatorActiveAction} className="mt-4 flex flex-wrap items-center gap-2">
                <input type="hidden" name="adminId" value={a.id} />
                <label htmlFor={`active-${a.id}`} className="text-xs font-medium text-[var(--muted-foreground)]">
                  Access
                </label>
                <select id={`active-${a.id}`} name="active" defaultValue={a.active ? "1" : "0"} className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm">
                  <option value="1">Active</option>
                  <option value="0">Disabled</option>
                </select>
                <button type="submit" className="rounded-lg border border-[var(--border)] bg-[var(--section-light)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--muted)]">
                  Save access
                </button>
              </form>

              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-[var(--primary)]">Reset password (another operator)</summary>
                <form action={setAdminOperatorPasswordAction} className="mt-3 grid max-w-xl gap-2 border-t border-[var(--border)] pt-3">
                  <input type="hidden" name="adminId" value={a.id} />
                  <div>
                    <label className="block text-xs font-medium" htmlFor={`pw-${a.id}`}>
                      New password
                    </label>
                    <input
                      id={`pw-${a.id}`}
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      minLength={12}
                      maxLength={200}
                      required
                      className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium" htmlFor={`pwc-${a.id}`}>
                      Confirm
                    </label>
                    <input
                      id={`pwc-${a.id}`}
                      name="passwordConfirm"
                      type="password"
                      autoComplete="new-password"
                      minLength={12}
                      maxLength={200}
                      required
                      className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                    />
                  </div>
                  <button type="submit" className="w-fit rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--primary-dark)]">
                    Apply new password
                  </button>
                </form>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </AdminPageContainer>
  );
}

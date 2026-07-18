"use client";

import { updateQueenMotherPortraitAction } from "@/app/admin/communities/actions";
import { AdminMediaField, type AdminMediaFieldValue } from "@/components/admin/AdminMediaField";

export function QueenMotherPortraitEditor({
  membershipId,
  communityId,
  memberLabel,
  initial,
}: {
  membershipId: string;
  communityId: string;
  memberLabel: string;
  initial: AdminMediaFieldValue | null;
}) {
  return (
    <form action={updateQueenMotherPortraitAction} className="mt-4 rounded-xl border border-[var(--accent-gold)]/30 bg-[var(--accent-gold-light)]/40 p-4">
      <input type="hidden" name="membershipId" value={membershipId} />
      <input type="hidden" name="communityId" value={communityId} />
      <AdminMediaField
        name="portraitMediaId"
        label={`Queen Mother portrait — ${memberLabel}`}
        help="Shown on the public community page. Public library images only. Cleared automatically if this member loses the verified Queen Mother role."
        initial={initial}
      />
      <button
        type="submit"
        className="mt-3 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
      >
        Save portrait
      </button>
    </form>
  );
}

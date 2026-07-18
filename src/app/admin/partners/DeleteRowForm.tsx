"use client";

import { adminQueueActionDeleteClass } from "@/lib/admin/admin-ui-classes";

/** Confirm-guarded delete button for partner / leadership / endorsement rows. */
export function DeleteRowForm({
  action,
  id,
  confirmMessage,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  confirmMessage: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={adminQueueActionDeleteClass}>
        Delete
      </button>
    </form>
  );
}

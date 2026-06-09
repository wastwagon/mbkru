"use client";

import { adminQueueActionDeleteClass } from "@/lib/admin/admin-ui-classes";
import { deleteResourceDocumentAction } from "@/app/admin/resources/actions";

export function DeleteResourceDocumentForm({ id }: { id: string }) {
  return (
    <form
      action={deleteResourceDocumentAction}
      onSubmit={(e) => {
        if (!confirm("Delete this document and file permanently?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className={adminQueueActionDeleteClass}
      >
        Delete
      </button>
    </form>
  );
}

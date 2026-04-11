"use client";

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
        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-900 hover:bg-red-100"
      >
        Delete
      </button>
    </form>
  );
}

"use client";

import { useRef, useState } from "react";

import { ConfirmDialog } from "@/components/ui/Dialog";
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
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <form ref={formRef} action={action}>
        <input type="hidden" name="id" value={id} />
        <button type="button" className={adminQueueActionDeleteClass} onClick={() => setOpen(true)}>
          Delete
        </button>
      </form>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          formRef.current?.requestSubmit();
        }}
        title="Delete this row?"
        description={confirmMessage}
        confirmLabel="Delete"
        destructive
      />
    </>
  );
}

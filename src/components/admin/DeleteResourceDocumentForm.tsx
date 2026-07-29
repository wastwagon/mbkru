"use client";

import { useRef, useState } from "react";

import { deleteResourceDocumentAction } from "@/app/admin/resources/actions";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { adminQueueActionDeleteClass } from "@/lib/admin/admin-ui-classes";

export function DeleteResourceDocumentForm({ id }: { id: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <form ref={formRef} action={deleteResourceDocumentAction}>
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
        title="Delete this document?"
        description="Delete this document and file permanently? This cannot be undone."
        confirmLabel="Delete"
        destructive
      />
    </>
  );
}

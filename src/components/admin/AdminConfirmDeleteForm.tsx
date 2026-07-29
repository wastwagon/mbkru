"use client";

import { useRef, useState, type ReactNode } from "react";

import { ConfirmDialog } from "@/components/ui/Dialog";
import { adminQueueActionDeleteClass } from "@/lib/admin/admin-ui-classes";

type Props = {
  action: (formData: FormData) => Promise<void>;
  /** Hidden fields (e.g. id). */
  hiddenFields?: Record<string, string>;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  buttonLabel?: string;
  /** Use text-style delete control instead of bordered queue action. */
  variant?: "button" | "text";
  textClassName?: string;
};

/** Shared ConfirmDialog-guarded delete submit for admin CMS. */
export function AdminConfirmDeleteForm({
  action,
  hiddenFields = {},
  title,
  description,
  confirmLabel = "Delete",
  buttonLabel = "Delete",
  variant = "button",
  textClassName = "text-sm font-semibold text-red-600",
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <form ref={formRef} action={action}>
        {Object.entries(hiddenFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <button
          type="button"
          className={variant === "button" ? adminQueueActionDeleteClass : textClassName}
          onClick={() => setOpen(true)}
        >
          {buttonLabel}
        </button>
      </form>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          formRef.current?.requestSubmit();
        }}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        destructive
      />
    </>
  );
}

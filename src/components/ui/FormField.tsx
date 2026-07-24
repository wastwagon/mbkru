import type { ReactNode } from "react";

import {
  fieldErrorClass,
  fieldHintClass,
  fieldLabelClass,
} from "@/lib/ui/field-styles";

export type FormFieldProps = {
  label?: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  /** Shows a red asterisk after the label. */
  required?: boolean;
  /** Shows muted “(optional)” after the label. */
  optional?: boolean;
  children: ReactNode;
  className?: string;
};

/**
 * Label + control + hint/error shell (Untitled UI Input field layout).
 * Pass an Input, Textarea, Select, or PasswordInput as children.
 */
export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  optional,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={className || undefined}>
      {label != null && label !== "" ? (
        <label htmlFor={htmlFor} className={fieldLabelClass}>
          {label}
          {required ? <span className="text-red-600"> *</span> : null}
          {optional ? (
            <span className="font-normal text-[var(--foreground-secondary)]"> (optional)</span>
          ) : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className={fieldErrorClass} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className={fieldHintClass}>{hint}</p>
      ) : null}
    </div>
  );
}

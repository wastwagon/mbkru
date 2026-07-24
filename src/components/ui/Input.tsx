import type { InputHTMLAttributes } from "react";

import { fieldControlClass, type FieldDensity } from "@/lib/ui/field-styles";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  density?: FieldDensity;
  /** Marks the control invalid (red border + aria-invalid). */
  invalid?: boolean;
};

export function Input({
  density = "public",
  invalid = false,
  className = "",
  ...props
}: InputProps) {
  return (
    <input
      className={`${fieldControlClass({ density, invalid })} ${className}`.trim()}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

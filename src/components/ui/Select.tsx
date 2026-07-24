import type { SelectHTMLAttributes } from "react";

import { selectControlClass, type FieldDensity } from "@/lib/ui/field-styles";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  density?: FieldDensity;
  invalid?: boolean;
};

export function Select({
  density = "public",
  invalid = false,
  className = "",
  children,
  ...props
}: SelectProps) {
  return (
    <select
      className={`${selectControlClass({ density, invalid })} ${className}`.trim()}
      aria-invalid={invalid || undefined}
      {...props}
    >
      {children}
    </select>
  );
}

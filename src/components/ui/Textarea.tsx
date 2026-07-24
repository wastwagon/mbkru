import type { TextareaHTMLAttributes } from "react";

import { fieldControlClass, type FieldDensity } from "@/lib/ui/field-styles";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  density?: FieldDensity;
  invalid?: boolean;
};

export function Textarea({
  density = "public",
  invalid = false,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={`${fieldControlClass({ density, invalid })} min-h-[100px] resize-y ${className}`.trim()}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

import type { ReactNode } from "react";

type AdminTdProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

/** Table cell with `data-label` for stacked mobile card layout inside `AdminTablePanel`. */
export function AdminTd({ label, children, className = "" }: AdminTdProps) {
  return (
    <td data-label={label} className={className}>
      {children}
    </td>
  );
}

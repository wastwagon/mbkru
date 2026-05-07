import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Shared bordered section shell for admin content blocks. */
export function AdminSectionCard({ children, className = "" }: Props) {
  return (
    <section className={`rounded-xl border border-[var(--border)] bg-white p-5 ${className}`.trim()}>
      {children}
    </section>
  );
}

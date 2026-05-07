type Props = {
  message: string;
  className?: string;
};

/** Small muted empty-state text for admin panels and lists. */
export function AdminEmptyState({ message, className = "" }: Props) {
  return <p className={`text-sm text-[var(--muted-foreground)] ${className}`.trim()}>{message}</p>;
}

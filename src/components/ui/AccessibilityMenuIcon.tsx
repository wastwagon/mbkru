/**
 * International symbol of access — used in header to open accessibility & voice tools.
 * Kept in one file so the header and floating control stay consistent.
 */
export function AccessibilityMenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      aria-hidden
    >
      <circle cx="12" cy="4.75" r="1.85" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.3 9.2h13.4M12 8.2v11.4M8.8 19.6l3.2-5.2 3.2 5.2M8.6 9.2l1.6 4.1M15.4 9.2l-1.6 4.1"
      />
    </svg>
  );
}

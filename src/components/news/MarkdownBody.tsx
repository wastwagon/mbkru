import ReactMarkdown from "react-markdown";

import { prosePrimaryAnchorClass } from "@/lib/primary-link-styles";

export function MarkdownBody({ content }: { content: string }) {
  if (!content.trim()) return null;
  return (
    <div
      className={`prose prose-slate max-w-none prose-headings:font-display prose-headings:text-[var(--foreground)] prose-p:text-[var(--muted-foreground)] prose-li:text-[var(--muted-foreground)] ${prosePrimaryAnchorClass} prose-img:rounded-2xl`}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

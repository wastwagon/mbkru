import ReactMarkdown from "react-markdown";

export function MarkdownBody({ content }: { content: string }) {
  if (!content.trim()) return null;
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:text-[var(--foreground)] prose-p:text-[var(--muted-foreground)] prose-li:text-[var(--muted-foreground)] prose-a:text-[var(--primary)] prose-img:rounded-2xl">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

import { PortableText, type PortableTextComponents } from "next-sanity";

import { urlForImage } from "@/lib/sanity/image";

const components: Partial<PortableTextComponents> = {
  types: {
    image: ({ value }) => {
      const url = urlForImage(value, 1000);
      if (!url) return null;
      return (
        <figure className="my-8">
          {/* eslint-disable-next-line @next/next/no-img-element -- Sanity CDN URLs */}
          <img src={url} alt="" className="w-full rounded-2xl shadow-md" />
        </figure>
      );
    },
  },
};

export function ArticleBody({ body }: { body: unknown }) {
  if (!body || !Array.isArray(body) || body.length === 0) return null;
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:text-[var(--foreground)] prose-p:text-[var(--muted-foreground)] prose-li:text-[var(--muted-foreground)] prose-a:text-[var(--primary)]">
      <PortableText value={body} components={components} />
    </div>
  );
}

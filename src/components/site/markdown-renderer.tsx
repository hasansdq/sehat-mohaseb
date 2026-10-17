"use client";

import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

// Renders markdown content (from the RichTextEditor) with proper styling.
// Supports headings, lists, images, links, bold/italic, blockquotes.
export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <article
      className="prose-article text-foreground/85 leading-loose text-base sm:text-lg"
      style={{ fontFamily: "inherit" }}
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground mt-8 mb-4 leading-tight">{children}</h1>,
          h2: ({ children }) => <h2 className="font-display text-xl sm:text-2xl font-extrabold text-foreground mt-6 mb-3 leading-tight">{children}</h2>,
          h3: ({ children }) => <h3 className="font-display text-lg sm:text-xl font-extrabold text-foreground mt-5 mb-2">{children}</h3>,
          h4: ({ children }) => <h4 className="font-display text-base sm:text-lg font-bold text-foreground mt-4 mb-2">{children}</h4>,
          p: ({ children }) => <p className="my-3 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pr-6 my-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pr-6 my-3 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => <blockquote className="border-r-4 border-primary/40 pr-4 my-4 italic text-muted-foreground">{children}</blockquote>,
          img: ({ src, alt }) => <img src={src as string} alt={alt as string} className="w-full rounded-2xl my-4 border border-border/40" loading="lazy" />,
          a: ({ href, children }) => <a href={href as string} target="_blank" rel="noreferrer" className="text-primary underline hover:text-primary/80">{children}</a>,
          strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          hr: () => <hr className="my-6 border-border/40" />,
          code: ({ children }) => <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{children}</code>,
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}

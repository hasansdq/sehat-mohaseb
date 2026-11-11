"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Renders markdown content (from the RichTextEditor) with proper styling.
// Supports headings, lists, images, links, bold/italic, blockquotes,
// tables (via remark-gfm), and code blocks with language labels.
export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <article
      className="prose-article text-foreground/85 leading-loose text-base sm:text-lg"
      style={{ fontFamily: "inherit" }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground mt-10 mb-4 leading-tight relative pr-4 border-r-4 border-primary">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-foreground mt-8 mb-3 leading-tight scroll-mt-24 relative pr-3 before:content-[''] before:absolute before:right-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1 before:rounded-full before:bg-gradient-brand">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-display text-lg sm:text-xl font-extrabold text-foreground mt-6 mb-2 scroll-mt-24">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="font-display text-base sm:text-lg font-bold text-foreground mt-5 mb-2 scroll-mt-24">
              {children}
            </h4>
          ),
          p: ({ children }) => <p className="my-4 leading-relaxed">{children}</p>,
          ul: ({ children }) => (
            <ul className="ul-custom my-4 space-y-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="ol-custom my-4 space-y-2">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="relative border-r-4 border-primary/50 pr-5 my-5 py-2 italic text-muted-foreground bg-primary/5 rounded-l-xl">
              <span className="absolute -top-2 right-3 text-3xl text-primary/30 font-display" aria-hidden>»</span>
              {children}
            </blockquote>
          ),
          img: ({ src, alt }) => (
            <figure className="my-6">
              <img
                src={src as string}
                alt={alt as string}
                className="w-full rounded-2xl my-0 border border-border/40 shadow-lg"
                loading="lazy"
              />
              {alt && (
                <figcaption className="mt-2 text-center text-xs text-muted-foreground italic">
                  {alt}
                </figcaption>
              )}
            </figure>
          ),
          a: ({ href, children }) => (
            <a
              href={href as string}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-4 hover:text-primary/80 transition-colors font-semibold"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-foreground bg-primary/10 px-0.5 rounded">
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
          hr: () => (
            <hr className="my-8 border-0 h-px bg-gradient-to-l from-transparent via-border to-transparent" />
          ),
          code: ({ className, children, ...props }) => {
            // Inline code (no language class)
            const isInline = !className;
            if (isInline) {
              return (
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-primary border border-border/40" {...props}>
                  {children}
                </code>
              );
            }
            // Block code (has language-xxx class)
            const lang = className?.replace("language-", "") || "";
            return (
              <code className="block font-mono text-sm" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="relative my-5 p-4 rounded-2xl bg-foreground/95 text-background overflow-x-auto border border-border/40 text-sm leading-relaxed">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-2xl border border-border/60">
              <table className="w-full text-sm border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-primary/10">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-border/60 p-3 text-right font-bold text-foreground">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border-b border-border/40 p-3 text-foreground/80">{children}</td>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-primary/5 transition-colors">{children}</tr>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}

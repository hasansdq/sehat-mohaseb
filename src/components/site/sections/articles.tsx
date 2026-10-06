"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Clock, Newspaper } from "lucide-react";
import { api } from "@/lib/api-client";
import { Reveal } from "@/components/site/reveal";

type Article = {
  id: string; slug: string; title: string; excerpt: string | null;
  coverUrl: string | null; category: string | null; publishedAt: string | null;
  readingMinutes: number | null; featured: boolean;
};

function faDate(d: string | null) {
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
  } catch {
    return "";
  }
}

export function ArticlesSection() {
  const [items, setItems] = useState<Article[]>([]);

  useEffect(() => {
    api<{ items: Article[] }>("/api/public/articles?limit=3").then((r) => {
      if (r.ok && r.data) setItems(r.data.items);
    });
  }, []);

  if (!items.length) return null;

  return (
    <section id="articles" className="relative py-20 md:py-28">
      <div className="container mx-auto px-4">
        <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary mb-4">
              <Newspaper className="h-4 w-4" />
              مجله مالی
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-foreground">
              آخرین <span className="text-gradient-brand">مقالات</span> و راهنماهای مالی
            </h2>
          </div>
          <a href="#articles" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:gap-2.5 transition-all">
            مشاهده همه
            <ArrowLeft className="h-4 w-4" />
          </a>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {items.map((a, i) => (
            <Reveal key={a.id} delay={i * 0.08} className="h-full">
              <article className="group h-full rounded-2xl overflow-hidden border border-border/60 bg-card/60 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-glow transition-all">
                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-primary/15 to-amber-400/10 grid place-items-center">
                  {a.coverUrl ? (
                    <img src={a.coverUrl} alt={a.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="font-display text-6xl text-primary/20">م</div>
                  )}
                  {a.category && (
                    <span className="absolute top-3 right-3 rounded-full bg-background/80 backdrop-blur px-3 py-1 text-xs font-bold text-primary border border-primary/20">
                      {a.category}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {faDate(a.publishedAt)}</span>
                    {a.readingMinutes && <span>• {a.readingMinutes} دقیقه</span>}
                  </div>
                  <h3 className="font-display text-lg font-extrabold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {a.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

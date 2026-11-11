"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Newspaper, Eye, Sparkles, TrendingUp } from "lucide-react";
import { api } from "@/lib/api-client";
import { Reveal } from "@/components/site/reveal";

type Article = {
  id: string; slug: string; title: string; excerpt: string | null;
  coverUrl: string | null; category: string | null; publishedAt: string | null;
  readingMinutes: number | null; featured: boolean;
  authorName?: string | null; views?: number;
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
            <p className="mt-3 text-muted-foreground max-w-2xl">
              جدیدترین مقالات تخصصی حسابداری، مالیات و نرم‌افزار — توسط متخصصان موسسه صحت محاسب
            </p>
          </div>
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:gap-2.5 transition-all">
            مشاهده همه
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {items.map((a, i) => (
            <Reveal key={a.id} delay={i * 0.08} className="h-full">
              <Link href={`/blog/${a.slug}`} className="block h-full group">
                <article className="group h-full rounded-2xl overflow-hidden border border-border/60 bg-card/60 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-glow transition-all cursor-pointer relative">
                  {/* Featured ribbon */}
                  {a.featured && (
                    <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-amber-400/90 backdrop-blur px-2.5 py-1 text-[10px] font-black text-amber-950 shadow-glow-gold">
                      <Sparkles className="h-3 w-3" />
                      منتخب
                    </div>
                  )}
                  <div className="relative h-44 overflow-hidden bg-gradient-to-br from-primary/15 to-amber-400/10 grid place-items-center">
                    {a.coverUrl ? (
                      <img
                        src={a.coverUrl}
                        alt={a.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="font-display text-6xl text-primary/20 group-hover:scale-110 transition-transform duration-500">
                        {a.category?.charAt(0) || "م"}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {a.category && (
                      <span className="absolute top-3 right-3 rounded-full bg-background/80 backdrop-blur px-3 py-1 text-xs font-bold text-primary border border-primary/20">
                        {a.category}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2 flex-wrap">
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {faDate(a.publishedAt)}</span>
                      {a.readingMinutes && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {a.readingMinutes} دقیقه</span>}
                      {typeof a.views === "number" && a.views > 0 && (
                        <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {a.views.toLocaleString("fa-IR")}</span>
                      )}
                    </div>
                    <h3 className="font-display text-lg font-extrabold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {a.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p>
                    <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-primary group-hover:gap-2 transition-all">
                        ادامه مطلب <ArrowLeft className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

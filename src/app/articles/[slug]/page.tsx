"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Clock, ArrowRight, Calendar, Share2, Link2, ThumbsUp,
  MessageCircle, FileQuestion, Sparkles, BookOpen,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { Reveal } from "@/components/site/reveal";
import { SiteLayout } from "@/components/site/site-layout";
import { toast } from "sonner";

type Article = {
  id: string; slug: string; title: string; excerpt: string | null;
  coverUrl: string | null; category: string | null; publishedAt: string | null;
  readingMinutes: number | null; featured: boolean; content?: string | null;
};

function faDate(d: string | null) {
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date(d));
  } catch {
    return "";
  }
}

export default function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [related, setRelated] = useState<Article[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api<{ article: Article }>(`/api/public/articles?slug=${encodeURIComponent(slug)}`).then((r) => {
      if (r.ok && r.data?.article) {
        setArticle(r.data.article);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });
    // related
    api<{ items: Article[] }>(`/api/public/articles?limit=20`).then((r) => {
      if (r.ok && r.data) {
        setRelated(r.data.items.filter((a) => a.slug !== slug).slice(0, 3));
      }
    });
  }, [slug]);

  const share = () => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          toast.success("لینک مقاله کپی شد.");
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => toast.error("کپی لینک ناموفق بود."));
      }
    }
  };

  if (loading) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-32 max-w-3xl">
          <div className="h-6 w-40 rounded-full bg-muted/40 animate-pulse mb-6" />
          <div className="h-12 w-3/4 rounded-xl bg-muted/40 animate-pulse mb-4" />
          <div className="h-12 w-1/2 rounded-xl bg-muted/40 animate-pulse mb-8" />
          <div className="h-4 w-full rounded bg-muted/30 animate-pulse mb-3" />
          <div className="h-4 w-full rounded bg-muted/30 animate-pulse mb-3" />
          <div className="h-4 w-2/3 rounded bg-muted/30 animate-pulse" />
        </div>
      </SiteLayout>
    );
  }

  if (notFound || !article) {
    return (
      <SiteLayout>
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/6 via-background to-background" />
            <div className="absolute -top-10 right-1/4 h-72 w-72 rounded-full bg-primary/15 blur-[100px] animate-float-slow" />
            <div className="absolute inset-0 dot-pattern dot-grid-fade opacity-[0.4]" />
          </div>
          <div className="container mx-auto px-4 max-w-md text-center">
            <div className="grid place-items-center h-20 w-20 rounded-full bg-primary/10 text-primary mx-auto mb-5">
              <FileQuestion className="h-10 w-10" />
            </div>
            <h1 className="font-display text-3xl font-black text-foreground mb-3">
              مقاله پیدا نشد
            </h1>
            <p className="text-muted-foreground mb-7">
              متأسفانه مقاله‌ای با این آدرس یافت نشد. شاید حذف شده یا آدرس آن تغییر کرده باشد.
            </p>
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-brand text-white px-7 py-3.5 font-bold shadow-glow hover:-translate-y-0.5 transition-all"
            >
              بازگشت به مقالات
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      {/* Hero (PageHeader-style) */}
      <section className="relative pt-32 md:pt-36 pb-12 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/6 via-background to-background" />
          <div className="absolute -top-10 right-1/4 h-72 w-72 rounded-full bg-primary/15 blur-[100px] animate-float-slow" />
          <div className="absolute top-10 left-0 h-64 w-64 rounded-full bg-amber-400/12 blur-[100px] animate-float" />
          <div className="absolute inset-0 dot-pattern dot-grid-fade opacity-[0.4] dark:opacity-[0.6]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </div>
        <div className="container mx-auto px-4 max-w-3xl">
          <Reveal>
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5 flex-wrap">
              <Link href="/" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
                خانه
              </Link>
              <span className="text-muted-foreground/50">/</span>
              <Link href="/articles" className="hover:text-primary transition-colors">مقالات</Link>
              <span className="text-muted-foreground/50">/</span>
              <span className="text-foreground font-semibold line-clamp-1">{article.title}</span>
            </nav>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {article.category && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary">
                  <BookOpen className="h-3.5 w-3.5" />
                  {article.category}
                </span>
              )}
              {article.featured && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  منتخب
                </span>
              )}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-foreground">
              {article.title}
            </h1>
          </Reveal>
          {article.excerpt && (
            <Reveal delay={0.16}>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                {article.excerpt}
              </p>
            </Reveal>
          )}
          <Reveal delay={0.22}>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border/60">
              {article.publishedAt && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> {faDate(article.publishedAt)}
                </span>
              )}
              {article.readingMinutes ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {article.readingMinutes} دقیقه مطالعه
                </span>
              ) : null}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Cover */}
      {article.coverUrl && (
        <section className="relative pb-8">
          <div className="container mx-auto px-4 max-w-3xl">
            <Reveal>
              <div className="relative h-56 sm:h-72 md:h-96 rounded-3xl overflow-hidden border border-border/60">
                <img src={article.coverUrl} alt={article.title} className="h-full w-full object-cover" />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Body */}
      <section className="relative py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Reveal>
            <article
              className="prose-article text-foreground/85 leading-loose text-base sm:text-lg whitespace-pre-wrap"
              style={{ fontFamily: "inherit" }}
            >
              {article.content || article.excerpt || "محتوای این مقاله در حال آماده‌سازی است."}
            </article>
          </Reveal>

          {/* Share row (decorative) */}
          <Reveal delay={0.1}>
            <div className="mt-12 pt-6 border-t border-border/60 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Share2 className="h-4 w-4" />
                اشتراک‌گذاری مقاله
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={share}
                  className={`grid place-items-center h-10 w-10 rounded-xl border transition-all ${copied ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/40 hover:text-primary"}`}
                  aria-label="کپی لینک"
                  title="کپی لینک"
                >
                  <Link2 className="h-4 w-4" />
                </button>
                <span className="grid place-items-center h-10 w-10 rounded-xl border border-border bg-card text-muted-foreground" aria-hidden>
                  <ThumbsUp className="h-4 w-4" />
                </span>
                <span className="grid place-items-center h-10 w-10 rounded-xl border border-border bg-card text-muted-foreground" aria-hidden>
                  <MessageCircle className="h-4 w-4" />
                </span>
              </div>
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all"
              >
                بازگشت به مقالات
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="relative py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <Reveal>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary mb-3">
                  <Sparkles className="h-4 w-4" />
                  پیشنهادها
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-foreground">
                  مقالات <span className="text-gradient-brand">مرتبط</span>
                </h2>
              </div>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-5">
              {related.map((a, i) => (
                <Reveal key={a.id} delay={i * 0.08} className="h-full">
                  <Link href={`/articles/${a.slug}`} className="group block h-full rounded-2xl overflow-hidden border border-border/60 bg-card/60 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-glow transition-all">
                    <div className="relative h-32 overflow-hidden bg-gradient-to-br from-primary/15 to-amber-400/10 grid place-items-center">
                      {a.coverUrl ? (
                        <img src={a.coverUrl} alt={a.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="font-display text-5xl text-primary/20">م</div>
                      )}
                      {a.category && (
                        <span className="absolute top-2 right-2 rounded-full bg-background/80 backdrop-blur px-2.5 py-1 text-xs font-bold text-primary border border-primary/20">
                          {a.category}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {faDate(a.publishedAt)}</span>
                      </div>
                      <h3 className="font-display text-base font-extrabold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {a.title}
                      </h3>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}

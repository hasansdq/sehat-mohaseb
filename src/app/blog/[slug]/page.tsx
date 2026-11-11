"use client";

import { useEffect, useState, use, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Clock, ArrowRight, Calendar, Share2, Link2,
  FileQuestion, Sparkles, BookOpen, Eye,
  Send, MessageCircle as WhatsAppIcon, Twitter, Linkedin,
  User, Hash, CheckCircle2, ArrowLeft,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { Reveal } from "@/components/site/reveal";
import { SiteLayout } from "@/components/site/site-layout";
import { MarkdownRenderer } from "@/components/site/markdown-renderer";
import { toast } from "sonner";

type Article = {
  id: string; slug: string; title: string; excerpt: string | null;
  coverUrl: string | null; category: string | null; publishedAt: string | null;
  readingMinutes: number | null; featured: boolean; content?: string | null;
  authorName?: string | null; tags?: string | null; views?: number;
};

function faDate(d: string | null) {
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date(d));
  } catch {
    return "";
  }
}

// Extract H2 headings from markdown content for the table of contents
function extractToc(content: string): { id: string; text: string; level: number }[] {
  const lines = content.split("\n");
  const toc: { id: string; text: string; level: number }[] = [];
  let inCodeBlock = false;
  for (const line of lines) {
    if (line.trim().startsWith("```")) { inCodeBlock = !inCodeBlock; continue; }
    if (inCodeBlock) continue;
    // Match ## and ### headings (skip # H1 which is usually the title)
    const m = line.match(/^(#{2,3})\s+(.+)$/);
    if (m) {
      const text = m[2].replace(/[*_`~]/g, "").trim();
      const id = text
        .replace(/[^\u0600-\u06FFa-zA-Z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
        .slice(0, 60);
      toc.push({ id, text, level: m[1].length });
    }
  }
  return toc;
}

export default function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [related, setRelated] = useState<Article[]>([]);
  const [copied, setCopied] = useState(false);
  const [activeHeading, setActiveHeading] = useState<string>("");
  const [readingProgress, setReadingProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<{ article: Article }>(`/api/public/articles?slug=${encodeURIComponent(slug)}`).then((r) => {
      if (r.ok && r.data?.article) {
        setArticle(r.data.article);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });
    // related — fetch all, then filter by category in priority order
    api<{ items: Article[] }>(`/api/public/articles?limit=20`).then((r) => {
      if (r.ok && r.data) {
        setRelated(r.data.items);
      }
    });
  }, [slug]);

  // Build table of contents from article content
  const toc = useMemo(() => {
    if (!article?.content) return [];
    return extractToc(article.content);
  }, [article]);

  // Smart related articles: same category first, then fallback to others
  const relatedFiltered = useMemo(() => {
    if (!article || related.length === 0) return [];
    const others = related.filter((a) => a.slug !== article.slug);
    const sameCategory = others.filter((a) => a.category === article.category);
    const otherCategory = others.filter((a) => a.category !== article.category);
    return [...sameCategory, ...otherCategory].slice(0, 3);
  }, [article, related]);

  // Reading progress + active heading tracker
  useEffect(() => {
    if (!article) return;
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      setReadingProgress(progress);

      // Find active heading
      if (toc.length > 0) {
        const headings = toc
          .map((t) => document.getElementById(t.id))
          .filter(Boolean) as HTMLElement[];
        if (headings.length > 0) {
          // Find the last heading that's above the viewport top (offset by 120px for navbar)
          const offset = 140;
          let current = headings[0]?.id || "";
          for (const h of headings) {
            if (h.getBoundingClientRect().top <= offset) {
              current = h.id;
            } else {
              break;
            }
          }
          setActiveHeading(current);
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [article, toc]);

  // Inject IDs into rendered H2/H3 headings after content mounts
  useEffect(() => {
    if (!article?.content || !contentRef.current) return;
    const headings = contentRef.current.querySelectorAll<HTMLElement>("h2, h3");
    headings.forEach((h) => {
      const text = h.textContent || "";
      const id = text
        .replace(/[*_`~]/g, "")
        .replace(/[^\u0600-\u06FFa-zA-Z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
        .slice(0, 60);
      h.id = id;
      // Make headings clickable to update URL hash
      h.style.cursor = "pointer";
      h.addEventListener("click", () => {
        window.history.replaceState(null, "", `#${id}`);
      });
    });
  }, [article?.content]);

  // JSON-LD structured data for SEO (Article schema)
  useEffect(() => {
    if (!article) return;
    const scriptId = "article-jsonld";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    const jsonld = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.excerpt || "",
      datePublished: article.publishedAt,
      author: { "@type": "Organization", name: article.authorName || "موسسه صحت محاسب" },
      publisher: {
        "@type": "Organization",
        name: "موسسه حسابداری صحت محاسب",
        url: typeof window !== "undefined" ? window.location.origin : "",
      },
      articleSection: article.category || "",
      keywords: article.tags || "",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": typeof window !== "undefined" ? window.location.href : "",
      },
    };
    script.textContent = JSON.stringify(jsonld);

    // Also update document title and meta description for SEO
    if (article.title) document.title = `${article.title} | صحت محاسب`;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    if (article.excerpt) metaDesc.setAttribute("content", article.excerpt);

    // Open Graph tags
    const setOg = (prop: string, content: string) => {
      let m = document.querySelector(`meta[property="${prop}"]`);
      if (!m) {
        m = document.createElement("meta");
        m.setAttribute("property", prop);
        document.head.appendChild(m);
      }
      m.setAttribute("content", content);
    };
    setOg("og:title", article.title);
    setOg("og:description", article.excerpt || "");
    setOg("og:type", "article");
    if (article.coverUrl) setOg("og:image", article.coverUrl);

    return () => {
      // Cleanup on unmount (when navigating to another article)
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [article]);

  const share = (platform?: string) => {
    if (typeof window === "undefined") return;
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(article?.title || document.title);

    if (platform === "copy" || !platform) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(() => {
          setCopied(true);
          toast.success("لینک مقاله کپی شد.");
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => toast.error("کپی لینک ناموفق بود."));
      }
      return;
    }

    let shareUrl = "";
    switch (platform) {
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${url}&text=${title}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${title}%20${url}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
    }
    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=500");
    }
  };

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
      window.history.replaceState(null, "", `#${id}`);
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
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-brand text-white px-7 py-3.5 font-bold shadow-glow hover:-translate-y-0.5 transition-all"
            >
              بازگشت به وبلاگ
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      {/* ===== Reading progress bar (sticky at top) ===== */}
      <div className="fixed top-0 inset-x-0 z-[60] h-1 bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-brand transition-[width] duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

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
              <Link href="/blog" className="hover:text-primary transition-colors">مقالات</Link>
              <span className="text-muted-foreground/50">/</span>
              <span className="text-foreground font-semibold line-clamp-1">{article.title}</span>
            </nav>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {article.category && (
                <Link
                  href={`/blog?category=${encodeURIComponent(article.category)}`}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  {article.category}
                </Link>
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
              {typeof article.views === "number" && article.views > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="h-4 w-4" /> {article.views.toLocaleString("fa-IR")} بازدید
                </span>
              )}
              {article.authorName && (
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-4 w-4" /> {article.authorName}
                </span>
              )}
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

      {/* ===== Body with TOC sidebar (desktop) ===== */}
      <section className="relative py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex gap-8">
            {/* Table of Contents — sticky sidebar on desktop */}
            {toc.length > 1 && (
              <aside className="hidden lg:block w-56 flex-shrink-0">
                <div className="sticky top-24">
                  <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-4">
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/40">
                      <Hash className="h-4 w-4 text-primary" />
                      <h4 className="font-display text-sm font-bold text-foreground">فهرست مطالب</h4>
                    </div>
                    <nav className="space-y-1 max-h-[60vh] overflow-y-auto scrollbar-thin">
                      {toc.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => scrollToHeading(t.id)}
                          className={`block w-full text-right text-xs leading-relaxed py-1.5 pr-3 border-r-2 transition-all ${
                            activeHeading === t.id
                              ? "border-primary text-primary font-bold bg-primary/5"
                              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                          } ${t.level === 3 ? "pr-5 text-[11px]" : ""}`}
                        >
                          {t.text}
                        </button>
                      ))}
                    </nav>
                  </div>
                  {/* Reading progress mini-card */}
                  <div className="mt-3 rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-muted-foreground font-semibold">پیشرفت مطالعه</span>
                      <span className="font-bold text-primary">{Math.round(readingProgress)}٪</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-gradient-brand transition-[width] duration-150"
                        style={{ width: `${readingProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </aside>
            )}

            {/* Article content */}
            <div ref={contentRef} className="flex-1 min-w-0 max-w-3xl">
              <Reveal>
                <MarkdownRenderer content={article.content || article.excerpt || "محتوای این مقاله در حال آماده‌سازی است."} />
              </Reveal>

              {/* Tags */}
              {article.tags && (
                <Reveal delay={0.05}>
                  <div className="mt-8 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">برچسب‌ها:</span>
                    {article.tags.split(",").map((tag, i) => {
                      const t = tag.trim();
                      if (!t) return null;
                      return (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
                        >
                          <Hash className="h-3 w-3" />
                          {t}
                        </span>
                      );
                    })}
                  </div>
                </Reveal>
              )}

              {/* ===== Author bio card ===== */}
              <Reveal delay={0.1}>
                <div className="mt-8 rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 to-amber-400/5 p-5 flex items-start gap-4">
                  <div className="grid place-items-center h-14 w-14 rounded-2xl bg-gradient-brand text-white font-display text-xl font-black flex-shrink-0 shadow-glow">
                    ص
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-display font-bold text-foreground">
                        {article.authorName || "موسسه صحت محاسب"}
                      </h4>
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      موسسه حسابداری صحت محاسب، نماینده رسمی نرم‌افزارهای سپیدار و دشت؛
                      ارائه‌دهنده خدمات حرفه‌ای حسابداری، مشاوره مالی و مالیاتی، حسابرسی و آموزش.
                    </p>
                    <Link
                      href="/about"
                      className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-primary hover:gap-2 transition-all"
                    >
                      بیشتر درباره ما
                      <ArrowLeft className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </Reveal>

              {/* ===== Share row — improved with real social platforms ===== */}
              <Reveal delay={0.15}>
                <div className="mt-8 pt-6 border-t border-border/60">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-3">
                    <Share2 className="h-4 w-4 text-primary" />
                    اشتراک‌گذاری مقاله
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Telegram */}
                    <button
                      onClick={() => share("telegram")}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-bold text-foreground hover:bg-[#229ED9]/10 hover:border-[#229ED9]/40 hover:text-[#229ED9] transition-all"
                      aria-label="اشتراک در تلگرام"
                      title="اشتراک در تلگرام"
                    >
                      <Send className="h-4 w-4" />
                      <span className="hidden sm:inline">تلگرام</span>
                    </button>
                    {/* WhatsApp */}
                    <button
                      onClick={() => share("whatsapp")}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-bold text-foreground hover:bg-[#25D366]/10 hover:border-[#25D366]/40 hover:text-[#25D366] transition-all"
                      aria-label="اشتراک در واتساپ"
                      title="اشتراک در واتساپ"
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">واتساپ</span>
                    </button>
                    {/* Twitter / X */}
                    <button
                      onClick={() => share("twitter")}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-bold text-foreground hover:bg-foreground/10 hover:border-foreground/40 transition-all"
                      aria-label="اشتراک در ایکس"
                      title="اشتراک در ایکس"
                    >
                      <Twitter className="h-4 w-4" />
                      <span className="hidden sm:inline">ایکس</span>
                    </button>
                    {/* LinkedIn */}
                    <button
                      onClick={() => share("linkedin")}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-bold text-foreground hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/40 hover:text-[#0A66C2] transition-all"
                      aria-label="اشتراک در لینکدین"
                      title="اشتراک در لینکدین"
                    >
                      <Linkedin className="h-4 w-4" />
                      <span className="hidden sm:inline">لینکدین</span>
                    </button>
                    {/* Copy link */}
                    <button
                      onClick={() => share("copy")}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-bold transition-all ${
                        copied
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border bg-card text-foreground hover:border-primary/40 hover:text-primary"
                      }`}
                      aria-label="کپی لینک"
                      title="کپی لینک"
                    >
                      {copied ? <CheckCircle2 className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                      <span className="hidden sm:inline">{copied ? "کپی شد!" : "کپی لینک"}</span>
                    </button>
                    <Link
                      href="/blog"
                      className="inline-flex items-center gap-1 mr-auto text-sm font-bold text-primary hover:gap-2 transition-all"
                    >
                      بازگشت به وبلاگ
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Related articles — by category priority */}
      {relatedFiltered.length > 0 && (
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
              {relatedFiltered.map((a, i) => (
                <Reveal key={a.id} delay={i * 0.08} className="h-full">
                  <Link href={`/blog/${a.slug}`} className="group block h-full rounded-2xl overflow-hidden border border-border/60 bg-card/60 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-glow transition-all">
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

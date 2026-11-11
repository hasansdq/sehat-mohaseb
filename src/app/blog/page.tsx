"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Send, Search, SearchX, ArrowLeft, Mail, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api-client";
import { Reveal } from "@/components/site/reveal";
import { PageHeader } from "@/components/site/page-header";
import { SiteLayout } from "@/components/site/site-layout";
import { toast } from "sonner";

type Article = {
  id: string; slug: string; title: string; excerpt: string | null;
  coverUrl: string | null; category: string | null; publishedAt: string | null;
  readingMinutes: number | null; featured: boolean;
};

type BlogSettings = {
  title: string; subtitle: string; showSearch: boolean; showNewsletter: boolean;
  newsletterTitle: string; newsletterSubtitle: string; postsPerPage: number;
};

function faDate(d: string | null) {
  if (!d) return "";
  try { return new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date(d)); } catch { return ""; }
}

export default function BlogPage() {
  const [items, setItems] = useState<Article[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [blog, setBlog] = useState<BlogSettings>({
    title: "مجله مالی صحت محاسب",
    subtitle: "مقالات، راهنماها و تحلیل‌های تخصصی حسابداری، مالیات و نرم‌افزار",
    showSearch: true, showNewsletter: true,
    newsletterTitle: "عضویت در خبرنامه",
    newsletterSubtitle: "جدیدترین مقالات مالی را دریافت کنید.",
    postsPerPage: 12,
  });
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Load blog settings
  useEffect(() => {
    api<{ settings: Record<string, string> }>("/api/public/site").then((r) => {
      if (r.ok && r.data?.settings) {
        const s = r.data.settings;
        setBlog({
          title: s["blog.title"] || blog.title,
          subtitle: s["blog.subtitle"] || blog.subtitle,
          showSearch: s["blog.showSearch"] !== "false",
          showNewsletter: s["blog.showNewsletter"] !== "false",
          newsletterTitle: s["blog.newsletterTitle"] || blog.newsletterTitle,
          newsletterSubtitle: s["blog.newsletterSubtitle"] || blog.newsletterSubtitle,
          postsPerPage: Math.min(100, Math.max(1, Math.floor(Number(s["blog.postsPerPage"])) || 12)),
        });
      }
    });
  }, []);

  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    setLoadError(false);
    const params = new URLSearchParams({ limit: String(blog.postsPerPage), page: String(page) });
    if (activeQuery) params.set("q", activeQuery);
    if (category) params.set("category", category);
    api<{ items: Article[]; total: number; page: number; categories: string[] }>(`/api/public/articles?${params}`)
      .then((r) => {
        if (cancelled) return;
        if (r.ok && r.data) {
          setItems(r.data.items);
          setTotal(r.data.total);
          setCategories(r.data.categories);
        } else { setLoadError(true); }
      })
      .catch(() => { if (!cancelled) setLoadError(true); })
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, [activeQuery, category, page, blog.postsPerPage]);

  const totalPages = Math.max(1, Math.ceil(total / blog.postsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pageItems = items;

  const onSearch = () => { setActiveQuery(query); setPage(1); };

  const subscribe = async () => {
    if (!email.trim()) { toast.error("ایمیل را وارد کنید."); return; }
    setSubscribing(true);
    const r = await api("/api/newsletter", { method: "POST", body: JSON.stringify({ email }) });
    setSubscribing(false);
    if (r.ok) { toast.success("عضویت انجام شد!"); setEmail(""); } else toast.error(r.error || "خطا.");
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="وبلاگ"
        title={<>{blog.title.split(" ").slice(0, -1).join(" ")} <span className="text-gradient-brand">{blog.title.split(" ").slice(-1)}</span></>}
        subtitle={blog.subtitle}
        crumbs={[{ label: "وبلاگ" }]}
      >
        {blog.showSearch && (
          <div className="relative max-w-xl">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder="جستجو در مقالات..."
              className="w-full rounded-xl border border-border bg-background/60 pr-10 pl-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        )}
      </PageHeader>

      {/* Category filter pills */}
      {categories.length > 1 && (
        <div className="container mx-auto px-4 pb-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => { setCategory(""); setPage(1); }}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${!category ? "bg-gradient-brand text-white shadow-glow" : "border border-border bg-card/60 text-muted-foreground hover:border-primary/40"}`}
            >
              همه
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => { setCategory(c); setPage(1); }}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${category === c ? "bg-gradient-brand text-white shadow-glow" : "border border-border bg-card/60 text-muted-foreground hover:border-primary/40"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Articles grid */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {!loaded ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-border/60 overflow-hidden animate-pulse">
                  <div className="h-44 bg-muted/40" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-1/3 bg-muted/40 rounded" />
                    <div className="h-5 w-3/4 bg-muted/40 rounded" />
                    <div className="h-3 w-full bg-muted/40 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : loadError ? (
            <p role="alert" className="text-center py-12">دریافت مقالات ناموفق بود؛ صفحه را دوباره بارگذاری کنید.</p>
          ) : pageItems.length === 0 ? (
            <div className="text-center py-20">
              <SearchX className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <div className="font-bold text-foreground text-lg">مقاله‌ای یافت نشد</div>
              <p className="text-sm text-muted-foreground mt-1">عبارت دیگری جستجو کنید.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {pageItems.map((a, i) => (
                <Reveal key={a.id} delay={i * 0.05} className="h-full">
                  <Link href={`/blog/${a.slug}`} className="block h-full group">
                    <article className="h-full rounded-2xl overflow-hidden border border-border/60 bg-card/60 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-glow transition-all cursor-pointer">
                      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-primary/15 to-amber-400/10">
                        {a.coverUrl ? (
                          <img src={a.coverUrl} alt={a.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="font-display text-6xl text-primary/20 grid place-items-center h-full">م</div>
                        )}
                        {a.category && (
                          <span className="absolute top-3 right-3 rounded-full bg-background/80 backdrop-blur px-3 py-1 text-xs font-bold text-primary border border-primary/20">
                            {a.category}
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {faDate(a.publishedAt)}</span>
                          {a.readingMinutes && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {a.readingMinutes} دقیقه</span>}
                        </div>
                        <h3 className="font-display text-lg font-extrabold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                          {a.title}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p>
                        <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary group-hover:gap-2 transition-all">
                          ادامه مطلب <ArrowLeft className="h-4 w-4" />
                        </span>
                      </div>
                    </article>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="grid place-items-center h-10 w-10 rounded-xl border border-border hover:border-primary/40 disabled:opacity-40 transition-colors"
                aria-label="قبلی"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`h-10 w-10 rounded-xl font-bold text-sm transition-all ${currentPage === i + 1 ? "bg-gradient-brand text-white shadow-glow" : "border border-border hover:border-primary/40"}`}
                >
                  {(i + 1).toLocaleString("fa-IR")}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="grid place-items-center h-10 w-10 rounded-xl border border-border hover:border-primary/40 disabled:opacity-40 transition-colors"
                aria-label="بعدی"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      {blog.showNewsletter && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-amber-400/5 p-8 md:p-12 text-center">
                <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/60 px-4 py-1.5 text-sm font-bold text-primary mb-4">
                    <Mail className="h-4 w-4" />
                    {blog.newsletterTitle}
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-black text-foreground">
                    {blog.newsletterSubtitle}
                  </h3>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && subscribe()}
                      type="email"
                      placeholder="ایمیل شما"
                      dir="ltr"
                      className="flex-1 rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button
                      onClick={subscribe}
                      disabled={subscribing}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand text-white px-6 py-3 font-bold shadow-glow hover:shadow-glow-gold disabled:opacity-60 transition-all"
                    >
                      {subscribing ? "..." : (<><Send className="h-4 w-4" /> عضویت</>)}
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Newspaper, Send, Search, FileQuestion, ArrowLeft, Mail } from "lucide-react";
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

function faDate(d: string | null) {
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date(d));
  } catch {
    return "";
  }
}

export default function ArticlesPage() {
  const [items, setItems] = useState<Article[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    api<{ items: Article[] }>("/api/public/articles?limit=20").then((r) => {
      if (r.ok && r.data) setItems(r.data.items);
      setLoaded(true);
    });
  }, []);

  const filtered = query.trim()
    ? items.filter(
        (a) =>
          a.title.includes(query) ||
          (a.excerpt || "").includes(query) ||
          (a.category || "").includes(query),
      )
    : items;

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("لطفاً ایمیل خود را وارد کنید.");
      return;
    }
    setSubLoading(true);
    const r = await api("/api/newsletter", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    setSubLoading(false);
    if (r.ok) {
      toast.success("عضویت شما در خبرنامه ثبت شد 🌿");
      setEmail("");
    } else {
      toast.error(r.error || "خطا در ثبت عضویت.");
    }
  };

  return (
    <SiteLayout>
      <PageHeader
        crumbs={[{ label: "مقالات" }]}
        eyebrow="مجله مالی"
        title={<>آخرین <span className="text-gradient-brand">مقالات</span> و راهنماها</>}
        subtitle="راهنماهای کاربردی درباره مالیات، حسابداری، انتخاب نرم‌افزار و مدیریت مالی کسب‌وکار."
      >
        {/* search */}
        <div className="relative max-w-xl">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در مقالات..."
            className="w-full rounded-full border border-border bg-card/60 pr-12 pl-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            aria-label="جستجو در مقالات"
          />
        </div>
      </PageHeader>

      {/* Articles grid */}
      <section className="relative py-12 md:py-16">
        <div className="container mx-auto px-4">
          {loaded && filtered.length === 0 ? (
            <Reveal>
              <div className="max-w-md mx-auto text-center py-16">
                <div className="grid place-items-center h-20 w-20 rounded-full bg-primary/10 text-primary mx-auto mb-5">
                  <FileQuestion className="h-10 w-10" />
                </div>
                <h3 className="font-display text-xl font-extrabold text-foreground mb-2">
                  {query ? "نتیجه‌ای یافت نشد" : "مقاله‌ای منتشر نشده"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {query
                    ? "عبارت دیگری را امتحان کنید یا همه مقالات را ببینید."
                    : "به‌زودی مقالات تازه‌ای در این بخش منتشر خواهد شد."}
                </p>
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground hover:border-primary/40 transition-all"
                  >
                    پاک کردن جستجو
                  </button>
                )}
              </div>
            </Reveal>
          ) : (
            <>
              {query && (
                <div className="mb-6 text-sm text-muted-foreground">
                  {filtered.length} نتیجه برای «<span className="font-bold text-foreground">{query}</span>»
                </div>
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {filtered.map((a, i) => (
                  <Reveal key={a.id} delay={(i % 3) * 0.08} className="h-full">
                    <Link href={`/articles/${a.slug}`} className="group block h-full rounded-2xl overflow-hidden border border-border/60 bg-card/60 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-glow transition-all">
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
                          {a.readingMinutes ? <span>• {a.readingMinutes} دقیقه</span> : null}
                        </div>
                        <h3 className="font-display text-lg font-extrabold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                          {a.title}
                        </h3>
                        {a.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{a.excerpt}</p>}
                        <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary group-hover:gap-2.5 transition-all">
                          ادامه مطلب
                          <ArrowLeft className="h-4 w-4" />
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Newsletter signup */}
      <section className="relative py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-amber-400/10 p-8 md:p-10">
              <div className="absolute -top-10 right-1/3 h-56 w-56 rounded-full bg-primary/20 blur-[100px] animate-float-slow" />
              <div className="absolute -bottom-10 left-1/3 h-56 w-56 rounded-full bg-amber-400/15 blur-[100px] animate-float" />
              <div className="relative text-center">
                <div className="grid place-items-center h-14 w-14 rounded-2xl bg-gradient-brand text-white shadow-glow mx-auto mb-4">
                  <Mail className="h-7 w-7" />
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary mb-4">
                  <Newspaper className="h-4 w-4" />
                  خبرنامه مالی
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-foreground">
                  از جدیدترین <span className="text-gradient-brand">مقالات</span> جا نمانید
                </h2>
                <p className="mt-3 text-muted-foreground">
                  ایمیل خود را وارد کنید تا هر هفته جدیدترین راهنماها و نکات مالی را دریافت کنید.
                </p>
                <form onSubmit={subscribe} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ایمیل شما"
                    dir="ltr"
                    className="flex-1 rounded-full border border-border bg-background/60 px-5 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-right"
                    aria-label="ایمیل"
                  />
                  <button
                    type="submit"
                    disabled={subLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand text-white px-6 py-3 font-bold shadow-glow hover:-translate-y-0.5 disabled:opacity-60 transition-all"
                  >
                    {subLoading ? "در حال ارسال..." : (<><Send className="h-4 w-4" /> عضویت</>)}
                  </button>
                </form>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}

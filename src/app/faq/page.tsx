"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, HelpCircle, MessagesSquare, ArrowLeft, SearchX } from "lucide-react";
import { api } from "@/lib/api-client";
import { Reveal } from "@/components/site/reveal";
import { PageHeader } from "@/components/site/page-header";
import { SiteLayout } from "@/components/site/site-layout";
import { useUI } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

type FAQ = { id: string; question: string; answer: string };

export default function FaqPage() {
  const [items, setItems] = useState<FAQ[]>([]);
  const [open, setOpen] = useState<number | null>(0);
  const [query, setQuery] = useState("");
  const { openConsult } = useUI();

  useEffect(() => {
    api<{ items: FAQ[] }>("/api/public/faqs").then((r) => {
      if (r.ok && r.data) setItems(r.data.items);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return items;
    return items.filter(
      (f) => f.question.includes(q) || f.answer.includes(q),
    );
  }, [items, query]);

  return (
    <SiteLayout>
      <PageHeader
        crumbs={[{ label: "سوالات" }]}
        eyebrow="پرسش و پاسخ"
        title={<>هرچی نیاز است <span className="text-gradient-brand">بدانید</span></>}
        subtitle="پاسخ پرتکرارترین پرسش‌های صاحبان کسب‌وکار درباره خدمات، تعرفه‌ها و فرآیند همکاری ما."
      >
        {/* search */}
        <div className="relative max-w-xl">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در سوالات..."
            className="w-full rounded-full border border-border bg-card/60 pr-12 pl-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            aria-label="جستجو در سوالات"
          />
        </div>
      </PageHeader>

      {/* FAQ accordion list */}
      <section className="relative py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {filtered.length === 0 ? (
            <Reveal>
              <div className="max-w-md mx-auto text-center py-16">
                <div className="grid place-items-center h-20 w-20 rounded-full bg-primary/10 text-primary mx-auto mb-5">
                  <SearchX className="h-10 w-10" />
                </div>
                <h3 className="font-display text-xl font-extrabold text-foreground mb-2">
                  نتیجه‌ای یافت نشد
                </h3>
                <p className="text-muted-foreground text-sm">
                  برای این جستجو سوالاتی پیدا نکردیم. عبارت دیگری را امتحان کنید یا مستقیم از کارشناسان ما بپرسید.
                </p>
                <button
                  onClick={() => setQuery("")}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground hover:border-primary/40 transition-all"
                >
                  پاک کردن جستجو
                </button>
              </div>
            </Reveal>
          ) : (
            <div className="space-y-3">
              {filtered.map((f, i) => (
                <Reveal key={f.id} delay={i * 0.04}>
                  <div className={cn(
                    "rounded-2xl border bg-card/60 overflow-hidden transition-all",
                    open === i ? "border-primary/40 shadow-glow" : "border-border/60 hover:border-primary/30",
                  )}>
                    <button
                      onClick={() => setOpen(open === i ? null : i)}
                      className="w-full flex items-center justify-between gap-4 p-5 text-right"
                      aria-expanded={open === i}
                    >
                      <span className="font-bold text-foreground flex items-start gap-3">
                        <span className="grid place-items-center h-7 w-7 rounded-lg bg-primary/10 text-primary flex-shrink-0 text-xs font-black">
                          {(i + 1).toLocaleString("fa-IR")}
                        </span>
                        {f.question}
                      </span>
                      <span
                        className="grid place-items-center h-8 w-8 rounded-full bg-primary/10 text-primary flex-shrink-0 transition-transform duration-300"
                        style={{ transform: open === i ? "rotate(45deg)" : "rotate(0deg)" }}
                      >
                        <Plus className="h-4 w-4" />
                      </span>
                    </button>
                    <div
                      className="grid transition-all duration-300 ease-out"
                      style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 pb-5 pr-14 text-muted-foreground leading-relaxed">{f.answer}</div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="relative py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-amber-400/10 p-8 md:p-12 text-center">
              <div className="absolute -top-10 right-1/3 h-56 w-56 rounded-full bg-primary/20 blur-[100px] animate-float-slow" />
              <div className="absolute -bottom-10 left-1/3 h-56 w-56 rounded-full bg-amber-400/15 blur-[100px] animate-float" />
              <div className="relative">
                <div className="grid place-items-center h-14 w-14 rounded-2xl bg-gradient-brand text-white shadow-glow mx-auto mb-4">
                  <MessagesSquare className="h-7 w-7" />
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary mb-3">
                  <HelpCircle className="h-4 w-4" />
                  پرسش بیشتری دارید؟
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-foreground">
                  پاسخ خود را از <span className="text-gradient-brand">کارشناسان</span> ما بگیرید
                </h2>
                <p className="mt-3 text-muted-foreground">
                  اگر در میان سوالات بالا پاسخ خود را پیدا نکردید، یک درخواست مشاوره ثبت کنید تا کارشناسان ما با شما تماس بگیرند.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => openConsult("پرسش عمومی")}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-brand text-white px-7 py-3.5 font-bold shadow-glow hover:-translate-y-0.5 transition-all"
                  >
                    پرسیدن از کارشناس
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}

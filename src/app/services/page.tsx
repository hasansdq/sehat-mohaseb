"use client";

import { useEffect, useState } from "react";
import { Wrench, Phone, Sparkles } from "lucide-react";
import { api } from "@/lib/api-client";
import { PageHeader } from "@/components/site/page-header";
import { ServiceCard } from "@/components/site/service-card";
import { Reveal } from "@/components/site/reveal";
import { SiteLayout } from "@/components/site/site-layout";
import { useUI } from "@/lib/ui-store";

type Service = {
  id: string; slug: string; title: string; shortDesc: string | null;
  description: string | null; icon: string | null; priceLabel: string | null;
  order: number; featured: boolean;
};

export default function ServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [filter, setFilter] = useState("all");
  const { openConsult } = useUI();

  useEffect(() => {
    api<{ items: Service[] }>("/api/public/services").then((r) => {
      if (r.ok && r.data) setItems(r.data.items);
    });
  }, []);

  const filtered = filter === "all" ? items : items.filter((s) => s.featured === (filter === "featured"));

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="خدمات موسسه صحت محاسب"
        title={<>راهکارهای مالی <span className="text-gradient-brand">جامع</span> برای کسب‌وکار شما</>}
        subtitle="از حسابداری و مشاوره مالیاتی تا نرم‌افزار و آموزش؛ هر خدمت با تیم متخصص و پشتیبانی اختصاصی."
        crumbs={[{ label: "خدمات" }]}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${filter === "all" ? "bg-gradient-brand text-white shadow-glow" : "border border-border bg-card/60 text-muted-foreground hover:border-primary/40"}`}
          >
            همه خدمات
          </button>
          <button
            onClick={() => setFilter("featured")}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${filter === "featured" ? "bg-gradient-brand text-white shadow-glow" : "border border-border bg-card/60 text-muted-foreground hover:border-primary/40"}`}
          >
            خدمات ویژه
          </button>
        </div>
      </PageHeader>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {items.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-3 opacity-40" />
              در حال بارگذاری خدمات...
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {filtered.map((s, i) => (
                <Reveal key={s.id} delay={i * 0.05} className="h-full">
                  <ServiceCard service={s} index={i} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA band */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-amber-400/5 p-8 md:p-12 text-center">
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/60 px-4 py-1.5 text-sm font-bold text-primary mb-4">
                  <Sparkles className="h-4 w-4" />
                  مشاوره رایگان
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-black text-foreground">
                  مطمئن نیستی کدام خدمت مناسبته؟
                </h2>
                <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                  کارشناسان ما وضعیت کسب‌وکارتان را بررسی و بهترین راهکار مالی را پیشنهاد می‌دهند.
                </p>
                <button
                  onClick={() => openConsult()}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-brand text-white px-7 py-3.5 font-bold shadow-glow hover:shadow-glow-gold hover:-translate-y-0.5 transition-all"
                >
                  <Phone className="h-5 w-5" />
                  دریافت مشاوره رایگان
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import { api } from "@/lib/api-client";
import { Reveal } from "@/components/site/reveal";
import { ServiceCard } from "@/components/site/service-card";

type Service = {
  id: string; slug: string; title: string; shortDesc: string | null;
  description: string | null; icon: string | null; priceLabel: string | null;
  order: number; featured: boolean;
};

export function ServicesSection() {
  const [items, setItems] = useState<Service[]>([]);

  useEffect(() => {
    api<{ items: Service[] }>("/api/public/services").then((r) => {
      if (r.ok && r.data) setItems(r.data.items);
    });
  }, []);

  return (
    <section id="services" className="relative py-20 md:py-28">
      <div className="container mx-auto px-4">
        <Reveal className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary mb-4">
            <LayoutGrid className="h-4 w-4" />
            خدمات ما
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-foreground">
            راهکارهای مالی <span className="text-gradient-brand">جامع</span> برای کسب‌وکار شما
          </h2>
          <p className="mt-4 text-muted-foreground text-base md:text-lg">
            از حسابداری تا مشاوره مالیاتی و نرم‌افزار؛ همه‌چیز در یک موسسه قابل اعتماد.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {items.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.06} className="h-full">
              <ServiceCard service={s} index={i} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="text-center mt-10">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-6 py-3 font-bold hover:border-primary/40 hover:bg-primary/5 transition-all group"
          >
            مشاهده همه خدمات
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

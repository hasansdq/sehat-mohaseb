"use client";

import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { api } from "@/lib/api-client";
import { Reveal } from "@/components/site/reveal";

type T = { id: string; name: string; company: string | null; role: string | null; message: string; rating: number; avatarUrl: string | null };

export function TestimonialsSection() {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    api<{ items: T[] }>("/api/public/testimonials").then((r) => {
      if (r.ok && r.data) setItems(r.data.items);
    });
  }, []);

  if (!items.length) return null;

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-[90%] bg-amber-400/5 blur-[120px] rounded-full" />
      </div>
      <div className="container mx-auto px-4">
        <Reveal className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm font-bold text-amber-600 dark:text-amber-400 mb-4">
            <Star className="h-4 w-4" />
            نظر مشتریان
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-foreground">
            کسب‌وکارهایی که به ما <span className="text-gradient-brand">اعتماد</span> کردند
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {items.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.08} className="h-full">
              <div className="relative h-full rounded-2xl border border-border/60 bg-card/60 p-6 hover:-translate-y-1.5 hover:border-amber-400/40 transition-all">
                <Quote className="absolute top-4 left-4 h-10 w-10 text-primary/15" />
                <div className="flex items-center gap-1 mb-4 relative">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className={`h-4 w-4 ${idx < t.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
                <p className="relative text-foreground/85 leading-relaxed mb-6">«{t.message}»</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                  {t.avatarUrl ? (
                    <img src={t.avatarUrl} alt={t.name} className="h-11 w-11 rounded-full object-cover" />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-gradient-brand grid place-items-center text-white font-bold">
                      {t.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{[t.role, t.company].filter(Boolean).join(" • ")}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

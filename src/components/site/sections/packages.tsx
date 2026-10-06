"use client";

import { useEffect, useState } from "react";
import { Check, Star, Crown, ArrowLeft, Wand2, ShoppingBag, GraduationCap, Package } from "lucide-react";
import { api, toman } from "@/lib/api-client";
import { Reveal } from "@/components/site/reveal";
import { useUI } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

type Pkg = {
  id: string; name: string; software: string | null; category: string | null;
  shortDesc: string | null; description: string | null; features: string | null;
  price: number | null; oldPrice: number | null; badge: string | null; popular: boolean; icon: string | null;
};

const SOFTWARE_ICON: Record<string, any> = {
  "سپیدار": Package,
  "دشت": ShoppingBag,
  "آموزشی": GraduationCap,
};

export function PackagesSection() {
  const [items, setItems] = useState<Pkg[]>([]);
  const { openConsult, openPkg } = useUI();

  useEffect(() => {
    api<{ items: Pkg[] }>("/api/public/packages").then((r) => {
      if (r.ok && r.data) setItems(r.data.items);
    });
  }, []);

  return (
    <section id="packages" className="relative py-20 md:py-28">
      {/* bg */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-72 w-[80%] bg-primary/5 blur-[100px] rounded-full" />
      </div>
      <div className="container mx-auto px-4">
        <Reveal className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm font-bold text-amber-600 dark:text-amber-400 mb-4">
            <Crown className="h-4 w-4" />
            بسته‌های کسب‌وکار
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-foreground">
            پک آماده‌ی <span className="text-gradient-brand">رشد</span> کسب‌وکار شما
          </h2>
          <p className="mt-4 text-muted-foreground text-base md:text-lg">
            نرم‌افزار سپیدار، دشت و دوره‌های آموزشی؛ با مشاوره و پشتیبانی اختصاصی صحت محاسب.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 items-stretch">
          {items.map((p, i) => {
            const Icon = SOFTWARE_ICON[p.software || ""] || Package;
            const features = (p.features || "").split("\n").filter(Boolean);
            return (
              <Reveal key={p.id} delay={i * 0.06} className="h-full">
                <div
                  className={cn(
                    "relative h-full rounded-3xl p-6 flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-lg",
                    p.popular
                      ? "bg-gradient-to-b from-primary/10 to-card border-2 border-primary/50 shadow-glow lg:scale-[1.04] hover:border-primary"
                      : "border border-border/60 bg-card/60 hover:border-primary/40"
                  )}
                >
                  {p.popular && (
                    <div className="absolute top-0 inset-x-0 bg-gradient-brand text-white text-center text-xs font-bold py-1.5 flex items-center justify-center gap-1">
                      <Crown className="h-3.5 w-3.5" /> پیشنهاد ویژه
                    </div>
                  )}
                  {p.badge && !p.popular && (
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <Star className="h-3 w-3" /> {p.badge}
                    </div>
                  )}

                  <div className={cn("flex items-center gap-3", p.popular && "mt-7")}>
                    <div className="grid place-items-center h-12 w-12 rounded-2xl bg-gradient-brand text-white shadow-glow">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-muted-foreground">{p.software}</div>
                      <h3 className="font-display text-lg font-extrabold text-foreground leading-tight">{p.name}</h3>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-muted-foreground line-clamp-2">{p.shortDesc}</p>

                  <div className="mt-5">
                    {p.price != null ? (
                      <div className="flex items-end gap-2">
                        <span className="font-display text-3xl font-black text-foreground">{toman(p.price)}</span>
                        <span className="text-sm text-muted-foreground mb-1">تومان</span>
                        {p.oldPrice && (
                          <span className="text-sm text-muted-foreground/60 line-through mb-1 mr-1">{toman(p.oldPrice)}</span>
                        )}
                      </div>
                    ) : (
                      <div className="text-lg font-bold text-muted-foreground">استعلام قیمت</div>
                    )}
                  </div>

                  <ul className="mt-5 space-y-2.5 flex-1">
                    {features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm">
                        <span className="mt-0.5 grid place-items-center h-5 w-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-foreground/85">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => openConsult(p.name)}
                    className={cn(
                      "mt-6 w-full rounded-xl py-3 font-bold transition-all inline-flex items-center justify-center gap-2",
                      p.popular
                        ? "bg-gradient-brand text-white shadow-glow hover:shadow-glow-gold"
                        : "border border-border hover:border-primary/40 hover:bg-primary/5"
                    )}
                  >
                    درخواست این پک
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Custom package CTA */}
        <Reveal delay={0.1}>
          <div className="mt-10 relative overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-r from-amber-400/10 via-primary/5 to-transparent p-8 md:p-10">
            <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm mb-2">
                  <Wand2 className="h-5 w-5" />
                  پک اختصاصی هوش مصنوعی
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-black text-foreground">
                  مطمئن نیستی کدام پک مناسبته؟
                </h3>
                <p className="mt-2 text-muted-foreground max-w-xl">
                  با دستیار هوش مصنوعی صحت صحبت کن؛ اون بر اساس کسب‌وکار، تعداد کارکنان و بودجه‌ات بهترین پک را پیشنهاد می‌دهد.
                </p>
              </div>
              <button
                onClick={() => openPkg({})}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-gold text-amber-950 px-7 py-3.5 font-bold shadow-glow-gold hover:-translate-y-0.5 transition-all whitespace-nowrap"
              >
                <Wand2 className="h-5 w-5" />
                ساخت پک اختصاصی
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

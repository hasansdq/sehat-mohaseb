"use client";

import Link from "next/link";
import * as Icons from "lucide-react";
import { ArrowLeft } from "lucide-react";

type Service = {
  id: string;
  slug: string;
  title: string;
  shortDesc: string | null;
  description: string | null;
  icon: string | null;
  priceLabel: string | null;
  order: number;
  featured: boolean;
};

const FEATURE_HINTS: Record<string, string[]> = {
  hesabdari: ["دفاتر قانونی", "صورت‌های مالی", "گزارش ماهانه"],
  maliati: ["برنامه‌ریزی مالیاتی", "اظهارنامه", "کاهش جرایم"],
  sepidar: ["فروش و نصب", "آموزش اختصاصی", "پشتیبانی"],
  dasht: ["صندوق فروشگاهی", "مدیریت انبار", "گزارش فروش"],
  amoozesh: ["پروژه محور", "مدرک معتبر", "دسترسی طولانی"],
  "mali-mashwere": ["تحلیل مالی", "بودجه‌بندی", "استراتژی رشد"],
};

function renderIcon(name: string | null) {
  if (!name) return <Icons.CircleCheck className="h-7 w-7" />;
  const Comp = (Icons as any)[name] || Icons.Sparkles;
  return <Comp className="h-7 w-7" />;
}

function toPersianNum(n: number) {
  return String(n).padStart(2, "۰").replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
}

export function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  const hints = FEATURE_HINTS[service.slug] || [];

  return (
    <Link
      href={`/services/${service.slug}`}
      className="group relative block h-full rounded-3xl border border-border/60 bg-card/60 p-6 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-glow"
    >
      {/* hover glow corner */}
      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/0 group-hover:bg-primary/12 blur-3xl transition-all duration-500" />
      {/* top accent line on hover */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-brand opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {/* order number watermark */}
      <div className="absolute top-4 left-4 font-display text-5xl font-black text-foreground/5 group-hover:text-primary/10 transition-colors select-none">
        {toPersianNum(index + 1)}
      </div>

      <div className="relative">
        {/* icon */}
        <div className="relative inline-grid place-items-center h-16 w-16 rounded-2xl bg-gradient-brand text-white shadow-glow group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
          {renderIcon(service.icon)}
          <span className="absolute inset-0 rounded-2xl bg-gradient-brand opacity-40 blur-md -z-10 group-hover:opacity-70 transition-opacity" />
        </div>

        {/* title + desc */}
        <h3 className="mt-5 font-display text-xl font-extrabold text-foreground group-hover:text-primary transition-colors">
          {service.title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {service.shortDesc || service.description}
        </p>

        {/* feature hints */}
        {hints.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {hints.map((h) => (
              <span key={h} className="inline-flex items-center gap-1 rounded-lg bg-muted/60 border border-border/50 px-2 py-1 text-[11px] font-semibold text-muted-foreground group-hover:border-primary/20 group-hover:text-foreground/80 transition-colors">
                <Icons.Check className="h-3 w-3 text-primary" />
                {h}
              </span>
            ))}
          </div>
        )}

        {/* footer: price + CTA */}
        <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
          {service.priceLabel ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20 px-2.5 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Icons.Tag className="h-3.5 w-3.5" />
              {service.priceLabel}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">استعلام قیمت</span>
          )}
          <span className="inline-flex items-center gap-1 text-sm font-bold text-primary group-hover:gap-2 transition-all">
            جزئیات بیشتر
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}

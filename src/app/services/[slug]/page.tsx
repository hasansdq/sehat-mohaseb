"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as Icons from "lucide-react";
import {
  ArrowLeft, Check, Phone, Sparkles, ShieldCheck, Star, Clock,
  TrendingUp, FileText, Calculator, Receipt, Award, Headset, BadgeCheck,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { useUI } from "@/lib/ui-store";
import { Reveal } from "@/components/site/reveal";
import { SiteLayout } from "@/components/site/site-layout";

type Service = {
  id: string; slug: string; title: string; shortDesc: string | null;
  description: string | null; icon: string | null; priceLabel: string | null;
  order: number; featured: boolean;
};

type Pkg = {
  id: string; name: string; software: string | null; category: string | null;
  shortDesc: string | null; features: string | null; price: number | null;
  oldPrice: number | null; badge: string | null; popular: boolean; icon: string | null;
};

type Faq = { id: string; question: string; answer: string };

// Per-service detailed content (slug → extended landing content)
const SERVICE_CONTENT: Record<string, {
  intro: string;
  benefits: { icon: keyof typeof Icons; title: string; desc: string }[];
  process: { title: string; desc: string }[];
  faqs: { q: string; a: string }[];
}> = {
  "modiriat-mali": {
    intro: "طراحی و پیاده‌سازی سیستم‌های مکانیزه مالی متناسب با نیاز کسب‌وکار شما؛ از برنامه‌ریزی بودجه تا تحلیل عملکرد و بهینه‌سازی جریان نقدینگی.",
    benefits: [
      { icon: "FileText", title: "برنامه‌ریزی و بودجه‌بندی مالی", desc: "تدوین بودجه عملیاتی متناسب با اهداف کسب‌وکار" },
      { icon: "TrendingUp", title: "تحلیل و ارزیابی عملکرد مالی", desc: "بررسی دقیق عملکرد و شناسایی نقاط بهبود" },
      { icon: "Wallet", title: "بهینه‌سازی جریان نقدینگی", desc: "مدیریت و بهبود جریان نقدی کسب‌وکار" },
      { icon: "ShieldCheck", title: "شفافیت مالی", desc: "گزارش‌های مالی قابل استناد و شفاف" },
    ],
    process: [
      { title: "ارزیابی وضعیت مالی", desc: "بررسی ساختار مالی فعلی و شناسایی نیازها" },
      { title: "طراحی سیستم", desc: "تدوین معماری سیستم مالی متناسب با کسب‌وکار" },
      { title: "پیاده‌سازی", desc: "استقرار سیستم و آموزش فرآیندها" },
      { title: "پایش و بهبود", desc: "کنترل مداوم و بهینه‌سازی مستمر" },
    ],
    faqs: [
      { q: "سیستم مالی برای چه کسب‌وکاری مناسب است؟", a: "برای هر کسب‌وکاری که نیاز به گزارش‌های مالی دقیق و منظم دارد." },
      { q: "هزینه پیاده‌سازی چقدر است؟", a: "بسته به حجم و پیچیدگی کسب‌وکار، پس از ارزیابی اعلام می‌شود." },
    ],
  },
  "mashwere-mali-maliati": {
    intro: "ارائه راهکارهای بهینه‌سازی مالیاتی، تحلیل قوانین و بخشنامه‌های مالیاتی، و مشاوره در تصمیم‌گیری‌های مالی و سرمایه‌گذاری.",
    benefits: [
      { icon: "Receipt", title: "بهینه‌سازی مالیاتی", desc: "ارائه راهکارهای قانونی برای کاهش بار مالیاتی" },
      { icon: "FileText", title: "تحلیل قوانین مالیاتی", desc: "بررسی دقیق بخشنامه‌ها و قوانین روز" },
      { icon: "TrendingUp", title: "مشاوره سرمایه‌گذاری", desc: "تصمیم‌گیری آگاهانه در سرمایه‌گذاری‌های مالی" },
      { icon: "ShieldCheck", title: "کاهش ریسک", desc: "پیشگیری از جرایم و ریسک‌های مالیاتی" },
    ],
    process: [
      { title: "بررسی وضعیت مالیاتی", desc: "تحلیل وضعیت فعلی و شناسایی ریسک‌ها" },
      { title: "برنامه‌ریزی مالیاتی", desc: "تدوین راهکار بهینه‌سازی مالیاتی" },
      { title: "اجرا و پیگیری", desc: "تنظیم اظهارنامه و پیگیری امور مالیاتی" },
      { title: "پایش مستمر", desc: "به‌روزرسانی راهکارها طبق تغییرات قانون" },
    ],
    faqs: [
      { q: "آیا می‌توانید جرایم گذشته را کاهش دهید؟", a: "در بسیاری موارد قابل اعتراض و کاهش است؛ بسته به مورد بررسی می‌شود." },
      { q: "مشاوره به‌صورت حضوری است؟", a: "هم حضوری و هم آنلاین قابل ارائه است." },
    ],
  },
  "hasabarasi-hesabdari": {
    intro: "برنامه‌ریزی و اجرای دستورالعمل‌های حسابداری؛ تهیه و تنظیم صورت‌های مالی، کنترل و تطبیق اسناد، و انجام حسابرسی داخلی برای بررسی صحت داده‌های مالی.",
    benefits: [
      { icon: "FileText", title: "تهیه صورت‌های مالی", desc: "ترازنامه، سود و زیان و جریان نقدینگی" },
      { icon: "ShieldCheck", title: "کنترل اسناد", desc: "تطبیق اسناد و گزارش‌های حسابداری" },
      { icon: "CheckCircle2", title: "حسابرسی داخلی", desc: "بررسی صحت داده‌های مالی و کشف خطا" },
      { icon: "Award", title: "گزارش قابل استناد", desc: "گزارش‌های استاندارد و قابل ارائه به مراجع" },
    ],
    process: [
      { title: "برنامه‌ریزی", desc: "تدوین دستورالعمل‌های حسابداری" },
      { title: "تهیه صورت‌های مالی", desc: "تنظیم ترازنامه و گزارش‌ها" },
      { title: "حسابرسی داخلی", desc: "بررسی صحت داده‌ها و اسناد" },
      { title: "گزارش‌دهی", desc: "ارائه نتایج و توصیه‌ها" },
    ],
    faqs: [
      { q: "حسابرسی چقدر طول می‌کشد؟", a: "بسته به حجم داده‌ها، معمولاً بین ۱ تا ۴ هفته." },
      { q: "آیا گزارش شما برای مراجع رسمی قابل استناد است؟", a: "بله، گزارش‌ها مطابق استانداردهای حسابداری تهیه می‌شوند." },
    ],
  },
  "coaching-kasbokar": {
    intro: "روش‌ها و رویه‌های مالی، اداری، بازرگانی و فروش؛ تحلیل مدل کسب‌وکار، بهبود فرآیندهای داخلی، و همراهی در تصمیم‌گیری‌های کلیدی و توسعه کسب‌وکار.",
    benefits: [
      { icon: "TrendingUp", title: "تحلیل مدل کسب‌وکار", desc: "بررسی مدل و ارائه استراتژی رشد" },
      { icon: "Users2", title: "بهبود فرآیندها", desc: "بهینه‌سازی فرآیندهای داخلی و مدیریت عملکرد" },
      { icon: "Star", title: "توسعه کسب‌وکار", desc: "همراهی در تصمیم‌گیری‌های کلیدی توسعه" },
      { icon: "ShieldCheck", title: "مدیریت ریسک", desc: "شناسایی و مدیریت ریسک‌های کسب‌وکار" },
    ],
    process: [
      { title: "تحلیل مدل", desc: "بررسی مدل کسب‌وکار فعلی" },
      { title: "تشخیص فرصت‌ها", desc: "شناسایی نقاط رشد و بهبود" },
      { title: "تدوین استراتژی", desc: "طراحی نقشه راه رشد و توسعه" },
      { title: "اجرا و همراهی", desc: "پیاده‌سازی و همراهی مستمر" },
    ],
    faqs: [
      { q: "کوچینگ کسب‌وکار چیست؟", a: "همراهی تخصصی برای بهبود فرآیندها و رشد کسب‌وکار شما." },
      { q: "دوره مشاوره چقدر طول می‌کشد؟", a: "بسته به نیاز، از چند جلسه تا همراهی مستمر." },
    ],
  },
  "sepidar-dasht-system": {
    intro: "استقرار و راه‌اندازی نرم‌افزار سپیدار و دشت، آموزش کاربری و بهینه‌سازی فرآیندهای مالی در نرم‌افزار، و پشتیبانی، رفع خطا و به‌روزرسانی سیستم‌ها به‌عنوان نماینده رسمی.",
    benefits: [
      { icon: "BadgeCheck", title: "نماینده رسمی", desc: "نماینده رسمی آموزش و فروش سپیدار و دشت" },
      { icon: "Package", title: "استقرار و راه‌اندازی", desc: "نصب و راه‌اندازی نرم‌افزار سپیدار و دشت" },
      { icon: "GraduationCap", title: "آموزش کاربری", desc: "آموزش و بهینه‌سازی فرآیندهای مالی" },
      { icon: "Headset", title: "پشتیبانی", desc: "پشتیبانی، رفع خطا و به‌روزرسانی" },
    ],
    process: [
      { title: "مشاوره و انتخاب", desc: "انتخاب نرم‌افزار مناسب کسب‌وکار" },
      { title: "استقرار", desc: "نصب و راه‌اندازی نرم‌افزار" },
      { title: "آموزش", desc: "آموزش کاربری به تیم شما" },
      { title: "پشتیبانی", desc: "پشتیبانی فنی و به‌روزرسانی" },
    ],
    faqs: [
      { q: "کدام نرم‌افزار برای کسب‌وکار من مناسب است؟", a: "سپیدار برای شرکت‌ها و دشت برای فروشگاه‌ها؛ کارشناسان ما مشاوره می‌دهند." },
      { q: "پشتیبانی چقدر طول می‌کشد؟", a: "بسته به پلن انتخابی، از ۳ تا ۲۴ ماه." },
    ],
  },
};

function renderIcon(name: keyof typeof Icons) {
  const Comp = (Icons as any)[name] || Icons.Sparkles;
  return <Comp className="h-6 w-6" />;
}

export default function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>("");
  const [service, setService] = useState<Service | null>(null);
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [generalFaqs, setGeneralFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const { openConsult } = useUI();

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    api<{ service: Service }>(`/api/public/services/${slug}`).then((r) => {
      if (r.ok && r.data?.service) setService(r.data.service);
      setLoading(false);
    });
    api<{ items: Pkg[] }>("/api/public/packages").then((r) => {
      if (r.ok && r.data) setPackages(r.data.items);
    });
    api<{ items: Faq[] }>("/api/public/faqs").then((r) => {
      if (r.ok && r.data) setGeneralFaqs(r.data.items);
    });
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen grid place-items-center pt-32 text-muted-foreground">در حال بارگذاری...</div>;
  }
  if (!service) {
    notFound();
  }

  const content = SERVICE_CONTENT[service.slug] || SERVICE_CONTENT["modiriat-mali"];
  const Icon = (Icons as any)[service.icon || "Sparkles"] || Icons.Sparkles;
  const relatedPackages = packages.filter((p) => {
    if (service.slug === "sepidar-dasht-system") return true; // show all packages for the system service
    return false;
  }).slice(0, 3);

  return (
    <SiteLayout>
      {/* ===== Hero ===== */}
      <section className="relative pt-36 md:pt-44 pb-16 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background to-background" />
          <div className="absolute -top-10 right-1/4 h-80 w-80 rounded-full bg-primary/18 blur-[110px] animate-float-slow" />
          <div className="absolute top-20 left-0 h-64 w-64 rounded-full bg-amber-400/15 blur-[100px] animate-float" />
          <div className="absolute inset-0 dot-pattern dot-grid-fade opacity-[0.45] dark:opacity-[0.65]" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="container mx-auto px-4">
          {/* breadcrumb */}
          <Reveal>
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 flex-wrap">
              <Link href="/" className="hover:text-primary transition-colors">خانه</Link>
              <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
              <Link href="/services" className="hover:text-primary transition-colors">خدمات</Link>
              <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
              <span className="text-foreground font-semibold">{service.title}</span>
            </nav>
          </Reveal>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary mb-5">
                  <BadgeCheck className="h-4 w-4" />
                  خدمت تخصصی صحت محاسب
                </div>
              </Reveal>
              <Reveal delay={0.08}>
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative inline-grid place-items-center h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-brand text-white shadow-glow">
                    <Icon className="h-8 w-8 sm:h-10 sm:w-10" />
                    <span className="absolute inset-0 rounded-2xl bg-gradient-brand opacity-40 blur-md -z-10" />
                  </div>
                  <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-tight">
                    {service.title}
                  </h1>
                </div>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  {service.shortDesc || content.intro}
                </p>
              </Reveal>
              <Reveal delay={0.24}>
                <p className="mt-3 text-sm sm:text-base text-muted-foreground/80 leading-relaxed max-w-2xl">
                  {content.intro}
                </p>
              </Reveal>
              <Reveal delay={0.32}>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => openConsult(service.title)}
                    className="group inline-flex items-center gap-2 rounded-full bg-gradient-brand text-white px-7 py-3.5 font-bold shadow-glow hover:shadow-glow-gold hover:-translate-y-0.5 transition-all"
                  >
                    <Sparkles className="h-5 w-5" />
                    درخواست این خدمت
                  </button>
                  {service.priceLabel && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 px-4 py-3.5 text-sm font-bold text-amber-600 dark:text-amber-400">
                      <Receipt className="h-4 w-4" />
                      {service.priceLabel}
                    </span>
                  )}
                </div>
              </Reveal>
            </div>

            {/* highlight card */}
            <div className="lg:col-span-5">
              <Reveal delay={0.2}>
                <div className="relative glass-strong rounded-3xl p-6 shadow-2xl border border-white/10 overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-brand" />
                  <div className="absolute -top-10 -left-10 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-4">
                      <ShieldCheck className="h-5 w-5 text-emerald-500" />
                      <span className="font-bold text-foreground">چرا صحت محاسب؟</span>
                    </div>
                    <ul className="space-y-3">
                      {content.benefits.slice(0, 4).map((b, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="grid place-items-center h-9 w-9 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                            {renderIcon(b.icon)}
                          </span>
                          <div>
                            <div className="font-bold text-foreground text-sm">{b.title}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{b.desc}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Benefits grid ===== */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary mb-4">
              مزایا
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground">
              چرا این خدمت <span className="text-gradient-brand">مهم</span> است؟
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {content.benefits.map((b, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="group h-full rounded-2xl border border-border/60 bg-card/60 p-5 hover:border-primary/40 hover:-translate-y-1 hover:shadow-glow transition-all">
                  <div className="grid place-items-center h-12 w-12 rounded-2xl bg-gradient-brand text-white shadow-glow mb-4 group-hover:scale-110 transition-transform">
                    {renderIcon(b.icon)}
                  </div>
                  <h3 className="font-display text-lg font-extrabold text-foreground">{b.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Process timeline ===== */}
      <section className="py-16 md:py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary mb-4">
              مسیر همکاری
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground">
              چگونه <span className="text-gradient-brand">کار می‌کنیم</span>
            </h2>
          </Reveal>
          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {content.process.map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="relative rounded-2xl border border-border/60 bg-card/60 p-5 hover:border-primary/40 transition-all">
                  <div className="absolute top-4 left-4 font-display text-4xl font-black text-foreground/5 select-none">
                    {String(i + 1).padStart(2, "۰").replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d])}
                  </div>
                  <div className="relative">
                    <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-3">گام {i + 1}</span>
                    <h3 className="font-display text-lg font-extrabold text-foreground">{p.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Related packages (if any) ===== */}
      {relatedPackages.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <Reveal className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm font-bold text-amber-600 dark:text-amber-400 mb-4">
                <Star className="h-4 w-4" />
                بسته‌های پیشنهادی
              </div>
              <h2 className="font-display text-3xl font-black text-foreground">
                پک‌های مرتبط با این خدمت
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-5">
              {relatedPackages.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.06}>
                  <div className={`rounded-2xl border p-5 h-full ${p.popular ? "border-primary/40 bg-primary/5" : "border-border/60 bg-card/60"}`}>
                    <h3 className="font-display text-lg font-extrabold text-foreground">{p.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.shortDesc}</p>
                    {p.price != null && (
                      <div className="mt-4 font-display text-2xl font-black text-foreground">
                        {p.price.toLocaleString("fa-IR")} <span className="text-sm text-muted-foreground">تومان</span>
                      </div>
                    )}
                    <ul className="mt-4 space-y-2">
                      {(p.features || "").split("\n").filter(Boolean).slice(0, 4).map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-foreground/85">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => openConsult(p.name)}
                      className="mt-5 w-full rounded-xl bg-gradient-brand text-white py-2.5 text-sm font-bold shadow-glow hover:opacity-90 transition-opacity"
                    >
                      درخواست این پک
                    </button>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Service-specific FAQ ===== */}
      <section className="py-16 md:py-20 bg-card/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <Reveal className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary mb-4">
              سوالات متداول
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground">
              پرسش‌های <span className="text-gradient-brand">رایج</span>
            </h2>
          </Reveal>
          <div className="space-y-3">
            {content.faqs.map((f, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <FAQItem question={f.q} answer={f.a} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-amber-400/5 p-8 md:p-12 text-center">
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
              <div className="relative">
                <h2 className="font-display text-2xl md:text-3xl font-black text-foreground">
                  آماده شروع هستید؟
                </h2>
                <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                  همین حالا درخواست دهید تا کارشناسان ما با شما تماس بگیرند.
                </p>
                <button
                  onClick={() => openConsult(service.title)}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-brand text-white px-7 py-3.5 font-bold shadow-glow hover:shadow-glow-gold hover:-translate-y-0.5 transition-all"
                >
                  <Phone className="h-5 w-5" />
                  درخواست مشاوره
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl border bg-card/60 overflow-hidden transition-all ${open ? "border-primary/40 shadow-glow" : "border-border/60"}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 p-5 text-right">
        <span className="font-bold text-foreground">{question}</span>
        <span className="grid place-items-center h-8 w-8 rounded-full bg-primary/10 text-primary flex-shrink-0 transition-transform" style={{ transform: open ? "rotate(45deg)" : "rotate(0)" }}>
          <Icons.Plus className="h-4 w-4" />
        </span>
      </button>
      <div className="grid transition-all duration-300" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 text-muted-foreground leading-relaxed">{answer}</div>
        </div>
      </div>
    </div>
  );
}

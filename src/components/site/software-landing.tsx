"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import {
  ArrowLeft, Phone, Sparkles, ShieldCheck, Check, Package, ShoppingBag,
  CheckCircle2, TrendingUp, Building2, Users2, FileText, BarChart3, Layers,
  Zap, Server, Star, Award, BadgeCheck,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { SiteLayout } from "@/components/site/site-layout";
import { Reveal } from "@/components/site/reveal";
import { useUI } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

type Pkg = {
  id: string; name: string; software: string | null; category: string | null;
  shortDesc: string | null; features: string | null; price: number | null;
  oldPrice: number | null; badge: string | null; popular: boolean; icon: string | null;
};

type Faq = { id: string; question: string; answer: string };

// Per-software config: which landing-section to read, accent color, icon set.
type SoftwareConfig = {
  slug: "sepidar" | "dasht";
  section: string; // landing-block section key
  title: string; // nav title
  heroIcon: any;
  accent: string; // tailwind gradient
  featureIcons: any[]; // 6 icons for feature cards
  audienceIcons: any[];
  whyusIcons: any[];
  relatedSoftwareFilter: string; // filter packages by software name
  demoTopic: string;
};

const SOFTWARE: Record<string, SoftwareConfig> = {
  sepidar: {
    slug: "sepidar",
    section: "sepidar",
    title: "نرم‌افزار سپیدار",
    heroIcon: Package,
    accent: "from-emerald-500/20 to-emerald-500/5",
    featureIcons: [FileText, Layers, Users2, Server, BarChart3, Building2],
    audienceIcons: [Briefcase, Factory, Store, Network],
    whyusIcons: [Award, ShieldCheck, Users2, Headset, Receipt, RefreshCw],
    relatedSoftwareFilter: "سپیدار",
    demoTopic: "درخواست دمو نرم‌افزار سپیدار",
  },
  dasht: {
    slug: "dasht",
    section: "dasht",
    title: "نرم‌افزار دشت",
    heroIcon: ShoppingBag,
    accent: "from-amber-400/20 to-amber-400/5",
    featureIcons: [ShoppingBag, Layers, Users2, Building2, BarChart3, Zap],
    audienceIcons: [Store, Building2, ShoppingCart, Package],
    whyusIcons: [Award, ShieldCheck, Users2, Headset, Package, ShoppingCart],
    relatedSoftwareFilter: "دشت",
    demoTopic: "درخواست دمو نرم‌افزار دشت",
  },
};

// import the additional icons used above (Briefcase, Factory, Store, Network, etc.)
import {
  Briefcase, Factory, Store, Network, ShoppingCart, Receipt, RefreshCw, Headset,
} from "lucide-react";

export function SoftwareLandingPage({ slug }: { slug: "sepidar" | "dasht" }) {
  const cfg = SOFTWARE[slug];
  const [blocks, setBlocks] = useState<Record<string, string>>({});
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const { openConsult } = useUI();

  useEffect(() => {
    api<{ items: { section: string; key: string; value: string }[] }>("/api/public/landing").then((r) => {
      if (r.ok && r.data) {
        const map: Record<string, string> = {};
        for (const it of r.data.items) map[`${it.section}.${it.key}`] = it.value;
        setBlocks(map);
      }
    });
    api<{ items: Pkg[] }>("/api/public/packages").then((r) => {
      if (r.ok && r.data) setPackages(r.data.items);
    });
    api<{ items: Faq[] }>("/api/public/faqs").then((r) => {
      if (r.ok && r.data) setFaqs(r.data.items);
    });
  }, []);

  // helper to read a block with fallback
  const b = (key: string, fallback = "") => blocks[`${cfg.section}.${key}`] || fallback;

  const relatedPackages = packages.filter((p) => p.software === cfg.relatedSoftwareFilter).slice(0, 3);
  const HeroIcon = cfg.heroIcon;

  return (
    <SiteLayout>
      {/* ===== Hero ===== */}
      <section className="relative pt-36 md:pt-44 pb-16 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background to-background" />
          <div className={`absolute -top-10 right-1/4 h-80 w-80 rounded-full ${cfg.slug === "sepidar" ? "bg-emerald-500/15" : "bg-amber-400/15"} blur-[110px] animate-float-slow`} />
          <div className="absolute top-20 left-0 h-64 w-64 rounded-full bg-primary/12 blur-[100px] animate-float" />
          <div className="absolute inset-0 dot-pattern dot-grid-fade opacity-[0.45] dark:opacity-[0.65]" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="container mx-auto px-4">
          {/* breadcrumb */}
          <Reveal>
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 flex-wrap">
              <Link href="/" className="hover:text-primary transition-colors">خانه</Link>
              <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
              <span className="text-foreground font-semibold">{cfg.title}</span>
            </nav>
          </Reveal>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary mb-5">
                  <BadgeCheck className="h-4 w-4" />
                  {b("hero_eyebrow", cfg.title)}
                </div>
              </Reveal>
              <Reveal delay={0.08}>
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative inline-grid place-items-center h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-brand text-white shadow-glow">
                    <HeroIcon className="h-8 w-8 sm:h-10 sm:w-10" />
                    <span className="absolute inset-0 rounded-2xl bg-gradient-brand opacity-40 blur-md -z-10" />
                  </div>
                  <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-tight">
                    {b("hero_title", cfg.title)}
                  </h1>
                </div>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  {b("hero_subtitle")}
                </p>
              </Reveal>
              <Reveal delay={0.24}>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => openConsult(cfg.demoTopic)}
                    className="group inline-flex items-center gap-2 rounded-full bg-gradient-brand text-white px-7 py-3.5 font-bold shadow-glow hover:shadow-glow-gold hover:-translate-y-0.5 transition-all"
                  >
                    <Sparkles className="h-5 w-5" />
                    {b("hero_cta1", "درخواست دمو")}
                  </button>
                  <Link
                    href="/packages"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-7 py-3.5 font-bold hover:border-primary/40 hover:bg-primary/5 transition-all"
                  >
                    {b("hero_cta2", "مشاهده بسته‌ها")}
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </div>
              </Reveal>
              <Reveal delay={0.32}>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/20 px-4 py-2 text-sm font-bold text-amber-600 dark:text-amber-400">
                  <Award className="h-4 w-4" />
                  {b("hero_badge", "نماینده رسمی")}
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
                      <span className="font-bold text-foreground">چرا از صحت محاسب؟</span>
                    </div>
                    <ul className="space-y-2.5">
                      {cfg.whyusIcons.slice(0, 4).map((Icon, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="grid place-items-center h-8 w-8 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="text-sm font-semibold text-foreground pt-1">{b(`whyus${i + 1}`)}</div>
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

      {/* ===== Overview ===== */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <Reveal className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary mb-4">
              معرفی نرم‌افزار
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground">
              {b("overview_title", "نرم‌افزار چیست؟")}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-center">
              {b("overview_body")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== Features grid ===== */}
      <section className="py-16 md:py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary mb-4">
              امکانات
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground">
              امکانات <span className="text-gradient-brand">{cfg.title}</span>
            </h2>
            <p className="mt-4 text-muted-foreground">هر آنچه برای مدیریت مالی کسب‌وکار نیاز دارید.</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cfg.featureIcons.map((Icon, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="group h-full rounded-2xl border border-border/60 bg-card/60 p-5 hover:border-primary/40 hover:-translate-y-1 hover:shadow-glow transition-all">
                  <div className="grid place-items-center h-12 w-12 rounded-2xl bg-gradient-brand text-white shadow-glow mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-extrabold text-foreground">{b(`feat${i + 1}_title`)}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b(`feat${i + 1}_desc`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Audience ===== */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <Reveal className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary mb-4">
              مخاطب
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground">
              {b("audience_title", "برای چه کسب‌وکاری مناسب است؟")}
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cfg.audienceIcons.map((Icon, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="rounded-2xl border border-border/60 bg-card/60 p-5 text-center hover:border-primary/40 hover:-translate-y-1 transition-all">
                  <span className="inline-grid place-items-center h-12 w-12 rounded-2xl bg-primary/10 text-primary mb-3">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="font-bold text-foreground">{b(`audience${i + 1}`)}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Why us ===== */}
      <section className="py-16 md:py-20 bg-card/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <Reveal className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm font-bold text-amber-600 dark:text-amber-400 mb-4">
              <Star className="h-4 w-4" />
              چرا ما؟
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground">
              {b("whyus_title", "چرا از صحت محاسب بخرید؟")}
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cfg.whyusIcons.map((Icon, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/60 p-4 hover:border-primary/40 transition-all">
                  <span className="grid place-items-center h-9 w-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                    <Check className="h-5 w-5" />
                  </span>
                  <div className="text-sm font-semibold text-foreground pt-1.5">{b(`whyus${i + 1}`)}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Related packages ===== */}
      {relatedPackages.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <Reveal className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm font-bold text-amber-600 dark:text-amber-400 mb-4">
                <Star className="h-4 w-4" />
                بسته‌های پیشنهادی
              </div>
              <h2 className="font-display text-3xl font-black text-foreground">پک‌های {cfg.title}</h2>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-5">
              {relatedPackages.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.06}>
                  <div className={cn("rounded-2xl border p-5 h-full", p.popular ? "border-primary/40 bg-primary/5" : "border-border/60 bg-card/60")}>
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

      {/* ===== General FAQ (since FAQ removed from nav) ===== */}
      {faqs.length > 0 && (
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
              {faqs.slice(0, 5).map((f, i) => (
                <Reveal key={f.id} delay={i * 0.06}>
                  <FAQItem question={f.question} answer={f.answer} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Final CTA ===== */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-amber-400/5 p-8 md:p-12 text-center">
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
              <div className="relative">
                <h2 className="font-display text-2xl md:text-3xl font-black text-foreground">
                  {b("cta_title", "آماده شروع هستید؟")}
                </h2>
                <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                  {b("cta_subtitle")}
                </p>
                <button
                  onClick={() => openConsult(cfg.demoTopic)}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-brand text-white px-7 py-3.5 font-bold shadow-glow hover:shadow-glow-gold hover:-translate-y-0.5 transition-all"
                >
                  <Phone className="h-5 w-5" />
                  {b("cta_button", "درخواست مشاوره")}
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
    <div className={cn("rounded-2xl border bg-card/60 overflow-hidden transition-all", open ? "border-primary/40 shadow-glow" : "border-border/60")}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 p-5 text-right">
        <span className="font-bold text-foreground">{question}</span>
        <span className="grid place-items-center h-8 w-8 rounded-full bg-primary/10 text-primary flex-shrink-0 transition-transform" style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>
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

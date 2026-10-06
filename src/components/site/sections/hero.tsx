"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp, ShieldCheck, FileText, Calculator, Receipt, ArrowLeft, Sparkles,
  BadgeCheck, Users2, Clock, Wallet, Activity, CheckCircle2, Building2,
  PhoneCall, Zap,
} from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { useUI } from "@/lib/ui-store";
import { useScrollProgress } from "@/lib/scroll";
import { useIsMobile } from "@/hooks/use-mobile";
import { api } from "@/lib/api-client";

// Static icon mappings — text values are loaded from landing-blocks (admin editable).
const MINI_STAT_ICONS = [Users2, BadgeCheck, Clock, Wallet];
const FEATURE_ICONS = [ShieldCheck, TrendingUp, FileText];
const PARTNER_GRADIENTS = [
  "from-emerald-500/20 to-emerald-500/5",
  "from-amber-400/20 to-amber-400/5",
  "from-sky-500/20 to-sky-500/5",
];

export function Hero() {
  const { ref, progress } = useScrollProgress<HTMLDivElement>(["start start", "end start"]);
  const { openConsult, openChat } = useUI();
  const isMobile = useIsMobile();

  // All static hero text is loaded from landing-blocks (admin editable).
  const [blocks, setBlocks] = useState<Record<string, string>>({});
  useEffect(() => {
    api<{ items: { section: string; key: string; value: string }[] }>("/api/public/landing").then((r) => {
      if (r.ok && r.data) {
        const map: Record<string, string> = {};
        for (const it of r.data.items) map[`${it.section}.${it.key}`] = it.value;
        setBlocks(map);
      }
    });
  }, []);
  // helper with fallback to original hardcoded values
  const h = (key: string, fallback: string) => blocks[`hero.${key}`] || fallback;

  // 3D transforms driven by scroll — desktop only; on mobile we skip these
  // (heavy on weak GPUs) and render the dashboard statically.
  const desktop3D = !isMobile;
  const rotateX = desktop3D ? progress * -16 : 0;
  const rotateY = desktop3D ? progress * 10 : 0;
  const translateY = desktop3D ? progress * -60 : 0;
  const scale = desktop3D ? 1 - progress * 0.06 : 1;
  const opacity = desktop3D ? Math.max(0, 1 - progress * 1.2) : 1;

  // mouse tilt for 3D card (desktop only)
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const onMove = (e: React.MouseEvent) => {
    if (isMobile) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width - 0.5;
    const my = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: my * -14, y: mx * 20 });
  };
  const onLeave = () => setTilt({ x: 0, y: 0 });

  // chart bars
  const bars = [38, 52, 34, 66, 58, 80, 72, 92, 68, 88];

  return (
    <section ref={ref} className="relative min-h-screen flex items-center pt-36 md:pt-40 pb-20 overflow-hidden" id="home">
      {/* ===== Layer 0: background =====
          On MOBILE: simple flat gradient + subtle dots (no blurred orbs, no
          animated conic glow, no grid-pan — all GPU-expensive). On DESKTOP:
          the full multi-layer animated backdrop (unchanged). */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* base vertical gradient (both mobile + desktop) */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background to-background" />

        {/* MOBILE-ONLY simple background: two soft radial tints (no blur, no animation) */}
        <div
          className="mobile-only absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 80% 10%, color-mix(in oklab, var(--brand) 12%, transparent), transparent 60%), radial-gradient(ellipse 60% 40% at 15% 70%, color-mix(in oklab, var(--gold) 10%, transparent), transparent 60%)",
          }}
        />
        {/* MOBILE dots (static, no animation) */}
        <div className="mobile-only absolute inset-0 dot-pattern dot-grid-fade opacity-[0.4]" />

        {/* ===== DESKTOP-ONLY heavy decorative layers (hidden on mobile for performance) ===== */}

        {/* aurora layer (slow shifting conic) */}
        <div
          className="heavy-only-md absolute -top-1/4 left-1/2 -translate-x-1/2 h-[140%] w-[140%] animate-spin-slow opacity-60 conic-glow blur-[100px]"
          style={{ transform: `translateY(${progress * 80}px)` }}
        />
        {/* primary orb */}
        <div
          className="heavy-only-md absolute -top-24 -right-24 h-[36rem] w-[36rem] rounded-full bg-primary/20 blur-[120px] animate-float-slow"
          style={{ transform: `translateY(${progress * 140}px)` }}
        />
        {/* gold orb */}
        <div
          className="heavy-only-md absolute top-1/3 -left-32 h-[32rem] w-[32rem] rounded-full bg-amber-400/15 blur-[120px] animate-float"
          style={{ transform: `translateY(${progress * -100}px)` }}
        />
        {/* emerald orb bottom */}
        <div className="heavy-only-md absolute bottom-0 right-1/4 h-[24rem] w-[24rem] rounded-full bg-emerald-500/10 blur-[100px] animate-float-slow" style={{ animationDelay: "1.5s" }} />
        {/* grid lines (animated, desktop only) */}
        <div
          className="heavy-only-md absolute inset-0 opacity-[0.04] animate-grid-pan"
          style={{
            backgroundImage:
              "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          }}
        />
        {/* desktop dots */}
        <div className="heavy-only-md absolute inset-0 dot-pattern dot-grid-fade opacity-[0.5] dark:opacity-[0.7]" />
        {/* top + bottom fade (both) */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* ===== Layer 1: main content grid ===== */}
      <div className="container mx-auto px-4 grid lg:grid-cols-12 gap-8 lg:gap-6 items-center relative">
        {/* ---- Right column: text (lg:col-span-6, order-1) ---- */}
        <div
          style={{ opacity, transform: `translateY(${translateY}px) scale(${scale})` }}
          className="lg:col-span-6 order-1 lg:order-2"
        >
          {/* verified badge with pulse ring */}
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 backdrop-blur px-4 py-2 text-sm font-bold text-primary mb-6 shadow-glow">
              <span className="relative grid place-items-center">
                <BadgeCheck className="h-4 w-4" />
                <span className="heavy-only-md absolute inset-0 rounded-full bg-primary/40 pulse-ring" />
              </span>
              {h("badge", "نماینده رسمی سطح ۱ سپیدار و دشت")}
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            </div>
          </Reveal>

          {/* multi-tier headline */}
          <Reveal delay={0.08}>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-black leading-[1.12] text-foreground tracking-tight">
              {h("title_line1", "همراه مالی")}
              <br />
              <span className="relative inline-block">
                <span className="text-gradient-brand">{h("title_line2", "کسب‌وکار شما")}</span>
                <span className="absolute -bottom-1 right-0 h-1.5 w-full rounded-full bg-gradient-brand opacity-30 blur-sm" />
              </span>
              <br />
              {h("title_line3", "از حساب تا رشد")}
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
              {h("subtitle", "موسسه حسابداری صحت محاسب؛ امنیت مالی، شفافیت و رشد واقعی برای کسب‌وکار شما. خدمات حسابداری، مشاوره مالیاتی و نمایندگی نرم‌افزارهای سپیدار و دشت.")}
            </p>
          </Reveal>

          {/* dual CTAs */}
          <Reveal delay={0.24}>
            <div className="mt-7 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
              <button
                onClick={() => openConsult()}
                className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 text-white font-bold shadow-glow hover:shadow-glow-gold transition-all hover:-translate-y-0.5 overflow-hidden"
              >
                <span className="heavy-only-md absolute inset-0 animate-shimmer opacity-40" />
                <Sparkles className="h-5 w-5 relative" />
                <span className="relative">{h("cta1", "دریافت مشاوره رایگان")}</span>
              </button>
              <Link
                href="/packages"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card/60 px-7 py-3.5 font-bold hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                {h("cta2", "مشاهده بسته‌ها")}
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>

          {/* feature pills */}
          <Reveal delay={0.32}>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-sm text-muted-foreground">
              {FEATURE_ICONS.map((Icon, i) => (
                <div key={i} className="flex items-center gap-2 font-semibold">
                  <span className="grid place-items-center h-7 w-7 rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {h(`feature${i + 1}`, ["امنیت مالی", "کاهش ریسک مالیاتی", "گزارش‌های شفاف"][i] || "")}
                </div>
              ))}
            </div>
          </Reveal>

          {/* mini stats row — 4 inline KPI chips */}
          <Reveal delay={0.4}>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl">
              {MINI_STAT_ICONS.map((Icon, i) => (
                <div
                  key={i}
                  className="group rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-3 hover:border-primary/40 hover:bg-primary/5 transition-all"
                  style={{ animationDelay: `${0.5 + i * 0.08}s` }}
                >
                  <div className="flex items-center gap-2">
                    <span className="grid place-items-center h-8 w-8 rounded-lg bg-gradient-brand text-white shadow-glow group-hover:scale-110 transition-transform">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="font-display text-lg font-black text-foreground leading-none">
                        {h(`ministat${i + 1}_value`, ["+۸۵۰", "٪۹۸", "+۱۲", "+۳۰"][i] || "")}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{h(`ministat${i + 1}_label`, ["کسب‌وکار", "رضایت", "سال تجربه", "متخصص"][i] || "")}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* partner logos strip */}
          <Reveal delay={0.48}>
            <div className="mt-8 pt-6 border-t border-border/40">
              <div className="text-xs font-bold text-muted-foreground/70 mb-3">{h("partners_title", "نمایندگی رسمی")}</div>
              <div className="flex flex-wrap items-center gap-3">
                {PARTNER_GRADIENTS.map((color, i) => (
                  <div
                    key={i}
                    className={`group inline-flex items-center gap-2 rounded-xl bg-gradient-to-br ${color} border border-border/60 px-3.5 py-2 hover:border-primary/40 transition-all cursor-default`}
                  >
                    <Building2 className="h-4 w-4 text-foreground/70 group-hover:text-primary transition-colors" />
                    <div className="leading-tight">
                      <div className="text-sm font-extrabold text-foreground">{h(`partner${i + 1}_name`, ["سپیدار", "دشت", "همکاران سیستم"][i] || "")}</div>
                      <div className="text-[10px] text-muted-foreground">{h(`partner${i + 1}_sub`, ["همکاران سیستم", "نرم‌افزار فروشگاهی", "شریک رسمی"][i] || "")}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* ---- Left column: 3D visual cluster (lg:col-span-6, order-2) ----
            On MOBILE: the scroll-driven perspective/rotate transforms are
            skipped (use a plain static dashboard). On DESKTOP: full 3D
            perspective + scroll-driven rotateX/Y + mouse-tilt (unchanged). */}
        <div
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          style={{ transform: `perspective(1400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`, opacity, transformStyle: "preserve-3d" }}
          className="no-3d-xs lg:col-span-6 order-2 lg:order-1 mt-10 lg:mt-0"
        >
          <div
            style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transformStyle: "preserve-3d" }}
            className="no-3d-xs relative mx-auto w-full max-w-md sm:max-w-lg px-2 sm:px-0 transition-transform duration-200"
          >
            {/* ===== Mobile: inline stat strip above the dashboard (replaces floating cards) ===== */}
            <div className="sm:hidden grid grid-cols-2 gap-2 mb-3">
              <div className="flex items-center gap-2 rounded-xl glass-xs glass-strong p-2.5 border border-border/60">
                <div className="grid place-items-center h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-500 shadow-glow flex-shrink-0">
                  <Receipt className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] text-muted-foreground leading-none">{h("card1_label", "مالیات")}</div>
                  <div className="text-xs font-black text-foreground leading-tight">{h("card1_value", "٪۴۰ کاهش")}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl glass-xs glass-strong p-2.5 border border-border/60">
                <div className="grid place-items-center h-8 w-8 rounded-lg bg-amber-400/15 text-amber-500 shadow-glow-gold flex-shrink-0">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] text-muted-foreground leading-none">{h("card2_label", "رشد سود")}</div>
                  <div className="text-xs font-black text-foreground leading-tight">{h("card2_value", "+۱۸٪")}</div>
                </div>
              </div>
            </div>

            {/* ===== Desktop/tablet: floating accent cards (3D depth layers) ===== */}

            {/* top-left: tax reduction card */}
            <div
              className="hidden sm:block absolute -top-6 -left-8 lg:-left-10 glass-strong rounded-2xl p-3.5 shadow-glow z-20 animate-float-slow w-44 lg:w-48"
              style={{ transform: "translateZ(90px)" }}
            >
              <div className="flex items-center gap-2.5">
                <div className="grid place-items-center h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-500 shadow-glow flex-shrink-0">
                  <Receipt className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-muted-foreground">{h("card1_label", "مالیات سالانه")}</div>
                  <div className="text-base font-black text-foreground leading-tight">{h("card1_value", "٪۴۰ کاهش")}</div>
                </div>
              </div>
            </div>

            {/* bottom-right: growth card */}
            <div
              className="hidden sm:block absolute -bottom-4 -right-6 lg:-right-8 glass-strong rounded-2xl p-3.5 shadow-glow z-20 animate-float w-40 lg:w-44"
              style={{ transform: "translateZ(70px)" }}
            >
              <div className="flex items-center gap-2.5">
                <div className="grid place-items-center h-10 w-10 rounded-xl bg-amber-400/15 text-amber-500 shadow-glow-gold flex-shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-muted-foreground">{h("card2_label", "رشد سود")}</div>
                  <div className="text-base font-black text-foreground leading-tight">{h("card2_value", "+۱۸٪")}</div>
                </div>
              </div>
            </div>

            {/* right-middle: live consultation card — hidden on phones (too tight) */}
            <div
              className="hidden md:block absolute top-1/2 -right-14 lg:-right-16 -translate-y-1/2 glass-strong rounded-2xl p-3 shadow-glow z-20 animate-float-slow w-36"
              style={{ transform: "translateZ(55px)", animationDelay: "1s" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="relative grid place-items-center h-6 w-6 rounded-lg bg-emerald-500/15 text-emerald-500">
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse-soft" />
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">لایو</span>
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight">{h("card3_label", "مشاوره آنلاین")}</div>
              <div className="text-xs font-black text-foreground">{h("card3_value", "در حال پاسخ")}</div>
            </div>

            {/* ===== main dashboard card ===== */}
            <div
              className="glass-xs glass-strong rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/10 relative overflow-hidden no-3d-xs"
              style={{ transform: "translateZ(40px)" }}
            >
              {/* card top accent line */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-brand opacity-80" />
              {/* corner glow */}
              <div className="absolute -top-12 -left-12 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />

              <div className="relative flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-gradient-brand grid place-items-center shadow-glow">
                    <Calculator className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground leading-tight">{h("dash_title", "داشبورد مالی")}</div>
                    <div className="text-[10px] text-muted-foreground">{h("dash_subtitle", "صحت محاسب")}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {h("dash_status", "سالم")}
                </div>
              </div>

              {/* chart with gridlines + area */}
              <div className="relative h-36 rounded-2xl bg-gradient-to-br from-primary/8 to-amber-400/5 p-3 overflow-hidden border border-border/30">
                {/* horizontal gridlines */}
                <div className="absolute inset-3 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-px bg-foreground/5" />
                  ))}
                </div>
                {/* chart bars */}
                <div className="absolute inset-0 flex items-end gap-1 px-3 pb-3 pt-6">
                  {bars.map((bh, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-primary/40 to-primary transition-all duration-700 group-hover:from-primary/60 group-hover:to-amber-400"
                        style={{ height: `${bh}%`, transitionDelay: `${0.4 + i * 0.07}s` }}
                      />
                    </div>
                  ))}
                </div>
                {/* tooltip marker (static on mobile, animated pulse on desktop) */}
                <div className="absolute top-1/2 right-6 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-amber-400 ring-4 ring-amber-400/20 heavy-only-md animate-pulse-soft" />
                </div>
                <div className="absolute top-2 right-3 text-[10px] font-bold text-muted-foreground bg-background/60 backdrop-blur px-2 py-0.5 rounded-md">{h("dash_chart_label", "درآمد ۱۴۰۳")}</div>
              </div>

              {/* KPI row */}
              <div className="grid grid-cols-3 gap-2.5 mt-4">
                {[
                  { labelKey: "dash_kpi1_label", valueKey: "dash_kpi1_value", fbLabel: "درآمد", fbValue: "۲.۴B", icon: Wallet, color: "text-emerald-600 dark:text-emerald-400" },
                  { labelKey: "dash_kpi2_label", valueKey: "dash_kpi2_value", fbLabel: "هزینه", fbValue: "۸۶۰M", icon: Receipt, color: "text-amber-600 dark:text-amber-400" },
                  { labelKey: "dash_kpi3_label", valueKey: "dash_kpi3_value", fbLabel: "سود", fbValue: "۱.۵B", icon: TrendingUp, color: "text-primary" },
                ].map((s) => (
                  <div key={s.labelKey} className="rounded-xl bg-background/50 p-2.5 text-center border border-border/50 hover:border-primary/30 transition-colors">
                    <s.icon className={`h-3.5 w-3.5 mx-auto mb-1 ${s.color}`} />
                    <div className="text-[10px] text-muted-foreground">{h(s.labelKey, s.fbLabel)}</div>
                    <div className="text-sm font-black text-foreground mt-0.5">{h(s.valueKey, s.fbValue)}</div>
                  </div>
                ))}
              </div>

              {/* tax risk gauge bar */}
              <div className="mt-4 rounded-xl bg-background/40 border border-border/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Activity className="h-3.5 w-3.5 text-emerald-500" />
                    {h("dash_risk_label", "ریسک مالیاتی")}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{h("dash_risk_value", "کم")}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden relative">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-emerald-500 via-emerald-400 to-amber-400 transition-all duration-1000 ease-out"
                    style={{ width: "22%" }}
                  />
                </div>
              </div>

              {/* health badge */}
              <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                <ShieldCheck className="h-4 w-4" />
                {h("dash_health", "وضعیت مالی کسب‌وکار شما پایدار است")}
              </div>
            </div>

            {/* connecting dotted depth line (decorative) */}
            <svg
              className="absolute -top-10 -right-10 -z-10 opacity-30 hidden lg:block"
              width="120" height="120" viewBox="0 0 120 120" fill="none"
              aria-hidden
            >
              <path d="M10 10 Q 60 40 110 110" stroke="url(#dotline)" strokeWidth="2" strokeDasharray="2 6" fill="none" />
              <defs>
                <linearGradient id="dotline" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                  <stop stopColor="var(--brand)" />
                  <stop offset="1" stopColor="var(--gold)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* ===== Layer 2: AI assistant teaser — inline on mobile, floating on desktop ===== */}
      <Reveal delay={0.6}>
        {/* Mobile: inline CTA card (shown below the visual cluster) */}
        <div className="lg:hidden mt-8">
          <button
            onClick={openChat}
            className="w-full sm:w-auto group inline-flex items-center justify-center gap-3 rounded-2xl glass-strong border border-primary/20 px-4 py-3 shadow-glow hover:shadow-glow-gold hover:-translate-y-0.5 transition-all"
          >
            <span className="relative grid place-items-center h-10 w-10 rounded-xl bg-gradient-brand text-white flex-shrink-0">
              <Zap className="h-5 w-5" />
              <span className="absolute inset-0 rounded-xl bg-primary/40 pulse-ring" />
            </span>
            <div className="text-right leading-tight">
              <div className="text-sm font-black text-foreground">{h("ai_teaser_title", "دستیار هوشمند «صحت»")}</div>
              <div className="text-[11px] text-muted-foreground">{h("ai_teaser_sub", "ساختن پک اختصاصی با هوش مصنوعی")}</div>
            </div>
            <ArrowLeft className="h-4 w-4 text-primary group-hover:-translate-x-1 transition-transform flex-shrink-0" />
          </button>
        </div>

        {/* Desktop: floating bottom-right */}
        <div className="hidden lg:block">
          <button
            onClick={openChat}
            className="absolute bottom-10 right-8 group inline-flex items-center gap-3 rounded-2xl glass-strong border border-primary/20 px-4 py-3 shadow-glow hover:shadow-glow-gold hover:-translate-y-1 transition-all z-20"
            style={{ transform: "translateZ(30px)" }}
          >
            <span className="relative grid place-items-center h-10 w-10 rounded-xl bg-gradient-brand text-white">
              <Zap className="h-5 w-5" />
              <span className="absolute inset-0 rounded-xl bg-primary/40 pulse-ring" />
            </span>
            <div className="text-right leading-tight">
              <div className="text-sm font-black text-foreground">{h("ai_teaser_title", "دستیار هوشمند «صحت»")}</div>
              <div className="text-[11px] text-muted-foreground">{h("ai_teaser_sub", "ساختن پک اختصاصی با هوش مصنوعی")}</div>
            </div>
            <ArrowLeft className="h-4 w-4 text-primary group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
      </Reveal>

      {/* ===== scroll hint (desktop only — clutters mobile) ===== */}
      <div
        style={{ opacity }}
        className="hidden sm:flex absolute bottom-5 left-1/2 -translate-x-1/2 flex-col items-center gap-1.5 text-muted-foreground z-20"
      >
        <span className="text-[11px] font-semibold">{h("scroll_hint", "اسکرول کنید")}</span>
        <div className="relative h-9 w-5.5 rounded-full border-2 border-muted-foreground/40 grid place-items-start p-1">
          <span className="animate-float h-1.5 w-1.5 rounded-full bg-primary block" />
        </div>
      </div>
    </section>
  );
}

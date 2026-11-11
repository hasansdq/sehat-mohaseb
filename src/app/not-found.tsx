"use client";

import Link from "next/link";
import { Home, Search, ArrowLeft, FileQuestion, Sparkles, BookOpen } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { Reveal } from "@/components/site/reveal";

// Professional 404 page — matches the site's design language with
// animated background orbs, a large 404 display, and quick navigation
// shortcuts to the most-visited pages.
export default function NotFound() {
  return (
    <SiteLayout>
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-32 pb-20">
        {/* Background layers */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background to-background" />
          <div className="absolute -top-10 right-1/4 h-72 w-72 rounded-full bg-primary/15 blur-[100px] animate-float-slow" />
          <div className="absolute top-1/3 -left-20 h-64 w-64 rounded-full bg-amber-400/12 blur-[100px] animate-float" />
          <div className="absolute inset-0 dot-pattern dot-grid-fade opacity-[0.4] dark:opacity-[0.6]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="container mx-auto px-4 max-w-2xl text-center">
          <Reveal>
            {/* Large 404 display */}
            <div className="relative inline-block mb-8">
              <h1 className="font-display text-[8rem] sm:text-[10rem] md:text-[12rem] font-black leading-none text-gradient-brand opacity-90">
                ۴۰۴
              </h1>
              <div className="absolute inset-0 grid place-items-center">
                <div className="grid place-items-center h-20 w-20 rounded-3xl bg-background/80 backdrop-blur border border-primary/20 shadow-glow">
                  <FileQuestion className="h-10 w-10 text-primary" />
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-foreground mb-3">
              صفحه‌ای که دنبالش بودید پیدا نشد
            </h2>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              شاید آدرس را اشتباه وارد کرده‌اید یا این صفحه حذف شده است.
              می‌توانید به صفحه اصلی برگردید یا از راهنماهای زیر استفاده کنید.
            </p>
          </Reveal>

          {/* Primary CTA */}
          <Reveal delay={0.22}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-brand text-white px-7 py-3.5 font-bold shadow-glow hover:-translate-y-0.5 transition-all"
            >
              <Home className="h-5 w-5" />
              بازگشت به خانه
            </Link>
          </Reveal>

          {/* Quick links */}
          <Reveal delay={0.3}>
            <div className="mt-10 pt-8 border-t border-border/40">
              <div className="text-xs font-bold text-muted-foreground/70 mb-4">صفحات پر بازدید</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
                {[
                  { href: "/services", label: "خدمات", icon: BookOpen },
                  { href: "/packages", label: "بسته‌ها", icon: Sparkles },
                  { href: "/blog", label: "وبلاگ", icon: Search },
                  { href: "/about", label: "درباره ما", icon: Home },
                  { href: "/faq", label: "سوالات متداول", icon: FileQuestion },
                  { href: "/contact", label: "تماس", icon: ArrowLeft },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card/40 p-4 hover:border-primary/40 hover:bg-primary/5 transition-all"
                  >
                    <span className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                      <link.icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}

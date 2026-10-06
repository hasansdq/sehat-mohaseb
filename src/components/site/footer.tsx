"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Instagram, Send as Telegram, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api-client";

export function Footer() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    api<{ settings: Record<string, string> }>("/api/public/site").then((r) => {
      if (r.ok && r.data) setSettings(r.data.settings);
    });
  }, []);

  return (
    <footer className="relative mt-auto border-t border-border/60 bg-card/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-gradient-brand grid place-items-center shadow-glow">
                <svg width="22" height="22" viewBox="0 0 64 64" fill="none" aria-hidden>
                  <path d="M20 40 L28 28 L36 36 L48 22" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <circle cx="48" cy="22" r="4.5" fill="#e8b94a" />
                </svg>
              </div>
              <div>
                <div className="font-display text-base font-extrabold text-foreground">صحت محاسب</div>
                <div className="text-[10px] text-muted-foreground">نماینده رسمی سپیدار و دشت</div>
              </div>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-md">
              موسسه حسابداری صحت محاسب، همراه مالی کسب‌وکار شما؛ از حسابداری و مشاوره مالیاتی تا نرم‌افزار و آموزش.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {settings["social.instagram"] && (
                <a href={settings["social.instagram"]} target="_blank" rel="noreferrer" aria-label="اینستاگرام" className="grid place-items-center h-10 w-10 rounded-xl bg-background/60 border border-border hover:border-primary/40 hover:text-primary transition-all">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings["social.telegram"] && (
                <a href={settings["social.telegram"]} target="_blank" rel="noreferrer" aria-label="تلگرام" className="grid place-items-center h-10 w-10 rounded-xl bg-background/60 border border-border hover:border-primary/40 hover:text-primary transition-all">
                  <Telegram className="h-5 w-5" />
                </a>
              )}
              {settings["social.bale"] && (
                <a href={settings["social.bale"]} target="_blank" rel="noreferrer" aria-label="بله" className="grid place-items-center h-10 w-10 rounded-xl bg-background/60 border border-border hover:border-primary/40 hover:text-primary transition-all">
                  <span className="text-xs font-bold">بله</span>
                </a>
              )}
            </div>
          </div>

          {/* links */}
          <div>
            <div className="font-bold text-foreground mb-4">دسترسی سریع</div>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "/services", label: "خدمات" },
                { href: "/packages", label: "بسته‌های کسب‌وکار" },
                { href: "/software/sepidar", label: "نرم‌افزار سپیدار" },
                { href: "/software/dasht", label: "نرم‌افزار دشت" },
                { href: "/about", label: "درباره ما" },
                { href: "/articles", label: "مقالات" },
                { href: "/contact", label: "تماس با ما" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-muted-foreground hover:text-primary transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div>
            <div className="font-bold text-foreground mb-4">تماس با ما</div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5 text-muted-foreground">
                <Phone className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>{settings["contact.phone"] || "۰۲۱-۹۱۰۱۰۰۱۰"}</span>
              </li>
              <li className="flex items-start gap-2.5 text-muted-foreground">
                <Mail className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>{settings["contact.email"] || "info@sehatmohaseb.ir"}</span>
              </li>
              <li className="flex items-start gap-2.5 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span className="leading-relaxed">{settings["contact.address"] || "تهران، خیابان ولیعصر"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            تمامی حقوق برای موسسه صحت محاسب محفوظ است © {new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(new Date())}
          </div>
          <Link href="/sehat-ad" className="text-xs text-muted-foreground/70 hover:text-primary transition-colors flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            ورود مدیران
          </Link>
        </div>
      </div>
    </footer>
  );
}

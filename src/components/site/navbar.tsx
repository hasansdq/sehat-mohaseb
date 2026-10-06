"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, UserRound, LogOut, LayoutDashboard, Phone, Sparkles, ShieldCheck, Award, Headset, ChevronDown, Package, ShoppingBag } from "lucide-react";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { useUI } from "@/lib/ui-store";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

const LINKS = [
  { href: "/services", label: "خدمات" },
  { href: "/packages", label: "بسته‌ها" },
  { href: "/about", label: "درباره ما" },
  { href: "/articles", label: "مقالات" },
  { href: "/contact", label: "تماس" },
];

// "نرم افزارهای حسابداری" dropdown with two software landings as sub-items.
const SOFTWARE_DROPDOWN = {
  label: "نرم‌افزارهای حسابداری",
  items: [
    { href: "/software/sepidar", label: "نرم‌افزار سپیدار", sub: "حسابداری شرکتی", icon: Package },
    { href: "/software/dasht", label: "نرم‌افزار دشت", sub: "مدیریت فروشگاهی", icon: ShoppingBag },
  ],
};

const TRUST_ITEMS = [
  { icon: ShieldCheck, text: "نماینده رسمی سطح ۱ سپیدار و دشت" },
  { icon: Award, text: "+۱۲ سال تجربه در حسابداری" },
  { icon: Headset, text: "مشاوره رایگان ۰۲۱-۹۱۰۱۰۰۱۰" },
  { icon: Sparkles, text: "دستیار هوش مصنوعی ۲۴/۷" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenu] = useState(false);
  const [softwareOpen, setSoftwareOpen] = useState(false);
  const pathname = usePathname();
  const { setMenu: setMenuStore, openAuth, openPanel, user, setUser } = useUI();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close mobile menu + software dropdown on route change
  useEffect(() => { setMenu(false); setSoftwareOpen(false); }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isSoftwareActive = SOFTWARE_DROPDOWN.items.some((it) => isActive(it.href));

  const logout = async () => {
    await api("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.reload();
  };

  const handleMenu = (v: boolean) => { setMenu(v); setMenuStore(v); };

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "py-1.5" : "py-2.5"}`}>
      {/* Trust marquee bar */}
      <div className={`hidden md:block transition-all duration-500 overflow-hidden ${scrolled ? "h-0 opacity-0" : "h-9 opacity-100"}`}>
        <div className="container mx-auto px-4">
          <div className="rounded-t-2xl bg-gradient-brand/95 backdrop-blur-md text-white/95 flex items-center overflow-hidden h-9">
            <div className="flex items-center gap-6 px-3 py-1.5 whitespace-nowrap animate-marquee">
              {[...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS].map((t, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 text-[11px] font-bold">
                  <t.icon className="h-3.5 w-3.5 text-amber-300 flex-shrink-0" />
                  {t.text}
                  <span className="mx-3 text-white/30">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div
          className={`flex items-center justify-between rounded-2xl px-3 md:px-6 h-14 md:h-16 transition-all duration-500 ${
            scrolled ? "glass-strong shadow-lg shadow-black/5" : "glass border-b border-white/5"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="relative h-10 w-10 rounded-xl bg-gradient-brand grid place-items-center shadow-glow group-hover:scale-105 transition-transform">
              <span className="absolute inset-0 rounded-xl bg-gradient-brand opacity-50 blur-md -z-10 group-hover:opacity-80 transition-opacity" />
              <svg width="22" height="22" viewBox="0 0 64 64" fill="none" aria-hidden>
                <path d="M20 40 L28 28 L36 36 L48 22" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <circle cx="48" cy="22" r="4.5" fill="#e8b94a" />
              </svg>
            </div>
            <div className="leading-tight">
              <div className="font-display text-base font-extrabold text-foreground">صحت محاسب</div>
              <div className="text-[10px] text-muted-foreground font-medium hidden sm:block">نماینده رسمی سپیدار و دشت</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {/* Software dropdown */}
            <div className="relative group">
              <button
                className={`relative px-4 py-2 text-sm font-semibold transition-colors rounded-lg inline-flex items-center gap-1 ${
                  isSoftwareActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {SOFTWARE_DROPDOWN.label}
                <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                <span
                  className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-gradient-brand transition-all duration-300 ${
                    isSoftwareActive ? "w-6 opacity-100" : "w-0 opacity-0 group-hover:w-4 group-hover:opacity-50"
                  }`}
                />
              </button>
              {/* dropdown panel */}
              <div className="absolute top-full right-0 mt-1 w-72 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
                <div className="glass-strong rounded-2xl p-2 shadow-2xl border border-border/60">
                  {SOFTWARE_DROPDOWN.items.map((it) => {
                    const active = isActive(it.href);
                    return (
                      <Link
                        key={it.href}
                        href={it.href}
                        className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
                          active ? "bg-primary/10" : "hover:bg-primary/5"
                        }`}
                      >
                        <span className={`grid place-items-center h-10 w-10 rounded-xl flex-shrink-0 ${active ? "bg-gradient-brand text-white shadow-glow" : "bg-primary/10 text-primary"}`}>
                          <it.icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <div className={`text-sm font-bold ${active ? "text-primary" : "text-foreground"}`}>{it.label}</div>
                          <div className="text-[11px] text-muted-foreground">{it.sub}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {LINKS.map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative px-4 py-2 text-sm font-semibold transition-colors rounded-lg group ${
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                  <span
                    className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-gradient-brand transition-all duration-300 ${
                      active ? "w-6 opacity-100" : "w-0 opacity-0 group-hover:w-4 group-hover:opacity-50"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <a
              href="tel:+982191010010"
              className="hidden xl:flex items-center gap-1.5 text-sm font-bold text-foreground/80 hover:text-primary transition-colors px-2.5 py-1.5 rounded-lg hover:bg-primary/5"
            >
              <span className="relative grid place-items-center h-7 w-7 rounded-lg bg-primary/10 text-primary">
                <Phone className="h-3.5 w-3.5" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse-soft" />
              </span>
              <span dir="ltr">۰۲۱-۹۱۰۱۰۰۱۰</span>
            </a>
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-1.5">
                <Button size="sm" onClick={openPanel} className="hidden sm:inline-flex rounded-full bg-gradient-brand text-white shadow-glow hover:opacity-90 gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  پنل من
                </Button>
                <Button size="icon" variant="ghost" className="sm:hidden" onClick={openPanel} aria-label="پنل">
                  <UserRound className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="ghost" onClick={logout} aria-label="خروج">
                  <LogOut className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => openAuth("login")} className="rounded-full bg-gradient-brand text-white shadow-glow hover:shadow-glow-gold hover:opacity-90 px-4 md:px-5">
                <span className="hidden sm:inline">ورود / ثبت‌نام</span>
                <span className="sm:hidden">ورود</span>
              </Button>
            )}
            <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => handleMenu(!menuOpen)} aria-label="منو">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="lg:hidden mt-2">
            <div className="glass-strong rounded-2xl p-2 flex flex-col gap-1">
              {/* Software dropdown (collapsible) */}
              <button
                onClick={() => setSoftwareOpen(!softwareOpen)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isSoftwareActive ? "bg-primary/5 text-primary" : "hover:bg-primary/5 hover:text-primary"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {SOFTWARE_DROPDOWN.label}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${softwareOpen ? "rotate-180" : ""}`} />
              </button>
              {softwareOpen && (
                <div className="pr-4 flex flex-col gap-1 pb-1">
                  {SOFTWARE_DROPDOWN.items.map((it) => (
                    <Link
                      key={it.href}
                      href={it.href}
                      onClick={() => handleMenu(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                        isActive(it.href) ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
                      }`}
                    >
                      <span className="grid place-items-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
                        <it.icon className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="font-bold">{it.label}</div>
                        <div className="text-[11px] text-muted-foreground">{it.sub}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => handleMenu(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive(l.href) ? "bg-primary/5 text-primary" : "hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <a href="tel:+982191010010" className="px-4 py-3 rounded-xl text-sm font-bold text-primary flex items-center gap-2 border-t border-border/40 mt-1">
                <Phone className="h-4 w-4" /> <span dir="ltr">۰۲۱-۹۱۰۱۰۰۱۰</span>
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

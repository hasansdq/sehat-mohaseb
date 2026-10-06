"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Wrench, Package, HelpCircle, Star, Users2,
  PhoneCall, Wand2, UserCog, Settings, ScrollText, Database, Mail,
  LogOut, Menu, X, Home, ShieldCheck, Sparkles, FileCode,
} from "lucide-react";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

const NAV = [
  { group: "نمای کلی", items: [{ href: "/sehat-ad", label: "داشبورد", icon: LayoutDashboard }] },
  { group: "محتوا", items: [
    { href: "/sehat-ad/cms", label: "محتوای لندینگ‌ها", icon: FileCode },
    { href: "/sehat-ad/articles", label: "مقالات", icon: FileText },
    { href: "/sehat-ad/services", label: "خدمات", icon: Wrench },
    { href: "/sehat-ad/packages", label: "بسته‌ها", icon: Package },
    { href: "/sehat-ad/faqs", label: "سوالات متداول", icon: HelpCircle },
    { href: "/sehat-ad/testimonials", label: "نظرات مشتریان", icon: Star },
    { href: "/sehat-ad/team", label: "تیم", icon: Users2 },
  ]},
  { group: "درخواست‌ها", items: [
    { href: "/sehat-ad/consultations", label: "مشاوره‌ها", icon: PhoneCall },
    { href: "/sehat-ad/custom-packages", label: "پک‌های اختصاصی", icon: Wand2 },
    { href: "/sehat-ad/newsletter", label: "خبرنامه", icon: Mail },
  ]},
  { group: "مدیریت", items: [
    { href: "/sehat-ad/users", label: "کاربران", icon: UserCog },
    { href: "/sehat-ad/settings", label: "تنظیمات", icon: Settings },
    { href: "/sehat-ad/logs", label: "گزارش‌ها", icon: ScrollText },
    { href: "/sehat-ad/backups", label: "پشتیبان", icon: Database },
  ]},
];

export function AdminShell({ admin, onLogout, children }: { admin: any; onLogout: () => void; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/sehat-ad" ? pathname === "/sehat-ad" : pathname.startsWith(href));

  const logout = async () => {
    await api("/api/admin/logout", { method: "POST" });
    toast.success("از پنل مدیریت خارج شدید.");
    onLogout();
  };

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      {/* sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-40 w-72 bg-sidebar border-l border-sidebar-border transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-sidebar-border">
          <div className="h-10 w-10 rounded-xl bg-gradient-brand grid place-items-center shadow-glow">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-display font-extrabold text-foreground text-sm">صحت محاسب</div>
            <div className="text-[10px] text-muted-foreground">پنل مدیریت</div>
          </div>
          <button onClick={() => setOpen(false)} className="mr-auto lg:hidden grid place-items-center h-9 w-9 rounded-lg hover:bg-sidebar-accent text-muted-foreground" aria-label="بستن منو">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="h-[calc(100vh-4rem)] overflow-y-auto scrollbar-thin p-3 space-y-5">
          {NAV.map((section) => (
            <div key={section.group}>
              <div className="px-2 mb-1.5 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider">{section.group}</div>
              <div className="space-y-1">
                {section.items.map((it) => {
                  const active = isActive(it.href);
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all group",
                        active
                          ? "bg-gradient-brand text-white shadow-glow"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <it.icon className={cn("h-4.5 w-4.5", active ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                      {it.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* overlay for mobile */}
      {open && (
        <div onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm lg:hidden" />
      )}

      {/* main */}
      <div className="flex-1 lg:mr-72 flex flex-col min-w-0">
        <header className="h-16 sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border flex items-center gap-3 px-4 md:px-6">
          <button onClick={() => setOpen(true)} className="lg:hidden grid place-items-center h-10 w-10 rounded-xl border border-border hover:bg-accent" aria-label="منو">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">سلام،</span>
            <span className="font-bold text-foreground">{admin?.displayName || "مدیر"}</span>
          </div>
          <div className="mr-auto flex items-center gap-2">
            <Link href="/" className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-semibold hover:bg-accent transition-colors">
              <Home className="h-4 w-4" /> مشاهده سایت
            </Link>
            <ThemeToggle />
            <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-sm font-bold text-rose-500 hover:bg-rose-500/20 transition-colors">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

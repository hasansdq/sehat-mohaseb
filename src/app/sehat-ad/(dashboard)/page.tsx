"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, FileText, Wrench, Package, PhoneCall, Wand2, MessageSquare,
  ScrollText, Star, Mail, TrendingUp, ArrowLeft, Clock,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { PageHeader, StatCard, AdminCard, Badge, faDate, EmptyState } from "@/components/admin/ui";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api("/api/admin/dashboard").then((r) => {
      if (r.ok && r.data) setData(r.data);
    });
  }, []);

  if (!data) {
    return <div className="grid place-items-center h-64 text-muted-foreground text-sm">در حال بارگذاری داشبورد...</div>;
  }

  const c = data.counts;
  const stats = [
    { icon: Users, label: "کاربران", value: c.users, color: "primary", href: "/sehat-ad/users" },
    { icon: FileText, label: "مقالات", value: c.articles, color: "amber", href: "/sehat-ad/articles" },
    { icon: Wrench, label: "خدمات", value: c.services, color: "emerald", href: "/sehat-ad/services" },
    { icon: Package, label: "بسته‌ها", value: c.packages, color: "blue", href: "/sehat-ad/packages" },
    { icon: PhoneCall, label: "مشاوره‌ها", value: c.consultations, color: "rose", href: "/sehat-ad/consultations" },
    { icon: Wand2, label: "پک‌های اختصاصی", value: c.customPackages, color: "primary", href: "/sehat-ad/custom-packages" },
    { icon: MessageSquare, label: "پیام‌های هوش مصنوعی", value: c.aiMessages, color: "amber", href: "#" },
    { icon: Mail, label: "خبرنامه", value: c.newsletter, color: "emerald", href: "/sehat-ad/newsletter" },
  ];

  return (
    <div>
      <PageHeader title="داشبورد" desc="نمای کلی موسسه صحت محاسب" />

      {(c.pendingConsultations > 0 || c.pendingCustomPackages > 0) && (
        <div className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <TrendingUp className="h-5 w-5" /> نیاز به پیگیری
          </div>
          <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
            {c.pendingConsultations > 0 && <Link href="/sehat-ad/consultations" className="font-bold text-amber-600 hover:underline">{c.pendingConsultations} مشاوره جدید</Link>}
            {c.pendingCustomPackages > 0 && <Link href="/sehat-ad/custom-packages" className="font-bold text-amber-600 hover:underline">{c.pendingCustomPackages} پک اختصاصی جدید</Link>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <StatCard icon={s.icon} label={s.label} value={s.value} color={s.color} />
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <AdminCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">رشد کاربران (۱۴ روز اخیر)</h3>
            <Badge color="emerald"><TrendingUp className="h-3 w-3 ml-1" /> زنده</Badge>
          </div>
          <div className="h-48 flex items-end gap-1.5">
            {data.growth.map((g: any) => {
              const max = Math.max(...data.growth.map((x: any) => x.count), 1);
              const h = (g.count / max) * 100;
              return (
                <div key={g.date} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full rounded-t-md bg-gradient-to-t from-primary/30 to-primary transition-all hover:from-primary/50 hover:to-primary" style={{ height: `${Math.max(h, 4)}%` }} />
                  <div className="text-[9px] text-muted-foreground/60 -rotate-45 origin-center whitespace-nowrap">{new Date(g.date).getDate()}</div>
                </div>
              );
            })}
          </div>
        </AdminCard>

        <AdminCard>
          <h3 className="font-bold text-foreground mb-4">گزارش‌های اخیر</h3>
          <div className="space-y-2.5 max-h-56 overflow-y-auto scrollbar-thin">
            {data.recentLogs.length === 0 ? <EmptyState icon={ScrollText} title="گزارشی نیست" /> :
              data.recentLogs.map((l: any) => (
                <div key={l.id} className="flex items-center gap-2.5 text-xs">
                  <span className="grid place-items-center h-7 w-7 rounded-lg bg-muted text-muted-foreground flex-shrink-0"><Clock className="h-3.5 w-3.5" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-foreground truncate">{l.action}</div>
                    <div className="text-muted-foreground truncate">{l.actor || "—"}</div>
                  </div>
                  <span className="text-muted-foreground/60 text-[10px] whitespace-nowrap">{faDate(l.createdAt)}</span>
                </div>
              ))
            }
          </div>
        </AdminCard>

        <AdminCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">کاربران جدید</h3>
            <Link href="/sehat-ad/users" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:gap-2 transition-all">
              همه کاربران <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-right text-xs text-muted-foreground border-b border-border">
                  <th className="pb-2 font-semibold">کاربر</th>
                  <th className="pb-2 font-semibold">موبایل</th>
                  <th className="pb-2 font-semibold">تاریخ</th>
                  <th className="pb-2 font-semibold">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {data.recentUsers.map((u: any) => (
                  <tr key={u.id} className="border-b border-border/40">
                    <td className="py-2.5 flex items-center gap-2">
                      <span className="grid place-items-center h-8 w-8 rounded-lg bg-primary/10 text-primary font-bold">{(u.fullName || "ک").charAt(0)}</span>
                      <span className="font-semibold text-foreground">{u.fullName || "—"}</span>
                    </td>
                    <td className="py-2.5 text-muted-foreground" dir="ltr">{u.mobile}</td>
                    <td className="py-2.5 text-muted-foreground text-xs">{faDate(u.createdAt)}</td>
                    <td className="py-2.5"><Badge color={u.status === "ACTIVE" ? "emerald" : "rose"}>{u.status === "ACTIVE" ? "فعال" : "غیرفعال"}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">مشاوره‌های اخیر</h3>
            <Link href="/sehat-ad/consultations" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:gap-2 transition-all">
              همه <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {data.recentConsultations.length === 0 ? <EmptyState icon={PhoneCall} title="مشاوره‌ای نیست" /> :
              data.recentConsultations.map((co: any) => (
                <div key={co.id} className="rounded-xl border border-border/60 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-foreground text-sm">{co.topic || "مشاوره عمومی"}</div>
                    <Badge color={co.status === "NEW" ? "blue" : co.status === "DONE" ? "emerald" : "amber"}>{co.status === "NEW" ? "جدید" : co.status === "DONE" ? "تکمیل" : "پیگیری"}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{co.name} • {co.mobile}</div>
                </div>
              ))
            }
          </div>
        </AdminCard>
      </div>
    </div>
  );
}

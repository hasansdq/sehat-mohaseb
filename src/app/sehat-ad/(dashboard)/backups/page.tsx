"use client";

import { useEffect, useState } from "react";
import { Database, Loader2, Plus, Trash2, ShieldCheck, Clock } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { PageHeader, AdminCard, EmptyState, faDate, Badge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";

type B = { id: string; name: string; size: number | null; kind: string; path: string | null; createdAt: string };

export default function BackupsPage() {
  const [items, setItems] = useState<B[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await api<{ items: B[] }>("/api/admin/backups");
    if (r.ok && r.data) setItems(r.data.items);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    setCreating(true);
    const r = await api("/api/admin/backups", { method: "POST" });
    setCreating(false);
    if (r.ok) { toast.success("پشتیبان ساخته شد."); load(); } else toast.error(r.error || "خطا.");
  };
  const remove = async (id: string) => {
    if (!confirm("این پشتیبان حذف شود؟")) return;
    const r = await api(`/api/admin/backups?id=${id}`, { method: "DELETE" });
    if (r.ok) { toast.success("حذف شد."); load(); } else toast.error(r.error);
  };

  const fmtSize = (b: number | null) => {
    if (!b) return "—";
    if (b < 1024) return `${b} B`;
    if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1048576).toFixed(1)} MB`;
  };

  return (
    <div>
      <PageHeader title="پشتیبان‌گیری" desc="مدیریت نسخه‌های پشتیبان دیتابیس" action={
        <Button onClick={create} disabled={creating} className="bg-gradient-brand text-white shadow-glow rounded-xl">
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 ml-1" />}
          {creating ? "در حال ساخت..." : "پشتیبان جدید"}
        </Button>
      } />
      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <AdminCard className="flex items-center gap-3">
          <div className="grid place-items-center h-12 w-12 rounded-2xl bg-emerald-500/15 text-emerald-600"><ShieldCheck className="h-6 w-6" /></div>
          <div><div className="text-sm text-muted-foreground">کل نسخه‌ها</div><div className="font-display text-2xl font-black text-foreground">{items.length.toLocaleString("fa-IR")}</div></div>
        </AdminCard>
        <AdminCard className="flex items-center gap-3 lg:col-span-2">
          <div className="grid place-items-center h-12 w-12 rounded-2xl bg-primary/15 text-primary"><Database className="h-6 w-6" /></div>
          <div><div className="text-sm text-muted-foreground">دیتابیس فعال</div><div className="font-bold text-foreground text-sm">SQLite • محلی</div></div>
        </AdminCard>
      </div>
      <AdminCard className="!p-0 overflow-hidden">
        {loading ? <div className="p-10 text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> در حال بارگذاری...</div> :
         items.length === 0 ? <EmptyState icon={Database} title="پشتیبانی نیست" desc="اولین پشتیبان را بسازید." /> :
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40"><tr className="text-right text-xs text-muted-foreground">
                <th className="p-3 font-semibold">نام</th><th className="p-3 font-semibold">نوع</th><th className="p-3 font-semibold">حجم</th><th className="p-3 font-semibold">زمان</th><th className="p-3 font-semibold">عملیات</th>
              </tr></thead>
              <tbody>
                {items.map((b) => (
                  <tr key={b.id} className="border-t border-border/40 hover:bg-muted/20">
                    <td className="p-3 font-bold text-foreground" dir="ltr">{b.name}</td>
                    <td className="p-3"><Badge color={b.kind === "auto" ? "blue" : "primary"}>{b.kind === "auto" ? "خودکار" : "دستی"}</Badge></td>
                    <td className="p-3 text-muted-foreground">{fmtSize(b.size)}</td>
                    <td className="p-3 text-muted-foreground text-xs">{faDate(b.createdAt)}</td>
                    <td className="p-3"><button onClick={() => remove(b.id)} className="grid place-items-center h-8 w-8 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
      </AdminCard>
    </div>
  );
}
